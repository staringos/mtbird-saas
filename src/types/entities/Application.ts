import { IPage } from "./Page";

export interface IApplication {
  id?: string;
  name: string;
  type: number;
  desc: string;
  avatar: string;
  status?: number;
  creatorId?: string;
  teamId?: string;
  createdAt?: number;
  updatedAt?: number;
  domain?: IDomainDTO;
  wxMpTemplateId: string;
  templateId?: string;
  metadata?: string;
  homePageId?: string
}

export interface IApplicationTemplate {
  id: string;
  name: string;
  type: number;
  desc: string;
  avatar: string;
  status?: number;
  creatorId?: string;
  teamId?: string;
  createdAt?: number;
  updatedAt?: number;
  wxMpTemplateId: string;
  isPayMemberOnly: boolean;
  demoUrl: string;
  demoQrcodeUrl: string;
  platform: string;
  pages: IPage[];
  dataModels: any[];
  metadata?: IApplicationTemplateMetadata;
}

export interface IApplicationTemplateMetadata {
  extraConfigSchema?: IExtraConfigSchema[]
}

export enum IExtraConfigFormType {
  AssistantSelect = "AssistantSelect",
  Input = "Input",
  Upload = "Upload",
}

export enum IExtraConfigSchemaConfigType {
  Advanced = "advanced",
  Basic = "basic"
}

export interface IExtraConfigSchema {
  key: string;
  formType: IExtraConfigFormType,
  label: string;
  required?: boolean;
  requiredMsg?: string;
  configType?: IExtraConfigSchemaConfigType
}

export interface IApplicationMetadata {
  assistantId?: string
  token?: string
}

export interface IDomainDTO {
  id: string;
  domainName: string;
  certKey: string;
  certPem: string;
}
