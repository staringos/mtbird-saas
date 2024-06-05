import { getProvince } from "lib/controllers/region";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.get(getProvince);

export default handler;
