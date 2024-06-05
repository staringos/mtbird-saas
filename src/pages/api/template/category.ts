import { getTemplateCategory } from "lib/controllers/template";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.get(getTemplateCategory);

export default handler;
