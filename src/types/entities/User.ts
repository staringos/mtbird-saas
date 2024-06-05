import ITeam from "./Team";

export interface IUser {
  id: string;
  name: string;
  nickname?: string;
  email: string;
  phone: string;
  avatar: string;
  status: number;
  createdAt?: number;
  updatedAt?: number;

  teams: ITeam[];
  wxInfo?: any;
}

export interface IProfileUpdateDTO {
  profile: string;
  avatar: string;
}

export interface IRegistryInfo extends Record<string, string> {
  /** 回调URL */
  redirectUrl: string;
  /** 用户来源 */
  userFrom: string; 
  /** 介绍人 */
  userIntroducer: string;

  f: string;
  [key: string]: any;
}