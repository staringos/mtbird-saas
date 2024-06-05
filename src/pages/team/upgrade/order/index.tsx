import React, { useEffect, useMemo, useState } from "react";
import {
  Form,
  Input,
  Checkbox,
  Button,
  Radio,
  Typography,
  Select,
  message,
  Modal,
} from "antd";
import ManagerLayout from "../../../../layout/ManagerLayout";
import { useRouter } from "next/router";
import styles from "./style.module.less";
import { observer } from "mobx-react-lite";
import { useStore } from "store";
import { getGoods } from "apis/order";
import { takeOrder } from "apis/team";
import { getPrice } from "utils/common";
import { ExclamationCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const UpgradeOrderPage = observer(() => {
  const { teams, currentTeamId, currentTeam } = useStore();
  const router = useRouter();
  const [form] = Form.useForm();
  const times = Form.useWatch("times", form);
  const { period, version } = router.query;
  const [goods, setGoods] = useState([]);

  const init = async () => {
    const res = await getGoods();
    setGoods(res.data);
  };

  useEffect(() => {
    init();
  }, []);

  const prices = useMemo(() => {
    return getPrice(goods, times, period as string, version as string);
  }, [times, version, goods]);

  const handleFinish = async (data) => {
    const { teamId, times, companyName, contact, agree } =
      form.getFieldsValue();

    if (!agree) {
      return message.error("请点击确认服务协议!");
    }
    try {
      const res = await takeOrder({
        teamId,
        times,
        companyName,
        contact,
        version,
        period,
        price: prices[0],
      });

      if (res.code === 200) {
        message.success("下单成功!");
        router.push(`/team/upgrade/order/${res.data.id}/pay`);
      } else {
        message.error(res.message);
      }
    } catch (e) {
      if (e.code === 407) {
        return Modal.confirm({
          icon: <ExclamationCircleOutlined />,
          title: "您还有未支付订单，是否前往支付",
          onOk() {
            router.push(`/team/upgrade/order/${e.data.id}/pay`);
          },
        });
      }
      message.error(e.message);
    }
  };

  const handleTimeChanged = (e) => {
    form.setFieldValue("times", e.target.value);
  };

  const teamOptions = useMemo(() => {
    return teams.map((cur) => ({
      label: cur.name,
      value: cur.id,
    }));
  }, [teams]);

  return (
    <ManagerLayout type="team">
      <Title
        style={{ textAlign: "center", marginTop: 50, marginBottom: 50 }}
        level={3}
      >
        星搭{version === "enterprise" ? "企业版" : "专业版"}购买订单
      </Title>
      <Form
        form={form}
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        initialValues={{ agree: false, times: 1, teamId: currentTeamId }}
        onFinish={handleFinish}
        autoComplete="off"
      >
        <Form.Item label="公司名称" name="companyName">
          <Input />
        </Form.Item>

        <Form.Item label="联系方式" name="contact">
          <Input />
        </Form.Item>

        <Form.Item
          label="开通团队"
          name="teamId"
          rules={[{ required: true, message: "请选择开通团队!" }]}
        >
          <Select options={teamOptions} />
        </Form.Item>

        <Form.Item
          label="订购周期"
          name="times"
          rules={[{ required: true, message: "请选择订购周期!" }]}
        >
          {period === "yearly" && (
            <Radio.Group
              defaultValue={1}
              onChange={handleTimeChanged}
              optionType="button"
              buttonStyle="solid"
            >
              <Radio.Button value={1}>1年</Radio.Button>
              <Radio.Button value={2}>2年(92折)</Radio.Button>
              <Radio.Button value={3}>3年(88折)</Radio.Button>
            </Radio.Group>
          )}

          {period === "monthly" && (
            <Radio.Group
              defaultValue={1}
              onChange={handleTimeChanged}
              optionType="button"
              buttonStyle="solid"
            >
              <Radio.Button value={1}>1个月</Radio.Button>
              <Radio.Button value={2}>2</Radio.Button>
              <Radio.Button value={3}>3</Radio.Button>
              <Radio.Button value={4}>4</Radio.Button>
              <Radio.Button value={5}>5</Radio.Button>
              <Radio.Button value={6}>6</Radio.Button>
              <Radio.Button value={7}>7</Radio.Button>
              <Radio.Button value={8}>8</Radio.Button>
              <Radio.Button value={9}>9</Radio.Button>
              <Radio.Button value={10}>10</Radio.Button>
              <Radio.Button value={11}>11 (优惠一个月)</Radio.Button>
              <Radio.Button value={12}>12 (优惠两个月)</Radio.Button>
            </Radio.Group>
          )}
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          ¥<span className={styles.price}>{prices[0]}</span>元{" "}
          {prices[1] && (
            <span>
              {" "}
              原价:<span className={styles.priceOrigin}>{prices[1]}</span>元
            </span>
          )}
        </Form.Item>
        <Form.Item
          name="agree"
          valuePropName="checked"
          wrapperCol={{ offset: 8, span: 16 }}
        >
          <Checkbox>
            同意
            <Button
              type="link"
              target="_blank"
              href="https://mtbird-cdn.staringos.com/product/docs/pay-agr.pdf"
            >
              《星搭付费服务协议》
            </Button>{" "}
            <Text type="secondary">
              提交订单后可申请合同，付款完成后可申请发票
            </Text>
          </Checkbox>
        </Form.Item>
        {currentTeam?.version === "professional" &&
          version === "enterprise" && (
            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
              <Text type="secondary">
                专业版升级为企业版，支付后可以联系客服退差价
              </Text>
            </Form.Item>
          )}
        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit">
            提交订单
          </Button>
        </Form.Item>
      </Form>
    </ManagerLayout>
  );
});

export default UpgradeOrderPage;
