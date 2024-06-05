import {
  Layout,
  Typography,
  Form,
  message,
  Spin,
  Modal,
  Descriptions,
  Radio,
  Button,
  Space,
  QRCode,
} from "antd";
import Head from 'next/head'
import { AUTH_TOKEN } from "utils/constants";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  getOrder,
  planPay,
} from "apis/order";

import {
  ExclamationCircleOutlined,
  LeftOutlined,
} from "@ant-design/icons";
import styles from "./style.module.less";
import { isMobile, nativeIos } from "utils";

import { isWechat } from "utils/weixin"
import useWechatAuthorize from "utils/hooks/useWechatAuth"
import { RechargePlan } from "types/entities/Order";
import clsx from "@/utils/clsx";
import { GetServerSideProps } from "next";
import { getAllowRechargePlanByPlatform, getPlatformPaymentConfig } from "lib/services/rechargePlan";
import { type PlatformPaymentConfig } from "@prisma/client";
import * as cookie from "cookie";

const { Title, Text } = Typography;

const OrderPayWay = {
  alipay: "alipay", // 支付宝
  wechat: "wechat", // 微信
  transfer: "transfer", // 对公转账
};

type Device = "h5" | "pc" | "native";

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  const platformId = Number(context.query.platformId);

  let token = '';
  if (context.query.t) {
    token = context.query.t as string;
  } else {
    const parsedCookies = cookie.parse(context.req.headers.cookie || "");
    token = parsedCookies.t || '';
  }

  let userId;
  if (token) {
    try {
      const { verify, sign } = require("jsonwebtoken");
      const authData = verify(token, process.env.JWT_SECRET);
      if (authData && authData.userId) {
        userId = authData.userId;
      }
    } catch (err) {
    }
  }

  const planList = await getAllowRechargePlanByPlatform(platformId, userId);
  planList.forEach(item => {
    (item as any).price = item.price.toNumber();
    (item as any).originalPrice = item.originalPrice.toNumber();
  })

  const defaultProps = {
    props: {
      platformPaymentConfig: await getPlatformPaymentConfig(platformId),
      rechargePlanList: planList,
      token: token || '',
    },
  };

  if (token) {
    const cookieStr = cookie.serialize("t", token, {
      path: "/",
    });
    context.res.setHeader("Set-Cookie", cookieStr)
  }

  return defaultProps;
};

type Props = {
  token?: string;
  platformPaymentConfig?: PlatformPaymentConfig & {
    layoutConfig?: {
      title?: string;
      subtitle?: string;
      bottomImage?: string;
      banner?: string;
      planCardStyle?: 'default' | 'Days'
    };
  };
  rechargePlanList?: RechargePlan[]
};

const Goods = ({ platformPaymentConfig, rechargePlanList, token }: Props) => {
  const router = useRouter();
  useState(() => {
    if (typeof window === 'undefined') return;
    
    // const search = new URLSearchParams(location.search);
    const url = new URL(location.href);
    token && localStorage.setItem(AUTH_TOKEN, token);
    url.searchParams.delete('t');
    router.replace(url.toString())
  })
  const [loading, setLoading] = useState(false);
  const [rechargePlan, setRechargePlan] = useState<RechargePlan | undefined>(rechargePlanList?.[0]);
  const currentOrderIdRef = useRef<string>();
  const { 
    onAuthorize,
		openId,
		isReady
   } = useWechatAuthorize();
   
  const [wechatH5PaymentInfo, setWechatH5PaymentInfo] = useState<{
    url: string;
    open: boolean;
    orderId: string;
  }>();


  useEffect(() => {
    if (isWechat() && !openId && isReady) {
      setTimeout(() => {
        onAuthorize();
      }, 300);
    }
  }, [isReady, openId])

  // useEffect(() => {
  //   if (!router.isReady) return;
  //   if (isWechat() && !openId) {
  //     // window.open(`${process.env.NEXT_PUBLIC_HOST}/wx/auth?redirectUrl=${location.href}`, '_self')
  //     location.replace(`${process.env.NEXT_PUBLIC_HOST}/wx/auth?redirectUrl=${location.href}`)
  //   }
  // }, [openId, router.isReady])


  const wechatPayAfter = (data: any, device: Device) => {
    if (!isWechat()) {
      if (device === "pc") {
        setWechatH5PaymentInfo({
          url: data.url,
          open: true,
          orderId: data.orderId,
        });
      } else if (device === "h5") {
        location.href = data.url;
      }
    }

    if (typeof WeixinJSBridge === "undefined") {
      if (document.addEventListener) {
        // 监听调用，可有可无
        document.addEventListener(
          "WeixinJSBridgeReady",
          () => {
            onBridgeReady(data.url);
          },
          false
        );
      }
    } else {
      onBridgeReady(data.url);
    }
  };

  const alipayAfter = (url: string) => {
    setTimeout(() => {
      window.open(url, "_blank");
    }, 0);
    Modal.confirm({
      icon: <ExclamationCircleOutlined />,
      title: "支付是否成功？",
      onOk() {
        redirectToReturnUrl();
      },
      okText: "支付成功",
      cancelText: "支付失败",
    });
  }

  const redirectToReturnUrl = () => {
    currentOrderIdRef.current && getOrderDetail(currentOrderIdRef.current).then(order => {
      if (order?.returnUrl) {
        location.href = order.returnUrl
      } else {
        history.back();
      }
    })
  }

  const onBridgeReady = (options: any) => {
    setLoading(true);
    WeixinJSBridge.invoke(
      "getBrandWCPayRequest",
      {
        appId: options.appId, //公众号ID，由商户传入
        timeStamp: options.timeStamp, //时间戳，自1970年以来的秒数
        nonceStr: options.nonceStr, //随机串
        package: options.package,
        signType: "RSA", //微信签名方式
        paySign: options.paySign, //微信签名
      },
      function (res: any) {
        setLoading(false);
        if (res.err_msg == "get_brand_wcpay_request:ok") {
          // 使用以上方式判断前端返回,微信团队郑重提示：
          //res.err_msg将在用户支付成功后返回ok，但并不保证它绝对可靠。
          // router.push("/");
          redirectToReturnUrl();
        } else {
          message.error("支付失败，请重新付款！");
          // router.push("/");
        }
      }
    );
  };

  useEffect(() => {
    if (!wechatH5PaymentInfo?.open || !wechatH5PaymentInfo.orderId) return;

    const timer = setInterval(() => {
      getOrder(wechatH5PaymentInfo.orderId).then((res) => {
        console.log(res);
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [wechatH5PaymentInfo?.open, wechatH5PaymentInfo?.orderId]);

  const layoutConfig = useMemo(
    () => platformPaymentConfig?.layoutConfig,
    [platformPaymentConfig?.layoutConfig]
  );

  const isInWechat = isWechat();

  const onPay = (payWay: "wechat" | "alipay") => {
    if (!rechargePlan?.id) return;
    if (isWechat() && !openId && isReady) {
      // window.open(`${process.env.NEXT_PUBLIC_HOST}/wx/auth?redirectUrl=${location.href}`, '_self')
      location.replace(`${process.env.NEXT_PUBLIC_HOST}/wx/auth?redirectUrl=${location.href}`)
    }
    const device =  (isMobile() || nativeIos ? "h5" : "pc");

    planPay(rechargePlan.id, payWay, device, openId as string).then((res) => {
      if (res.code === 200) {
        currentOrderIdRef.current = res.data.orderId;

        if (res.data.isFree) {
          location.href = res.data.url;
          return;
        }

        if (payWay === OrderPayWay.alipay) {
          return alipayAfter(res.data.url);
        } else {
          return wechatPayAfter(res.data, nativeIos ? "h5" : device);
        }
      } else {
        message.error(res.msg || "支付失败，请尝试其他支付方式或稍后再试");
      }
    });
  };

  const getOrderDetail = (orderId: string) => {
    setLoading(true);
    return getOrder(orderId).then((res) => {
      if (res.code === 200) {
        return res.data
      }
      return null
    }).then(order => {
      setLoading(false);
      return order
    });
  }

  // if (loading) return <Spin />;

  return (
    <Layout className={clsx(styles.layout, { [styles.nativeIos]: true })}>
      {/*  */}
      <Head>
        <title>{layoutConfig?.title || '充值'}</title>
        <meta
          content="width=device-width, height=device-height, initial-scale=1,maximum-scale=1,user-scalable=0,viewport-fit=cover"
          name="viewport"
        />
      </Head>
      <Spin spinning={loading}>
      <div className={styles.header}>
        <div>
          <LeftOutlined onClick={() => {
            if (platformPaymentConfig?.returnUrl) {
              return location.href = platformPaymentConfig.returnUrl;
            }
            history.back()
          }} />
        </div>
        <div>{layoutConfig?.title || "充值"}</div>
        <div></div>
      </div>
      {layoutConfig?.banner && <div className={styles.banner}>
        <img src={layoutConfig?.banner} />
      </div>}
      <div className={styles.subtitle}>{layoutConfig?.subtitle}</div>
      <div className={styles.planContainer}>
        {rechargePlanList?.map((item) => {
          const PlanCard = layoutConfig?.planCardStyle === 'Days' ? DaysPlanCard : DefaultPlanCard;

          return (
            <PlanCard key={item.id} item={item} onCardClick={(plan) => setRechargePlan(plan)} selectedPlan={rechargePlan} />
          );
        })}
      </div>
      <div className={styles.payContainer}>
        {isInWechat && (
          <div
            className={styles.payButton}
            onClick={() => onPay(isInWechat ? "wechat" : "alipay")}
          >
            立即支付
          </div>
        )}
        {!isInWechat && (
          <div className={styles.payWayContainer}>
            <div
              className={clsx(styles.pay, styles.aliPay)}
              onClick={() => onPay("alipay")}
            >
              <i />
              支付宝
            </div>
            <div
              className={clsx(styles.pay, styles.wechatPay)}
              onClick={() => onPay("wechat")}
            >
              <i />
              微信支付
            </div>
          </div>
        )}
      </div>

      {layoutConfig?.bottomImage && (
        <div className={styles.bottomImg}>
          <img src={layoutConfig?.bottomImage} />
        </div>
      )}
      <Modal
        open={wechatH5PaymentInfo?.open}
        footer={null}
        onCancel={() => {
          setWechatH5PaymentInfo({
            open: false,
            url: "",
            orderId: "",
          });
        }}
        className={styles.wechatQrcodeModal}
      >
        <QRCode value={wechatH5PaymentInfo?.url || ""}></QRCode>
        <p className={styles.payTip}>使用微信扫码支付</p>
      </Modal>
      </Spin>
    </Layout>
  );
};

type PlanCardProps = { item: RechargePlan, selectedPlan?: RechargePlan, onCardClick: (p: RechargePlan) => void };
const DefaultPlanCard = ({ item, selectedPlan, onCardClick }: PlanCardProps) => {
  return (
    <div
      className={clsx(styles.planItem, {
        [styles.planItemSelected]: item.id === selectedPlan?.id,
      })}
      onClick={() => {
        onCardClick(item);
      }}
    >
      <span className={styles.value}>
        <i /> x {item.value}
      </span>
      <span className={styles.name}>{item.name}</span>
      <div className={styles.price}>¥ {item.price}</div>
    </div>
  )
}

export const DaysPlanCard = ({ item, selectedPlan, onCardClick }: PlanCardProps) => {
  return (
    <div
      className={clsx(styles.daysPlanItem, {
        [styles.planItemSelected]: item.id === selectedPlan?.id,
      })}
      onClick={() => {
        onCardClick(item);
      }}
    >
      <span className={styles.value}>
        {item.name}
      </span>
      {/* <span className={styles.name}>{item.name}</span> */}
      <div className={styles.price}>¥ {item.price}</div>
      <div className={styles.originalPrice}>¥ {item.originalPrice}</div>
    </div>
  )
}

export default Goods;
