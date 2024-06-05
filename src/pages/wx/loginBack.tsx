import React, { useEffect } from "react";

const LoginBack = () => {
  useEffect(() => {
    window.close();
  }, []);

  return <div>刷新中...</div>;
};

export default LoginBack;
