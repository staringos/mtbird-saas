import { generateKeys } from "@mtbird/core";
import { generateResponse } from "lib/response";
import { generateVerifyCode, sendMsgToBot } from "lib/sendMsg";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../prisma";
import requestIp from "request-ip";
import { IRegistryInfo } from "@/types/entities/User";
import { Prisma, User } from "@prisma/client";
import { randomString } from "@/utils/index";
import { getItem, getUserAccessIdentifierKey, setItem, getUserPlatformAccessIdentifierKey } from "lib/cache";
import { BRAND_NAME } from "@/utils/constants";
import { getApplicationAiToken } from "./app";

const jwt = require("jsonwebtoken");

export const register = async (
  req: NextApiRequest | string,
  basicInfo: {
    phone?: string,
    nickname?: string,
    userID?: string,
  },
  tag?: string | { tag?: string, way?: string },
  registryInfo?: IRegistryInfo
) => {

  basicInfo = {...basicInfo};
  if (!basicInfo.nickname) {
    basicInfo.nickname = "New User " + generateVerifyCode();
  }

  const teamID = generateKeys();
  const userID = basicInfo.userID || generateKeys();
  delete basicInfo.userID;
  const appId = generateKeys();

  const userData: Record<string, any> = {
    id: userID,
    ...basicInfo,
    registeredIp: typeof req === 'string' ? req : requestIp.getClientIp(req),
    // registryInfo: registryInfo as Prisma.JsonObject
  }

  if (registryInfo) {
    userData.registryInfo =  registryInfo as Prisma.JsonObject
  }
  
  const user = prisma.user.create({
    data: userData,
  });

  const team = prisma.team.create({
    data: {
      id: teamID,
      name: "个人团队",
      desc: "",
      avatar: process.env.DEFAULT_TEAM_IMAGE,
      creatorId: userID,
    },
  });

  const teamMember = prisma.teamMember.create({
    data: {
      type: 1,
      memberId: userID,
      teamId: teamID,
    },
  });

  const app = prisma.application.create({
    data: {
      id: appId,
      teamId: teamID,
      name: "我的应用",
      creatorId: userID,
    },
  });

  const result = await prisma.$transaction([user, team, teamMember, app]);

  try {
    const from = registryInfo?.f
    const introducer = registryInfo?.userIntroducer;
    const nativeIos = registryInfo?.nativeIos;

    let str: string[] = [];
    from && str.push(`f: ${from}`);
    if (introducer) {
      const user = await prisma.user.findFirst({
        where: {
          id: introducer
        }
      })
      str.push(`introducer: ${user?.nickname || user?.phone || introducer}`);
    }
   

    if (typeof tag === 'object' && tag.tag && tag.way) {
      sendMsgToBot(`👨‍💻 [新用户] ${basicInfo.phone || basicInfo.nickname} | Action: ${tag.tag || "注册"} | ${tag.way} | ${str.join(' | ')} native: ${nativeIos || false}`);
    }  else {
      sendMsgToBot(`👨‍💻 [新用户] ${basicInfo.phone || basicInfo.nickname} Action: ${tag || "注册"} ${str.length ? '|' : ''} ${str.join(' | ')} native: ${nativeIos || false}`);
    }
  } catch (error) {
    
  }
  
  return {
    ...result[0],
    Team: [team],
  };
};

const { verify } = require("jsonwebtoken");

export const isRequestLogined = (
  req: NextApiRequest,
  res: NextApiResponse,
  notloginOnly: boolean,
  handler: any
) => {
  const authorization = req.headers["authorization"];
  if (!authorization && !notloginOnly) {
    res.status(401).send("Please login");
    return false;
  }
  if (!authorization && notloginOnly) {
    handler(req, res, undefined, undefined);
    return false;
  }

  console.log(process.env.JWT_SECRET, ',process.env.JWT_SECRET')

  const token = (authorization as string).split(" ")[1];
  const authData = verify(token, process.env.JWT_SECRET);

  if (!authData.userId && !notloginOnly) {
    res.status(401).send(generateResponse(401, "Login expired"));
    return false;
  }

  return authData;
};


export const buildLoginJWT = async (
  userId: string,
  to?: string,
  appId?: string,
  isMp?: boolean,
  _payload?: any
) => {
  const payload = { userId, v: randomString(5), ...(_payload || {}) } as any;
  if (appId) payload.appId = appId;

  if (to) {
    if (to.startsWith("apps/")) {
      payload.appPath = to.replace(/^apps\//, '');
    }
  } else {
    // await setItem(getUserAccessIdentifierKey(userId), payload.v, 604800);
  }

  const app = to ? await prisma.application.findUnique({
    where: {
      id: to,
    },
    include: {
      applicationLoginConfig: true,
    },
  }) : null;

  const secret = app?.applicationLoginConfig?.secret || process.env.JWT_SECRET;

  console.log(secret, '<<<<secret')
  return jwt.sign(payload, secret, {
    expiresIn: "7d",
  });
};

/** 
 * 检测账号是否多端登录
 * 如果请求时没有携带 accessIdentifier，则认为token可用(兼容服务端直接签名发起的请求)
 * 如果携带了 accessIdentifier，需要判断
 *  `user:${userId}:accessIdentifier`
 *  `user:${userId}:platform:accessIdentifier`
 *  中是否有相同的 accessIdentifier，如果有，则认为是一个用户，
 *  如果没有，认为是新登录了
 */
export const validateSessionByAccessIdentifier = async (
  userId: string,
  accessIdentifier?: string
) => {
  console.log(accessIdentifier, userId);
  if (!accessIdentifier) return true;

  const identifier = await getItem(getUserAccessIdentifierKey(userId));

  if (identifier && accessIdentifier === identifier) return true;

  let idMap = await getItem(getUserPlatformAccessIdentifierKey(userId));

  try {
    idMap = JSON.parse(idMap);
  } catch (error) {
    idMap = {};
  }
  console.log(idMap)
  for (const key in idMap as Record<string, string>) {
    if (idMap[key] === accessIdentifier) return true;
  }

  return false;
};