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
} from "antd";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import {
  getOrder,
  goToPay,
  closeOrder,
  submitTransferCertificate,
} from "apis/order";
import { IOrderDTO } from "types/entities/Order";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { ORDER_STATUS } from "../../../../utils/constants";
import styles from "./style.module.less";
import UploadAvatar from "components/UploadAvatar";
import { dateFormatter } from "utils";

const { Title, Text } = Typography;

const CashierPage = () => {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const [form] = Form.useForm();
  const [order, setOrder] = useState<IOrderDTO | undefined>();
  const [loading, setLoading] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [payCertificate, setPayCertificate] = useState<string[]>([]);

  const payWay = Form.useWatch("payWay", form);

  const init = async () => {
    if (!id) return;
    setLoading(true);
    const res = await getOrder(id as string);
    setOrder(res.data);
    setLoading(false);
  };

  useEffect(() => {
    init();
  }, [id]);

  const handleCloseOrder = async () => {
    await closeOrder(order!.id);
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
        router.push(`/cashier/${id}/status`);
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
    <Layout className={styles.layout}>
      <Form
        form={form}
        name="basic"
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 16 }}
        initialValues={{ payWay: "alipay" }}
        onFinish={handleFinish}
        autoComplete="off"
        colon={false}
        style={{ margin: "0 10px" }}
      >
        <Form.Item label=" ">
          <img
            className={styles.cashierLogo}
            src="/statics/images/staringos-cashier.png"
            width="300px"
          />
        </Form.Item>
        <Form.Item label="订单详情">
          <Descriptions title="" style={{ marginTop: "4px" }}>
            <Descriptions.Item label="订购产品">
              {order.name || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="订单描述">{order.desc}</Descriptions.Item>
            <Descriptions.Item label="订单状态">
              {ORDER_STATUS[order.status]}
            </Descriptions.Item>
            <Descriptions.Item label="支付时间">
              {order.payTime || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {dateFormatter(order.createdAt!)}
            </Descriptions.Item>
          </Descriptions>
        </Form.Item>
        <Form.Item label="金额">
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
              <Radio.Button value="alipay">
                <Space>
                  <img src="/statics/zhifubao.png" width="25px" />
                  支付宝
                </Space>
              </Radio.Button>
              <Radio.Button value="transfer">对公转账</Radio.Button>
            </Radio.Group>
          </Form.Item>
        )}

        {order.status === "created" && (
          <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
            <Space>
              {/* {c !== "f" && (
                <Button value={1} onClick={handleCloseOrder}>
                  关闭订单
                </Button>
              )} */}

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
    </Layout>
  );
};

export default CashierPage;
