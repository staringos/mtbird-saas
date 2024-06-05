import withAuthCheck from "@/middlewares/withAuthCheck";
import { ticketCallback } from "lib/controllers/wx";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.post(ticketCallback);

export default handler;
