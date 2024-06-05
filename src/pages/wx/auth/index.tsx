import React, { useEffect, useState } from "react";

import styles from "./style.module.less";
import { isWechat, requestWechatAuthorize } from "@/utils/weixin";
import { Button, ConfigProvider, Spin } from "antd";
import { useRouter } from "next/router";
import { observer } from "mobx-react-lite";
import { useStore } from "store";
import { weixinBind } from "apis";

const WeixinAuth = observer(() => {
	const router = useRouter();
	const store = useStore();
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (typeof window === 'undefined') return;
		if (!router.isReady) return;

		if (isWechat()) return;

		if (!router.query.redirectUrl) {
			location.href = location.origin;
			return;
		}

		redirect('error', 'not in wechat')

	}, [router.isReady, router.query.redirectUrl, store]);

	useEffect(() => {
		const init = async () => {
			setLoading(true);
			await store.getUserInfo();
			setLoading(false);
			requestAuthorize();
		}
		init();
	}, [router.query]);

	const onAuthorize = async () => {
		// location.href = requestWechatAuthorize(location.href);
		location.replace(requestWechatAuthorize(location.href))
	}

	const resetUrl = () => {
		const url = new URL(location.href)
		url.searchParams.delete('code');
		url.searchParams.delete('state');

		history.replaceState(null, '', url.toString());
	}

	const requestAuthorize = async () => {
		if (!router.query?.code || !router.query?.state) {
			return;
		}
		const { code, state } = router.query;

		try {
			setLoading(true);
			const result = await weixinBind(
				code,
				state,
			);
			resetUrl();
			redirect('success', '', {
				openId: result.data.openId
			})
		} catch (error) {
			redirect('error', error.message)
		} finally {
			setLoading(false);
		}
	};

	const redirect = (status: string, msg: string, restQuery?: any) => {

		if (!router.query.redirectUrl) return;
		const url = new URL(decodeURIComponent(router.query.redirectUrl as string) as string)
		url.searchParams.set('status', status);
		url.searchParams.set('msg', msg || '');

		if (restQuery) {
			url.searchParams.set('openId', restQuery.openId)
		}

		// location.href = url.toString();
		location.replace(url.toString())
	}

  return (
    <div className={styles.weixinAuth}>
      <picture>
        <img
          alt="logo"
          className={styles.logo}
          src="https://mtbird-cdn.staringos.com/4716001016-1021615-43150-1221114-151301365711150133.png"
        />
      </picture>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#3340e7",
          },
        }}
      >
        <Spin spinning={loading}>
					<div className={styles.operation}>
						<Button onClick={() => history.back()}>返回</Button>
						<Button type="primary" onClick={onAuthorize}>微信授权</Button>
					</div>
				</Spin>
      </ConfigProvider>
    </div>
  );
});

export default WeixinAuth;
