import type { NextApiRequest, NextApiResponse } from "next";
import { HTTP_METHODS } from "@/utils/constants";
import { getUploadAccessToken } from "lib/controllers/upload";

const UploadTokenApi = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== HTTP_METHODS.POST) return res.status(404);

  res
    .status(200)
    .json({ msg: "success", data: { token: getUploadAccessToken() } });
};

export default UploadTokenApi;
