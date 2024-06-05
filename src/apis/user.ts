import { IProfileUpdateDTO } from "@/types/entities/User";
import request from "../utils/request";

export const updateUserProfile = async (data: Partial<IProfileUpdateDTO>) => {
  return request.put("/user/info", data);
};

export const updatePassword = async (password: string) => {
  return request.put("/user/password", { password });
};


export const bindPhone = async (code: string, phone: string) => {
  return request.post("/user/phone/bind", { code, phone });
};

export const visitorLogin = async () => {
  return request.post("/auth/visitor");
};

