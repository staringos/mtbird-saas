import {
  OPERATION_SUCCESS,
  RESOURCE_NOT_FIND,
  TEAM_ID_CANNOT_BE_NULL,
  UNKONWN_ERROR,
} from "@/utils/messages";
import { getPaginationParams, paginationFind } from "lib/pagination";
import { generateResponse } from "lib/response";
import { teamCheck } from "lib/services/team";
import { getFromBody, getFromQuery } from "lib/utils";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../prisma";

export const getTemplateCategory = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const allCategories = await prisma.templateCategory.findMany();
  return res
    .status(200)
    .send(generateResponse(200, OPERATION_SUCCESS, allCategories));
};

export const getTemplates = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const pagination = getPaginationParams(req);
  const teamId = getFromQuery(req, "teamId") as string;
  const scope = getFromQuery(req, "scope") as string;
  const type = getFromQuery(req, "type") as string;
  const categoryId = getFromQuery(req, "categoryId") as string;
  const pageType = getFromQuery(req, "pageType") as string;
  const componentName = getFromQuery(req, "componentName") as string;

  if (scope === "team" && !teamId)
    return res.status(422).send(generateResponse(422, TEAM_ID_CANNOT_BE_NULL));
  if (scope === "team" && !teamCheck(res, userId, teamId)) return false;

  const condition: Record<string, any> = {
    type,
    NOT: {
      isDelete: true,
    },
    Team: {
      NOT: {
        status: -1,
      },
    },
  };

  if (scope === "my") {
    condition.creatorUserId = userId;
  }

  if (scope === "team") {
    condition.teamId = teamId;
  }

  if (!scope || scope === "market") {
    condition.isPrivate = false;
  }

  if (categoryId) {
    condition.categoryId = categoryId;
  }

  if (pageType) {
    condition.pageType = pageType;
  }

  if (componentName) {
    condition.componentName = componentName;
  }

  return res
    .status(200)
    .send(await paginationFind(prisma.template, pagination, condition));
};

export const deleteTemplate = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const id = getFromBody(req, "id") as string;

  const template = await prisma.template.findFirst({
    where: {
      id,
      NOT: {
        isDelete: true,
      },
    },
  });

  if (!template)
    return res.status(404).send(generateResponse(404, RESOURCE_NOT_FIND));

  if (!teamCheck(res, userId, template.teamId)) return false;

  const result = await prisma.template.update({
    data: {
      isDelete: true,
    },
    where: {
      id,
    },
  });

  if (!result) {
    return res.status(404).send(generateResponse(500, UNKONWN_ERROR));
  }

  return res.status(200).send(generateResponse(200, OPERATION_SUCCESS));
};

export const addTemplate = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const teamId = getFromBody(req, "teamId") as string;
  const type = getFromBody(req, "type") as string;
  const pageType = getFromBody(req, "pageType") as string;
  const content = getFromBody(req, "content") as string;
  const name = getFromBody(req, "name") as string;
  const avatar = getFromBody(req, "avatar") as string;
  const componentName = getFromBody(req, "componentName") as string;
  const isPrivate = getFromBody(req, "isPrivate");

  if (!teamCheck(res, userId, teamId)) return false;

  try {
    const result = await prisma.template.create({
      data: {
        name,
        content,
        type,
        teamId,
        creatorUserId: userId,
        isPrivate,
        avatar,
        pageType,
        componentName,
      },
    });

    if (!result || !result.id) {
      return res.status(500).send(generateResponse(500, UNKONWN_ERROR));
    }

    return res
      .status(200)
      .send(generateResponse(200, OPERATION_SUCCESS, result));
  } catch (e: any) {
    return res.status(500).send(generateResponse(500, e.message));
  }
};
