import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import { isWechat, requestWechatAuthorize } from "../weixin";
import { weixinBind } from "apis";

const useWechatAuthorize = () => {
  const router = useRouter();
	const [isReady, setIsReady] = useState(false);
  const [openId, setOpenId] = useState("");
  const isResetUrlRef = useRef(false);
  const requestAuthorizeRef = useRef(false);


  useEffect(() => {
    !isResetUrlRef.current && !requestAuthorizeRef.current && requestAuthorize();
  }, [router.query]);

  const onAuthorize = async () => {
    // location.href = requestWechatAuthorize(location.href);
    location.replace(requestWechatAuthorize(location.href));
  };

  const resetUrl = () => {
    const url = new URL(location.href);
    url.searchParams.delete("code");
    url.searchParams.delete("state");

    history.replaceState(null, "", url.toString());
    isResetUrlRef.current = true;
  };

  const requestAuthorize = async () => {

		if (!router.isReady) return;
    if (isResetUrlRef.current) return;
    requestAuthorizeRef.current = true;

    if (!router.query?.code || !router.query?.state) {
			setIsReady(true);
      return;
    }
    const { code, state } = router.query;

    try {
      setIsReady(false);
      const result = await weixinBind(code as string, state as string);
      resetUrl();
      setOpenId(result.data.openId);
    } catch (error: any) {
    } finally {
      setTimeout(() => {
        setIsReady(true);
      }, 0)
    }
  };

	return {
		onAuthorize,
		openId,
		isReady
	}
};

export default useWechatAuthorize;
