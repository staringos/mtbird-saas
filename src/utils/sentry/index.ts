import { IUser } from "@/types/entities/User";

const login = (userInfo: IUser | null) => {
	
}

const logout = () => {
	
}

const captureException = (exception: any) => {
	
}

const captureMessage = (message: string) => {
	
}


const SentryClient = { login, logout, captureException, captureMessage };

export default SentryClient;