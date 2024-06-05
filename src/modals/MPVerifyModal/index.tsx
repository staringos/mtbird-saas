import React, { useEffect, useState } from "react";
import { Modal, Form, Button, Select, message, Typography } from "antd";
import { useStore } from "store";
import { observer } from "mobx-react-lite";
import { addDataModel } from "apis/dataCenter";
import styles from "./style.module.less";
import { getTeamCompanies } from "apis/team";
import CompanyCreate from "../../components/CompanyCreate";
import { verifyBetaMp } from "apis/wx";

export const MODAL_NAME = "MP_VERIFY_MODEL_MODAL";
const { Text } = Typography;

const PublishMPModal = observer(() => {
  const { modals, hideModal, currentTeamId, currentAppId } = useStore();
  const [form] = Form.useForm();
  const [companyInfoList, setCompanyInfoList] = useState([]);
  const [createShow, setCreateShow] = useState(false);
  const [company, setCompany] = useState<string | undefined>(undefined);

  const init = async () => {
    const list = await getTeamCompanies(currentTeamId);
    setCompanyInfoList(list.data);

    !company && setCompany(list.data?.[0]?.id);
  };

  useEffect(() => {
    if (modals[MODAL_NAME]) {
      init();
    }
  }, [modals[MODAL_NAME]]);

  const handleOk = async () => {
    const isValid = await form.validateFields();
    if (!isValid) return;

    await addDataModel(currentTeamId, form.getFieldsValue().name);
    handleCancel();
    // refreshCurrentApp(currentAppId)
    return message.success("添加成功");
  };

  const handleCancel = () => {
    hideModal(MODAL_NAME);
  };

  const companyColumns = [
    {
      key: "name",
    },
    {
      key: "code",
    },
  ];

  const handleShowCreate = () => {
    setCreateShow(true);
  };

  const handleSuccess = (id: string) => {
    setCompany(id);
    init();
    handleCreateCancel();
  };

  const handleCreateCancel = () => {
    setCreateShow(false);
  };

  const handleCompanyChange = (val) => {
    console.log("value:", val);
    setCompany(val);
  };

  const handleToVerify = async () => {
    if (!company) return message.error("请选择认证主体!");
    try {
      const res = await verifyBetaMp(company, currentAppId);
      message.success(
        "提交认证成功，请联系法人代表，在填写的法人微信号做人脸识别，后使用绑定的微信管理员微信，确认审核!"
      );
      handleCancel();
      location.reload();
    } catch (e) {
      console.log("e:", e, e.message);
      message.error(e.message);
    }
  };

  return (
    <Modal
      title="认证小程序"
      visible={modals[MODAL_NAME]}
      footer={false}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      {!createShow && (
        <div className={styles.verifyHeader}>
          <span>选择认证主体</span>
          <Button size="small" onClick={handleShowCreate}>
            创建主体
          </Button>
        </div>
      )}
      <hr />
      {createShow && (
        <CompanyCreate
          teamId={currentTeamId}
          onSuccess={handleSuccess}
          onCancel={handleCreateCancel}
        />
      )}
      {!createShow && (
        <Select
          style={{ width: "100%" }}
          options={companyInfoList.map((cur: any) => ({
            label: cur.name,
            value: cur.id,
          }))}
          placeholder="请选择认证主体"
          value={company}
          onChange={handleCompanyChange}
        />
      )}
      <br />
      <br />
      {!createShow && (
        <Text type="secondary">如需修改认证主体，请联系客服</Text>
      )}
      <br />
      {!createShow && (
        <Button type="primary" onClick={handleToVerify}>
          使用该主体，进入审核
        </Button>
      )}
    </Modal>
  );
});

export default PublishMPModal;
