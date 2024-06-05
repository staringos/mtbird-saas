import React, { useEffect, useState } from "react";
import { Layout } from "antd";
import Header from "../components/Header";
import styles from "./style.module.less";
import Loading from "@/components/Loading";
import { useStore } from "store";
import throttle from "lodash/throttle";
import { observer } from "mobx-react-lite";
import keys from "lodash/keys";
import TemplateSaveModal, {
  MODAL_NAME as TEMPLATE_SAVE_MODAL_NAME,
} from "../modals/TemplateSaveModal";
import ServicesButton from "../components/ServicesButton";

interface IProps {
  children: any;
  loading?: boolean;
  hideHeader?: boolean;
}

// const {Footer} = Layout

const LayoutComponent = observer(({ children, hideHeader }: IProps) => {
  const [isClient, setIsClient] = useState(false);
  const { getUserInfo } = useStore();
  const { modals, initModals } = useStore();
  const [loading, setLoading] = useState(true);

  const init = async () => {
    setLoading(true);
    await getUserInfo();
    setLoading(false);
  };

  useEffect(
    throttle(() => {
      init();
    }, 2000),
    []
  );

  const MODALS = {
    [TEMPLATE_SAVE_MODAL_NAME]: <TemplateSaveModal />,
  };

  useEffect(() => {
    initModals(MODALS);
  }, []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Layout className={styles.container}>
      {isClient && !hideHeader && <Header />}

      <Layout className={styles.mainContent} style={{ display: "flex" }}>
        {loading ? <Loading /> : children}
      </Layout>
      {keys(MODALS).map((key) => {
        return modals[key] && MODALS[key];
      })}

      <ServicesButton />
      {/* <Footer className={styles.footerContainer}>精卫 - 低代码平台 | Power by 星搭科技</Footer> */}
    </Layout>
  );
});

export default LayoutComponent;
