import nextConnect from "next-connect";
import multiparty from "multiparty";
import { NextApiRequest, NextApiResponse } from "next";

const fileConnector = nextConnect();

// https://flaviocopes.com/nextjs-upload-files/

fileConnector.use(
  async (req: NextApiRequest, res: NextApiResponse, next: any) => {
    const form = new multiparty.Form();

    await form.parse(req, function (err: any, fields: any[], files: any[]) {
      req.body = fields;
      (req as any).files = files;
      next();
    });
  }
);

export default fileConnector;
