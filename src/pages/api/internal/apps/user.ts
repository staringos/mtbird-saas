import { registerFromApps } from "lib/controllers/user";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.post(registerFromApps);

export default handler;
