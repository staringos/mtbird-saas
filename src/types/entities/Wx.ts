export interface IMiniProgramDto {
  id: string;
  qrcodeUrl: string;
  type: "beta" | "release";
  wxAppId: string;
  status?: string;
  officalQrcodeUrl?: string;
  auditStatus?: string;
  verifyMessage?: string;
  officalName?: string;
}
