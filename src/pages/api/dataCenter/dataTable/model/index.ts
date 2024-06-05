import withAuthCheck from "@/middlewares/withAuthCheck";
import { addModel, getAllDataModelByTeam } from "lib/controllers/dataCenter";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.post(withAuthCheck(addModel));
handler.get(withAuthCheck(getAllDataModelByTeam));

export default handler;
