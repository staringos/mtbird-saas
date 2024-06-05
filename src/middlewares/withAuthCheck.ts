import { isRequestLogined } from "lib/services/auth";
import type { NextApiRequest, NextApiResponse } from "next";

const withAuthCheck = (handler: any, notloginOnly: boolean = false) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const authData = isRequestLogined(req, res, notloginOnly, handler);

      if (!authData) return;

      return handler(req, res, authData.userId, authData.teamId, authData.v);
    } catch (e) {
      res.status(401).send("Please login");
    }
  };
};

export default withAuthCheck;
