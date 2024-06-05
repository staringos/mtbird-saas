import withAuthCheck from "middlewares/withAuthCheck";
import { getPlatformConfig } from "lib/controllers/platform";
import nextConnect from "next-connect";

const handler = nextConnect();

handler.get(getPlatformConfig);

export default handler;
