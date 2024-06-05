import withAuthCheck from "@/middlewares/withAuthCheck";
import { transferCertificateSubmit } from "lib/controllers/order";
import nextConnect from "next-connect";

const handler = nextConnect();

handler.post(withAuthCheck(transferCertificateSubmit));

export default handler;
