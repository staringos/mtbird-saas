import withInternalAuth from "@/middlewares/withInternalAuth";
import { createStaringOSPlatformController } from "lib/controllers/platform";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.post(withInternalAuth(createStaringOSPlatformController));

export default handler;
