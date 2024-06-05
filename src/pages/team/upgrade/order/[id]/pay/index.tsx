import React, { useEffect, useState } from "react";
import ManagerLayout from "layout/ManagerLayout";
import {
  Form,
  Modal,
  Button,
  Radio,
  Typography,
  Spin,
  Descriptions,
  Space,
  message,
} from "antd";
import {
  getOrder,
  goToPay,
  closeOrder,
  submitTransferCertificate,
} from "apis/order";
import { useRouter } from "next/router";
import { IOrderDTO } from "types/entities/Order";
import { observer } from "mobx-react-lite";
import { useStore } from "store";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import UploadAvatar from "components/UploadAvatar";

import styles from "./style.module.less";
import {
  ORDER_STATUS,
  TEAM_VERSIONS_DICT,
} from "../../../../../../utils/constants";

const { Title, Text } = Typography;

const PayPage = observer(() => {
  const { teams } = useStore();
  const router = useRouter();
  const { id } = router.query;
  const [form] = Form.useForm();
  const [order, setOrder] = useState<IOrderDTO | undefined>();
  const [loading, setLoading] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [payCertificate, setPayCertificate] = useState<string[]>([]);

  const payWay = Form.useWatch("payWay", form);

  const init = async () => {
    if (!id) return;
    setLoading(true);
    const res = await getOrder(id);
    setOrder(res.data);
    setLoading(false);
  };

  useEffect(() => {
    init();
  }, [id]);

  const handleCloseOrder = async () => {
    await closeOrder(order.id);
    init();
    message.success("订单关闭成功!");
  };

  const handleFinish = () => {};

  if (loading) return <Spin />;
  if (!order) return <div>订单未找到!</div>;

  const handleToPay = async () => {
    if (payWay === "transfer") {
      setIsTransferOpen(true);
      return;
    }
    const res = await goToPay(id, payWay);
    console.log("res:", res);
    window.open(res.data.h5_url);
    Modal.confirm({
      icon: <ExclamationCircleOutlined />,
      title: "支付是否成功？",
      onOk() {
        router.push(`/team/upgrade/order/${id}/pay/success`);
      },
      okText: "支付成功",
      cancelText: "支付失败",
    });
  };

  const handleTransferOk = async () => {
    if (payCertificate.length === 0) return message.error("清上传转账凭证!");
    await submitTransferCertificate(order.id, payCertificate);
    init();
    message.success(
      "凭证提交成功，支付审核中，需1-2个工作日，如加急请联系客服!"
    );
    setIsTransferOpen(false);
  };

  const handleTransferCancel = () => {
    setIsTransferOpen(false);
  };

  const handlePayCertificateChange = (val: string[]) => {
    setPayCertificate(val);
  };

  const labelStyle: any = {
    width: "80px",
    textAlign: "right",
    display: "inline-block",
  };

  return (
    <ManagerLayout type="team">
      <Title
        style={{ textAlign: "center", marginTop: 50, marginBottom: 50 }}
        level={3}
      >
        星搭收银台
      </Title>

      <Form
        form={form}
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        initialValues={{ payWay: "alipay" }}
        onFinish={handleFinish}
        autoComplete="off"
        colon={false}
      >
        <Form.Item label="订单详情">
          <Descriptions title="">
            <Descriptions.Item label="订购版本">
              {TEAM_VERSIONS_DICT[order.version]}
            </Descriptions.Item>
            <Descriptions.Item label="订购周期">
              {order.period === "monthly" ? "月付" : "年付"}
            </Descriptions.Item>
            <Descriptions.Item label="订购时间">
              {order.times} {order.period === "monthly" ? "月" : "年"}
            </Descriptions.Item>
            <Descriptions.Item label="订购团队">
              {teams.find((cur) => cur.id === order.teamId)?.name}
            </Descriptions.Item>
            <Descriptions.Item label="订单状态">
              {ORDER_STATUS[order.status]}
            </Descriptions.Item>
          </Descriptions>
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          ¥<span className={styles.price}>{order.price}</span>元{" "}
          {order.originPrice && (
            <span>
              {" "}
              原价:
              <span className={styles.priceOrigin}>{order.originPrice}</span>元
            </span>
          )}
        </Form.Item>
        {order.status === "created" && (
          <Form.Item label="支付方式" name="payWay">
            <Radio.Group buttonStyle="solid">
              {/* <Radio.Button value="wechat">微信</Radio.Button> */}
              <Radio.Button value="alipay">支付宝</Radio.Button>
              <Radio.Button value="transfer">对公转账</Radio.Button>
            </Radio.Group>
          </Form.Item>
        )}

        {order.status === "created" && (
          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Space>
              <Button value={1} onClick={handleCloseOrder}>
                关闭订单
              </Button>
              <Button value={3} onClick={handleToPay} type="primary">
                去支付
              </Button>
            </Space>
          </Form.Item>
        )}
      </Form>

      <Modal
        title="对公转账"
        open={isTransferOpen}
        onOk={handleTransferOk}
        okText="提交凭证"
        onCancel={handleTransferCancel}
        cancelText="稍后提交"
      >
        <Descriptions title="转账信息" column={1} labelStyle={labelStyle}>
          <Descriptions.Item label="户名">
            北京星搭科技有限公司
          </Descriptions.Item>
          <Descriptions.Item label="开户行">
            招商银行 北京清河支行
          </Descriptions.Item>
          <Descriptions.Item label="账号">110944510010801</Descriptions.Item>
          <Descriptions.Item label="转账金额">
            ¥<span className={styles.price}>{order?.price}</span>元
          </Descriptions.Item>
        </Descriptions>
        <Descriptions title="确认转账" column={1} labelStyle={labelStyle}>
          <Descriptions.Item label="提交凭证">
            <UploadAvatar
              files={payCertificate}
              maxCount={1}
              onChange={handlePayCertificateChange}
            />
            <Text type="secondary">
              银行转账记录，提交后工作人员会在1-2个工作日内审核，如需加急请联系客服
            </Text>
          </Descriptions.Item>
        </Descriptions>
      </Modal>
    </ManagerLayout>
  );
});

export default PayPage;
