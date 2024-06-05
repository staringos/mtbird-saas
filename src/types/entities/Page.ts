export interface IPage {
  id?: string;
  title: string;
  type: string;
  desc: string;
  avatar: string;
  appId?: string;
  creatorId?: string;
  status?: number; // -1 已删除 0 正常 1 禁用
  teamId?: string | null;
  content?: Record<string, any>;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  avatarShare?: string;
  tags?: string;
  isNativePage?: boolean;
  routeKey?: string;
}

export interface IPageHistory {
  id?: string;
  content?: string | null;
  creatorId?: string;
}
