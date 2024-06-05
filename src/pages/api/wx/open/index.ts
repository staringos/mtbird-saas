import withAuthCheck from "@/middlewares/withAuthCheck";
import { wxCallback } from "lib/controllers/wx";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.get(withAuthCheck(wxCallback));

export default handler;
