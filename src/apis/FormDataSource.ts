import type { IDataSource, IPageParams, IData, ISearch } from "@mtbird/shared";
import get from "lodash/get";
import set from "lodash/set";
import { message } from "antd";
import { addFormData, deleteFormData, getForm, getFormData } from "./form";
import { covertFormToColumn } from "@mtbird/core";
import { getDataModelData, getDataModelDataDetail } from "./dataCenter";

export default class FormDataSource implements IDataSource {
  constructor(pageId: string, state?: any, setState?: any) {
    this.pageId = pageId;
    this.state = state;
    this.setState = setState;
  }

  state?: any = null;
  setState?: (state: any) => void;
  pageId: string;

  getValue = (keyPath: string) => {
    return get(this.state, keyPath);
  };
  getState = () => {
    return this.state;
  };

  modify = (keyPath: string, data: IData) => {
    set(this.state, keyPath, data);
    this.setState && this.setState(this.state);
    return Promise.resolve(true);
  };

  submit = async (formId: string) => {
    const data = get(this.state, formId || "0");
    const res = await addFormData(this.pageId, formId, data);
    if (res.code === 200) {
      message.success("提交成功！");
      // setTimeout(() => {
      //   location.reload();
      // }, 1500);
      // location.href = "/form/success";
    }
  };

  deleteData = (formId: string, dataId: string | number, dataType?: string) => {
    if (dataType === "form") {
      return deleteFormData(this.pageId, formId, dataId) as any;
    }

    return Promise.resolve({} as any);
  };

  queryData = async (
    targetType: "form" | "model",
    pageId: string,
    tartgetId: string,
    pagination: IPageParams,
    search: Record<string, any>
  ) => {
    try {
      if (targetType === "form") {
        return (await getFormData(
          pageId,
          tartgetId,
          pagination,
          search
        )) as any;
      }

      return (await getDataModelData(tartgetId, pagination, search)) as any;
    } catch (e: any) {
      message.error(e);
    }

    return {
      data: [],
    };
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

  getColumns = async (pageId: string, targetId: string) => {
    try {
      const data = await getForm(pageId, targetId);
      return covertFormToColumn(data.data);
    } catch (e: any) {
      message.error(e);
    }

    return null;
  };
}
