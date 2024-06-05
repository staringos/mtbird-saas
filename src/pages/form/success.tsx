import { Divider, Typography } from "antd";
import React from "react";
import { CheckCircleTwoTone } from "@ant-design/icons";
import style from "./style.module.less";

const { Title } = Typography;

const FormSuccessPage = () => {
  return (
    <div className={style.formSuccess}>
      <Typography>
        <Title className={style.title}>
          <CheckCircleTwoTone twoToneColor="#52c41a" /> 提交成功！
        </Title>
      </Typography>
    </div>
  );
};

export default FormSuccessPage;
