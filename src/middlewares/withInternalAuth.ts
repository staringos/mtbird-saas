import { generateResponse } from "lib/response";
import type { NextApiRequest, NextApiResponse } from "next";

const withInternalAuth = (handler: any) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const authToken = req.headers.authorization;
    const allowedToken = process.env.INTERNAL_AUTH_TOKEN;

    if (authToken === allowedToken) {
      // 处理请求
      return handler(req, res);
    } else {
      return res.status(401).json(generateResponse(401, "error token"));
    }
  };
};

export default withInternalAuth;
