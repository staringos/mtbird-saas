import withAuthCheck from "@/middlewares/withAuthCheck";
import { addDomain, getAllDataModelByTeam } from "lib/controllers/dataCenter";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.post(withAuthCheck(addDomain));
handler.get(withAuthCheck(getAllDataModelByTeam));

export default handler;
