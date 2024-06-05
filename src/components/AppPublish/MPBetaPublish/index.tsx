import React, { useEffect, useState } from "react";
import { Button, Typography, Alert, message, Spin } from "antd";
import { useStore } from "store";
import BindWechat from "../../BindWechat";
import {
  registerBetaMP,
  getWxBetaFastApp,
  processCheck,
  commitCode,
} from "apis/wx";
import QRCode from "qrcode";
import styles from "./style.module.less";
import { urlencode } from "../../../utils";
import { observer } from "mobx-react-lite";

const { Title } = Typography;

const MPStageTitle = {
  1: "确认绑定微信，为试用小程序管理员",
  2: "微信扫码，授权小程序",
  3: "授权成功，正在生成试用小程序...",
  4: "试用小程序生成成功",
};

const MPBetaPublish = observer(() => {
  const { userInfo, currentAppId } = useStore();
  const [mpStage, setMPStage] = useState(1);
  const [authorizeUrl, setAuthorizeUrl] = useState<string | undefined>();
  const [qrcodeUrl, setQRCodeUrl] = useState<string | undefined>();
  const [curInterval, setCurInterval] = useState<
    ReturnType<typeof setInterval> | undefined
  >();
  const [isUploadCodeManually, setIsUploadCodeManually] = useState(false);

  const init = async () => {
    try {
      const wxMpRes = await getWxBetaFastApp(currentAppId!);

      // 上次上传流程被打断，手动上传代码
      switch (wxMpRes.data.status) {
        case "registedBeta":
          setMPStage(3);
          setIsUploadCodeManually(true);
          break;
        case "pushedBeta":
          setMPStage(4);
          handlePushedSuccess();
          break;
      }
    } catch (e) {}
  };

  const handleGenerateBetaMP = async () => {
    try {
      const res = await registerBetaMP(currentAppId!);
      const { authorizeUrl, uniqueId } = res.data;

      if (!authorizeUrl) return message.warning(res.msg);
      console.log("[registerBetaMP]:", res);
      setAuthorizeUrl(authorizeUrl);
      setMPStage(2);
      QRCode.toDataURL(authorizeUrl).then((res) => {
        setQRCodeUrl(res);
        console.log(res);
      });

      const interval = setInterval(async () => {
        const wxMpRes = await getWxBetaFastApp(currentAppId!);

        switch (wxMpRes.data.status) {
          case "registedBeta":
            if (mpStage !== 3) setMPStage(3);
            break;
          case "pushedBeta":
            setMPStage(4);
            clearInterval(interval as ReturnType<typeof setInterval>);
            setCurInterval(undefined);
            handlePushedSuccess();
            break;
        }
      }, 3 * 1000);

      setCurInterval(interval);
    } catch (e: any) {
      message.error(e.message);
    }
  };

  useEffect(() => {
    init();

    return () => {
      curInterval &&
        clearInterval(curInterval as ReturnType<typeof setInterval>);
    };
  }, []);

  const handlePushedSuccess = async () => {
    const qrcodeRes = await processCheck(currentAppId!);
    // const url = `${process.env.NEXT_PUBLIC_WX_API_URL}/wxa/get_qrcode?access_token=${atRes.data.ak}&path=${urlencode('pages/index/index')}`
    setQRCodeUrl(qrcodeRes.data.qrcodeUrl);
  };

  const handleUploadCode = async () => {
    const res = await commitCode(currentAppId!);
    console.log("rse:", res);
    setMPStage(4);
    handlePushedSuccess();
  };

  return (
    <div className={styles.appPublishWrapper}>
      <Title level={5}>{(MPStageTitle as any)[mpStage]}</Title>
      <br />
      {mpStage === 1 && (
        <div>
          <Alert
            message="发布试用小程序需绑定微信，该微信作为小程序的默认管理员"
            type="warning"
            showIcon
            closable
          />
          <br />
          <BindWechat />
        </div>
      )}
      <br />
      {mpStage === 1 && (
        <Button type="primary" onClick={handleGenerateBetaMP}>
          确认管理员
        </Button>
      )}

      {(mpStage === 2 || mpStage === 4) && (
        <img className={styles.qrcode} src={qrcodeUrl} />
      )}

      {mpStage === 3 && !isUploadCodeManually && <Spin />}

      {mpStage === 3 && isUploadCodeManually && (
        <Button type="primary" onClick={handleUploadCode}>
          手动上传代码
        </Button>
      )}
    </div>
  );
});

export default MPBetaPublish;
