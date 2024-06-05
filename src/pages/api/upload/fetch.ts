import withAuthCheck from "@/middlewares/withAuthCheck";
import { fetchAndUploadController } from "lib/controllers/fileCenter";
import nextConnect from "next-connect";

const handler = nextConnect();

handler.post(withAuthCheck(fetchAndUploadController));

export default handler;
