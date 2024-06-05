import withAuthCheck from "@/middlewares/withAuthCheck";
import {
  installExtension,
  uninstallExtension,
  getAppInstalledExtension,
} from "lib/controllers/app";
import nextConnect from "next-connect";

const handler = nextConnect();

handler.get(withAuthCheck(getAppInstalledExtension));
handler.post(withAuthCheck(installExtension));
handler.delete(withAuthCheck(uninstallExtension));

export default handler;
