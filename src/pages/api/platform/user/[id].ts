import withPlatformAuthCheck from "middlewares/withPlatformAuthCheck";
import nextConnect from "next-connect";
import { getUserDetails } from "lib/controllers/platform";

const handler = nextConnect();

handler.get(withPlatformAuthCheck(getUserDetails));

export default handler;
