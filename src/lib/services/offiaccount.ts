import { getOfficialAccountScanKey, setItem } from "lib/cache";
import { findOrCreateMtbirdUserByWechatUser, findWechatUserInfo } from "./wx";
import { buildLoginJWT } from "./auth";
import prisma from "lib/prisma";

const parseOfficialAccountScene = (qrSceneStr: string) => {
  try {
    if (!qrSceneStr) return;
    const scene = JSON.parse(qrSceneStr);
    if (scene?.id) {
      return scene;
    }
  } catch (error) {}
};

export const offiaccountCallbackHandler = async (event: string, eventKey: string, userinfo: any) => {
  if (event === "subscribe")  {
    return await offiAccountSubscribeHandler(userinfo, userinfo.qr_scene_str);
    
  }

  if (event === "SCAN") {
    return await offiAccountSubscribeHandler(userinfo, eventKey);
  }

  // if (event === "SCAN") {
  //   await offiAccountScanHandler(userinfo, eventKey);
  //   return "登录成功";
  // }
};

export const offiAccountSubscribeHandler = async (userinfo: any, sceneStr: string) => {
  const sceneObj = parseOfficialAccountScene(sceneStr);
  if (!sceneObj?.id) return;

  const { registryInfo, to } = sceneObj.scene || {};
 
  const user = await findOrCreateMtbirdUserByWechatUser(
    userinfo,
    "",
    {
      tag: to,
      way: '关注公众号'
    },
    registryInfo,
    {
      openid: userinfo.openid,
    }
  );

  if (!user) return;

  const token = await buildLoginJWT(user.id, to);
	console.log(token, user)
	await setItem(
		getOfficialAccountScanKey(sceneObj.id),
		JSON.stringify({ user, token }),
		6000
	);

  await prisma.userLoginLog.create({
    data: {
      userId: user.id,
      loginMethod: "offiaccount",
    },
  });

  return "👋嗨，终于等到你！\n\n星搭AI是国内领先的AI内容创意平台\n\n可以帮你生成：公众号文章、小红书笔记、抖音短视频、摄影作品、动漫图、产品图、广告视频、报告汇报、论文解读\n\n为内容创作者、营销人员、MCN公司及网红达人 定制三千款不同能力的AI助理，使用专业数据优化，让你的内容创作变得无比简单！\n\n星搭AI数字员工定制服务，使用AI替代重复性工作，让AI成为你的新生产力！\n\n⬇️ 加入“星搭AIGC日报社”社群 ⬇️\n\n获取使用教程、最新AIGC研究成果、新产品及行业应用案例，添加微信：tunshu_xinmei\n\n⬇️ 免费体验AI ⬇️\nhttps://staringai.com";
};

/** 扫描公众号二维码 */
export const offiAccountScanHandler = async (userInfo: any, sceneStr: string) => {
  console.log(userInfo, sceneStr)
  // 已注册
  if (userInfo.subscribe === 1 && userInfo.unionid) {
    const user = await findWechatUserInfo(userInfo.unionid);


    if (!user) return;
    const scene = parseOfficialAccountScene(sceneStr);
    if (!scene.id) return;

    const token = await buildLoginJWT(user.user.id, scene.to);

		console.log(token, user)
    await setItem(
      getOfficialAccountScanKey(scene.id),
      JSON.stringify({ user, token }),
      6000
    );
  }
};
