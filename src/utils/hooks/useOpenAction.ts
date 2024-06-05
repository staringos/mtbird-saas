import { useRouter } from "next/router";
import { useEffect } from "react";
import { MODAL_NAME as APP_MODAL_NAME } from "modals/AddAppModal";
import {
  MODAL_NAME as USER_PROFILE_MODAL_NAME,
} from "modals/UserProfileModal";
import {
  MODAL_NAME as PHONE_BIND_MODAL,
} from "modals/PhoneBindModal";
import { useStore } from "../../store";
import usePrevious from "./usePrevious";

const WhiteList: Record<string, string> = {
	"createApp": APP_MODAL_NAME,
	"userEdit": USER_PROFILE_MODAL_NAME,
	"bindPhone": PHONE_BIND_MODAL,
}

const useOpenAction = (modals: any) => {
	const router = useRouter();
  const { openModal } = useStore();
	const previousModals = usePrevious(modals);
 
  useEffect(() => {
    if (!router.isReady) return;
		if (!router.query.open) return;

		const modal = WhiteList[router.query.open as string];
		if (modal) {
			openModal(modal, {
				afterClose: () => {
					if (router.query.exiting) {
						history.back();
					}
				}
			});
			router.replace(router.pathname);
		}
  }, [openModal, router]);


}

export default useOpenAction;