import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

import Cors from "cors";

const cors = Cors({
  methods: ["GET", "OPTIONS", "PATCH", "DELETE", "POST", "PUT"],
});

function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function
) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

const withNextCors = (handler: any): NextApiHandler => {
  return async (req: NextApiRequest, res: NextApiResponse, ...rest: any) => {
    try {
      await runMiddleware(req, res, cors);

      return handler(req, res, ...rest);
    } catch (e) {
      res.status(500).send("");
    }
  };
};

export default withNextCors;
