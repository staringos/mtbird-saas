import { installApp } from "lib/controllers/installer";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.post(installApp);

export default handler;
