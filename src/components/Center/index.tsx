import React from "react";
import { Row, Col } from "antd";

interface IProps {
  children: any;
}

const Center = ({ children }: IProps) => {
  return (
    <Row justify="center" align="middle" style={{ flex: 1 }}>
      <Col>{children}</Col>
    </Row>
  );
};

export default Center;
