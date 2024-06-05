import { convertModelToColumn } from "@mtbird/core";
import type { IData, IDataSource, IPageParams, ISearch } from "@mtbird/shared";
import { message } from "antd";
import get from "lodash/get";
import {
  getDataModelFields,
  getDataModelData,
  modifyDataModelData,
  addDataModelData,
  deleteDataModelData,
  getDataModelDataDetail,
} from "./dataCenter";
import { getFormData } from "./form";

export default class ModelDataSource implements IDataSource {
  constructor() {}

  state?: any = null;
  setState?: (state: any) => void;

  getState = () => {
    return this.state;
  };

  getValue = (keyPath: string) => {
    return get(this.state, keyPath);
  };

  // for model
  getColumns = async (pageId: string, targetId: string) => {
    try {
      const data = await getDataModelFields(targetId);
      return convertModelToColumn(data.data) as any;
    } catch (e: any) {
      message.error(e);
    }

    return [];
  };

  queryData = async (
    dataType: "form" | "model",
    pageId: string,
    tartgetId: string,
    pagination: IPageParams,
    search: Record<string, any>
  ) => {
    try {
      if (dataType === "form") {
        return (await getFormData(
          pageId,
          tartgetId,
          pagination,
          search
        )) as any;
      }

      return (await getDataModelData(tartgetId, pagination, search)) as any;
    } catch (e: any) {
      message.error(e.message);
    }

    return {
      data: [],
    };
  };

  deleteData = async (
    targetId: string,
    dataId: string | number,
    dataType?: string
  ) => {
    await deleteDataModelData(targetId, dataId as string);
    return true;
  };

  modifyData = async (
    targetId: string,
    dataId: string,
    data: Record<string, any>
  ) => {
    await modifyDataModelData(targetId, dataId, data);
    return true;
  };

  createData = async (targetId: string, data: Record<string, any>) => {
    await addDataModelData(targetId, data);
    return true;
  };

  queryDataDetail = async (
    targetType: "form" | "model",
    targetId: string,
    search: ISearch[]
  ) => {
    try {
      return (await getDataModelDataDetail(targetId, search)) as any;
    } catch (e: any) {
      message.error(e);
    }

    return {
      data: [],
    };
  };
}
