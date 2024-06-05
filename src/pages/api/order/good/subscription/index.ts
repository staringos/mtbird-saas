import { getAllGoods } from "lib/controllers/order";
import nextConnect from "next-connect";

const handler = nextConnect();

handler.get(getAllGoods);

export default handler;
