import React from "react";
import { Button } from "antd";
import request from "@/utils/request";
import axios from "axios";

const TestPage = () => {
  const handleTest = async () => {
    const res = await axios.post(
      `https://mtbird.staringos.com/api/wx/open/ticket/callback`
    );
    console.log("res:", res);
  };

  return (
    <div>
      <Button onClick={handleTest}>测试</Button>
    </div>
  );
};

export default TestPage;
