import type { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";

// Initializing the cors middleware
const cors = Cors({
  methods: ["GET", "HEAD"],
});

const corsMiddleware = (handler: any) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    await new Promise((resolve) => {
      cors(req, res, (result: any) => {
        resolve(result);
      });
    });

    return handler(req, res);
  };
};

export default corsMiddleware;
