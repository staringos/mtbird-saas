import { generateSearch, isStringEmpty } from "@/utils/index";
import {
  FIELD_CANNOT_REPEAT,
  OPERATION_SUCCESS,
  PARAMS_ERROR,
  PARAMS_NEEDED,
  RESOURCE_NOT_FIND,
  UNKONWN_ERROR,
  NO_AUTH,
} from "@/utils/messages";
import { FieldType } from "@prisma/client";
import { getPaginationParams, paginationFind } from "lib/pagination";
import { generateResponse } from "lib/response";
import { dataModelCheck } from "lib/services/dataTable";
import { teamCheck } from "lib/services/team";
import { getFromBody, getFromQuery } from "lib/utils";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../prisma";
import keys from "lodash/keys";

/**
 * Get all data model by team id
 *
 * @param req
 * @param res
 * @param userId
 * @returns
 */
export const getAllDataModelByTeam = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const teamId = getFromQuery(req, "teamId") as string;

  if (!teamId)
    return res.status(400).send(generateResponse(400, PARAMS_NEEDED));
  if (!(await teamCheck(res, userId, teamId))) return;

  const models = await prisma.dataModel.findMany({
    where: {
      teamId,
      isDelete: false,
    },
    include: {
      DataModelField: true,
    },
  });

  return res
    .status(200)
    .send(generateResponse(200, OPERATION_SUCCESS, models || []));
};

export const addModel = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const teamId = getFromBody(req, "teamId") as string;
  const name = getFromBody(req, "name") as string;

  if (isStringEmpty(name) || isStringEmpty(teamId))
    return res.status(400).send(generateResponse(400, PARAMS_NEEDED));
  if (!(await teamCheck(res, userId, teamId))) return;

  await prisma.dataModel.create({
    data: {
      teamId,
      name,
      creatorId: userId,
    },
  });

  return res.status(200).send(generateResponse(200, OPERATION_SUCCESS));
};

export const addDomain = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const teamId = getFromQuery(req, "teamId") as string;
  const domainName = getFromQuery(req, "domainName") as string;
  const name = getFromQuery(req, "name") as string;
  const displayName = getFromQuery(req, "displayName") as string;

  if (isStringEmpty(name) || isStringEmpty(displayName))
    return res.status(400).send(generateResponse(400, PARAMS_NEEDED));
  if (!(await teamCheck(res, userId, teamId))) return;

  await prisma.aPIDomain.create({
    data: {
      teamId,
      name,
      domainName,
      creatorId: userId,
    },
  });

  return res.status(200).send(generateResponse(200, OPERATION_SUCCESS));
};

export const updateModel = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const teamId = getFromQuery(req, "teamId") as string;
  const name = getFromQuery(req, "name") as string;
  const id = getFromQuery(req, "id") as string;

  if (isStringEmpty(teamId) || isStringEmpty(name) || isStringEmpty(id))
    return res.status(400).send(generateResponse(400, PARAMS_NEEDED));
  if (!(await teamCheck(res, userId, teamId))) return;

  await prisma.dataModel.update({
    data: {
      name,
    },
    where: {
      id,
    },
  });

  return res.status(200).send(generateResponse(200, OPERATION_SUCCESS));
};

export const deleteModel = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const teamId = getFromQuery(req, "teamId") as string;
  const name = getFromQuery(req, "name") as string;
  const id = getFromQuery(req, "id") as string;

  if (isStringEmpty(teamId) || isStringEmpty(name) || isStringEmpty(id))
    return res.status(400).send(generateResponse(400, PARAMS_NEEDED));
  if (!(await teamCheck(res, userId, teamId))) return;

  await prisma.dataModel.update({
    data: {
      isDelete: true,
    },
    where: {
      id,
    },
  });

  return res.status(200).send(generateResponse(200, OPERATION_SUCCESS));
};

export const getModelFields = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const modelId = getFromQuery(req, "id") as string;

  if (!modelId)
    return res.status(400).send(generateResponse(400, PARAMS_NEEDED));
  if (!(await dataModelCheck(res, userId, modelId))) return;

  const models = await prisma.dataModelField.findMany({
    where: {
      dataModelId: modelId,
    },
  });

  return res
    .status(200)
    .send(generateResponse(200, OPERATION_SUCCESS, models || []));
};

export const addModelField = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const key = getFromBody(req, "key") as string;
  const displayName = getFromBody(req, "displayName") as string;
  const dataModelId = getFromQuery(req, "id") as string;
  const sort = getFromBody(req, "sort") as number;
  const type = getFromBody(req, "type") as string;
  const options = getFromBody(req, "options", false) as string;

  if (
    isStringEmpty(type) ||
    isStringEmpty(key) ||
    isStringEmpty(displayName) ||
    isStringEmpty(dataModelId)
  )
    return res.status(400).send(generateResponse(400, PARAMS_NEEDED));
  if (!(await dataModelCheck(res, userId, dataModelId))) return;

  try {
    await prisma.dataModelField.create({
      data: {
        key,
        displayName,
        dataModelId,
        type: type as FieldType,
        creatorId: userId,
        sort,
        options,
      },
    });

    return res.status(200).send(generateResponse(200, OPERATION_SUCCESS));
  } catch (e: any) {
    const message = e.message || "";
    if (message.indexOf("DataModelField_key_dataModelId_key") !== -1)
      return res.status(400).send(generateResponse(400, FIELD_CANNOT_REPEAT));
    res.status(400).send(generateResponse(400, UNKONWN_ERROR));
  }
};

export const deleteModalField = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const dataModelId = getFromQuery(req, "id") as string;
  const fieldId = getFromQuery(req, "fieldId") as string;

  if (isStringEmpty(dataModelId) || isStringEmpty(fieldId))
    return res.status(400).send(generateResponse(400, PARAMS_NEEDED));
  if (!(await dataModelCheck(res, userId, dataModelId))) return;

  await prisma.dataModelField.delete({
    where: {
      id: fieldId,
    },
  });

  return res.status(200).send(generateResponse(200, OPERATION_SUCCESS));
};

export const updateModalField = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const key = getFromBody(req, "key") as string;
  const displayName = getFromBody(req, "displayName") as string;
  const type = getFromBody(req, "type") as string;
  const options = getFromBody(req, "options", false) as string;
  const dataModelId = getFromQuery(req, "id") as string;
  const fieldId = getFromQuery(req, "fieldId") as string;

  if (isStringEmpty(key) || isStringEmpty(displayName) || isStringEmpty(type))
    return res.status(400).send(generateResponse(400, PARAMS_NEEDED));
  if (!(await dataModelCheck(res, userId, dataModelId))) return;

  await prisma.dataModelField.update({
    data: {
      key,
      displayName,
      type: type as FieldType,
      options,
    },
    where: {
      id: fieldId,
    },
  });

  return res.status(200).send(generateResponse(200, OPERATION_SUCCESS));
};

export const getData = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const pagination = getPaginationParams(req);
  const dataModelId = getFromQuery(req, "id") as string;

  if (isStringEmpty(dataModelId))
    return res.status(400).send(generateResponse(400, PARAMS_NEEDED));

  const dataModel = await prisma.dataModel.findFirst({
    where: {
      id: dataModelId,
    },
  });

  if (!dataModel)
    return res.status(404).send(generateResponse(404, RESOURCE_NOT_FIND));

  if (!userId && dataModel.queryAuth !== "PUBLIC") {
    return res.status(400).send(generateResponse(400, NO_AUTH));
  }

  return res.status(200).send(
    await paginationFind(
      prisma.dataModelData,
      pagination,
      { dataModelId },
      null,
      {
        createdAt: "desc",
      }
    )
  );
};

export const addData = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const data = getFromBody(req, "data") as string;
  const dataModelId = getFromQuery(req, "id") as string;

  if (!data || isStringEmpty(dataModelId))
    return res.status(400).send(generateResponse(400, PARAMS_NEEDED));

  await prisma.dataModelData.create({
    data: {
      data,
      dataModelId,
      creatorId: userId,
    },
  });

  return res.status(200).send(generateResponse(200, OPERATION_SUCCESS));
};

export const modifyData = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const data = getFromBody(req, "data") as string;
  const dataModelId = getFromQuery(req, "id") as string;
  const dataId = getFromQuery(req, "dataId") as string;

  if (!data || isStringEmpty(dataModelId))
    return res.status(400).send(generateResponse(400, PARAMS_NEEDED));

  await prisma.dataModelData.update({
    data: {
      data,
      dataModelId,
      creatorId: userId,
    },
    where: {
      id: dataId,
    },
  });

  return res.status(200).send(generateResponse(200, OPERATION_SUCCESS));
};

export const deleteData = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const id = getFromQuery(req, "id") as string;
  const dataId = getFromQuery(req, "dataId") as string;

  if (isStringEmpty(id) || isStringEmpty(dataId))
    return res.status(400).send(generateResponse(400, PARAMS_NEEDED));

  const data = await prisma.dataModelData.findFirst({
    where: {
      id: dataId,
    },
  });

  if (!data)
    return res.status(404).send(generateResponse(404, RESOURCE_NOT_FIND));
  if (data.dataModelId !== id)
    return res.status(404).send(generateResponse(400, PARAMS_ERROR));

  if (!(await dataModelCheck(res, userId, data.dataModelId))) return;

  await prisma.dataModelData.delete({
    where: { id: dataId },
  });

  return res.status(200).send(generateResponse(200, OPERATION_SUCCESS));
};

export const getDataDetail = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const dataModelId = getFromQuery(req, "id");
  const search = getFromBody(req, "search", false);

  let where: Record<string, any> = {
    dataModelId,
  };

  const searchKeys = keys(search);

  // TODO fix search typeof Datetime and JSON error
  // code: 3143, message: "Invalid JSON path expression. The error is around character position 1."
  if (search && searchKeys.length > 0) {
    const searchWhere = generateSearch(search);
    where = { ...where, ...searchWhere };
  }

  const result = await prisma.dataModelData.findFirst({
    where,
  });

  return res.status(200).send(generateResponse(200, OPERATION_SUCCESS, result));
};
