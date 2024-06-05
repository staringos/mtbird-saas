import React, { useEffect, useState } from "react";
import ManagerLayout from "layout/ManagerLayout";
import { Typography, Spin, Button, Result } from "antd";
import { getOrder } from "apis/order";
import { useRouter } from "next/router";
import { IOrderDTO } from "types/entities/Order";
import { observer } from "mobx-react-lite";
import { TEAM_VERSIONS_DICT } from "@/utils/constants";

const { Title } = Typography;

const PayPage = observer(() => {
  const router = useRouter();
  const { ciphertext, associated_data, nonce, key } = router.query;
  const [loading, setLoading] = useState(false);
  const { id } = router.query;
  const [order, setOrder] = useState<IOrderDTO | undefined>(undefined);

  const init = async () => {
    if (!id) return;
    setLoading(true);
    const res = await getOrder(id);

    // const res = await refreshOrderPayStatus(id, ciphertext, associated_data, nonce, key)
    setOrder(res.data);
    setLoading(false);
  };

  useEffect(() => {
    init();
  }, [id]);

  // if (loading) return <Spin />
  // if (!order) return <div>订单未找到!</div>

  return (
    <ManagerLayout type="team">
      <Spin spinning={loading}>
        {order?.status === "paid" && (
          <Result
            status="success"
            title="支付成功!"
            subTitle={`您已成功订购星搭 ${
              TEAM_VERSIONS_DICT[order?.version]
            }版.`}
            extra={[
              <Button type="primary" key="console" href="/">
                返回首页
              </Button>,
            ]}
          />
        )}

        {order?.status !== "paid" && (
          <Result
            status="error"
            title="未支付"
            subTitle={`未监测到您的支付信息，您可以到订单详情页面查看订单信息，或联系客服.`}
            extra={[
              <Button
                type="primary"
                key="console"
                href={`/team/upgrade/order/${order?.id}/pay`}
              >
                订单详情
              </Button>,
              <Button
                type="default"
                key="console"
                onClick={() => location.reload()}
              >
                刷新支付结果
              </Button>,
            ]}
          />
        )}
      </Spin>
    </ManagerLayout>
  );
});

export default PayPage;
