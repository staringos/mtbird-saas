import { getSign } from "lib/controllers/wx";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.get(getSign);

export default handler;
