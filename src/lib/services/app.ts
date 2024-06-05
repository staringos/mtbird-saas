import { IApplicationTemplate } from "@/types/entities/Application";
import { NO_AUTH } from "@/utils/messages";
import { generateResponse } from "lib/response";
import { NextApiResponse } from "next";
import prisma from "../prisma";
import { teamCheck } from "./team";

export const appCheck = async (
  res: NextApiResponse,
  appId: string,
  userId: string
) => {
  const app = await prisma.application.findFirst({
    where: {
      id: appId,
    },
    include: {
      domain: true,
      applicationLoginConfig: true,
    },
  });

  if (!app || !teamCheck(res, userId, app.teamId as string)) {
    res.status(422).send(generateResponse(422, NO_AUTH));
    return false;
  }
  return app;
};

/**
 * Copy template's page and data entity to new app
 * @param template
 * @param appId
 */
export const generateAppByTemplate = (
  template: IApplicationTemplate,
  appId: string
) => {};


/**
 * 获取通过 saas 创建 ai 应用时保存的 token
 */
export const getApplicationAiToken = async (appId?: string) => {
  if (!appId) return null;

  const application = await prisma.application.findFirst({
    where: {
      id: appId,
    },
  });

  if (typeof application?.metadata === "string") {
    application.metadata = JSON.parse(application?.metadata);
  }

  const aiToken = (application?.metadata as any)?.token;
  
  return aiToken;
}

export const getApplicationById = async (id: string) => {
  if (!id) return;
  return await prisma.application.findUnique({
    where: { id },
    include: {
      applicationLoginConfig: {
        select: {
          secret: false,
          loginWays: true,
          logo: true,
          title: true,
          loginCallbackUrl: true,
        }
      }
    }
  })
}