import { getRegions } from "lib/controllers/region";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.get(getRegions);

export default handler;
