import { type Decimal } from "@prisma/client/runtime";

export interface IGoodDTO {
  id: string;
  name: string;
  desc: string;
  memberNum: number;
  appNum: number;
  pageNum: number;
  templateNum: number;
  enablePublicTemplate: boolean;
  enablePublicExtension: boolean;
  enableBindDomainName: boolean;
  enablePrivateTemplate: boolean;
  enablePrivateExtension: boolean;
  enableAPI: boolean;
  enable724CustomerService: boolean;
  enablePrivateDataStorage: boolean;
  version: string;
  unitPrice: number;
  sort: number;
  createdAt: string;
  updatedAt: string;
}

export interface IOrderDTO {
  id: string;
  period?: string | null;
  price: number | Decimal;
  times: number;
  version: string;
  teamId: string;
  notifyUrl: string;
  returnUrl: string;
  isSubscription: boolean;
  orderUserId?: string;
  from: string;
  name: string;
  desc: string;
  originPrice?: string;
  payTime?: string;
  createdAt?: string;
  status: "created" | "confirming" | "paid" | "expired" | "closed";
}

export type RechargePlan = {
  id: string;
  name: string;
  value: string;
  price?: string;
}