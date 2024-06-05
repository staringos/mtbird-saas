import { getAppTemplates } from "lib/controllers/appTemplate";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.get(getAppTemplates);

export default handler;
