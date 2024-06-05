import withAuthCheck from "@/middlewares/withAuthCheck";
import { addModelField, getModelFields } from "lib/controllers/dataCenter";
import nextConnect from "next-connect";

const handler = nextConnect();

handler.get(withAuthCheck(getModelFields));
handler.post(withAuthCheck(addModelField));

export default handler;
