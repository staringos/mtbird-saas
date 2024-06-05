import type { NextApiRequest, NextApiResponse } from "next";
import withAuthCheck from "@/middlewares/withAuthCheck";
import { getFromQuery, moveFile, refreshCDN, uploadFile } from "lib/utils";
import { getUploadAccessToken } from "lib/controllers/upload";
import fileConnector from "@/middlewares/fileConnector";
import nextConnect from "next-connect";
import entries from "lodash/entries";
import { deleteHistory, publish } from "lib/controllers/extension";
import { generateResponse } from "lib/response";

const handler = nextConnect();
handler.use(fileConnector);

/**
 * Upload and publish
 * @param req
 * @param res
 * @param userId
 * @param teamId
 * @returns
 */
async function controller(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string,
  teamId: string
) {
  const name = getFromQuery(req, "name") as string;
  const version = getFromQuery(req, "version") as string;
  const desc = getFromQuery(req, "desc") as string;
  const title = getFromQuery(req, "title") as string;
  const body = { name, version, desc, title };
  const { files } = req as any;
  const bucket = process.env.BUCKET_REGISTRY;

  // 1. publish extension and history
  const publishResult = await publish(res, userId, teamId, body);

  if (publishResult !== "success") return;

  try {
    // 2. get upload token
    const { mac, token } = await getUploadAccessToken(bucket);

    await Promise.all(
      entries(files).map(async ([key, value]: any[]) => {
        // 3. upload each files to Qiniu
        await uploadFile(`${name}/${version}`, value[0].path, token, key);
        // 4. move file to latest
        await moveFile(
          mac,
          bucket as string,
          `${name}/${version}${key}`,
          `${name}/latest${key}`
        );
      })
    );

    const latestAddress = entries(files)
      .filter(([key]) => !key.startsWith('/types'))
      .map(([key]) => {
        return `https://registry.staringos.com/${name}/latest${key}`
      })

    console.log('refresh CSD: ', latestAddress)

    // 5. refresh CDN
    await refreshCDN(mac, latestAddress);
  } catch (e: any) {
    // 6. if upload failed, delete history
    // TODO delete uploaded files
    await deleteHistory(res, userId, teamId, body);
    return res.status(500).send(generateResponse(500, e.message));
  }

  return res.status(200).send("Method not allowed, please add token");
}

const wrapedHandler = withAuthCheck(controller);
handler.post(wrapedHandler);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;
