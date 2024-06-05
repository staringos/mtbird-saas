export default interface ITeam {
  id: string;
  name: string;
  type: string;
  desc: string;
  avatar: string;
  creatorId: string;
  createdAt: number;
  updatedAt: number;
}

export type TeamVersion = "private" | "enterprise" | "professional" | "normal";

export interface IBox {
  title: string;
  desc: string;
  list: { title: string; desc: string }[];
  price: number;
  period: string;
  discount: string;
  buttonTitle: string;
  buttonType: "default" | "primary";
  buttonDisabled: boolean;
  showPrice: boolean;
  version: string;
  isStart: boolean;
}
