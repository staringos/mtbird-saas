import { wxLogin } from "lib/controllers/wx";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.post(wxLogin);

export default handler;
