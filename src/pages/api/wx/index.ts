import withAuthCheck from "@/middlewares/withAuthCheck";
import { wxCallback, wxPostCallback } from "lib/controllers/wx";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.get(wxCallback);
handler.post(wxPostCallback);

export default handler;
