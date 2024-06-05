import {
  EXTENSION_CANNOT_UNINSTALLED,
  EXTENSION_NOT_INSTALLED,
  INSTALL_BEFORE,
  INSTALL_SUCCESS,
  NO_DATA,
  OPERATION_SUCCESS,
  PAGE_NOT_IN_APP,
  PARAMS_ERROR,
  RESOURCE_NOT_FIND,
  SET_NAME_ERROR_CODE,
  UPDATE_SUCCESS,
} from "@/utils/messages";
import { generateResponse } from "lib/response";
import { getFromBody, getFromQuery } from "lib/utils";
import { NextApiRequest, NextApiResponse } from "next";
import { IApplication } from "types/entities/Application";
import prisma from "../prisma";
import { v4 } from "uuid";
import { generateKeys } from "@mtbird/core";
import { appCheck } from "lib/services/app";
import { getTeamAppNumber, teamCheck } from "lib/services/team";
import { isStringEmpty } from "@/utils/index";
import { modifySignature, modifyHeadImage, setMpName } from "lib/services/wx";
import { generatePagesFromTemplate } from "lib/services/page";
import isArray from "lodash/isArray";
import { generateDataModelFromTemplate } from "lib/services/dataTable";
import {
  checkIfTeamOverLimit,
  getTeamMembership,
} from "lib/services/membership";
import { publishPage } from "./page";
import { Application } from "@prisma/client";

export const getListByTeamId = async (
  res: NextApiResponse,
  userId: string,
  teamId: string
) => {
  if (!teamCheck(res, userId, teamId)) return false;

  const list = await prisma.application.findMany({
    where: {
      teamId,
      NOT: {
        status: -1,
      },
    },
    include: {
      domain: true,
      applicationLoginConfig: true,
    },
  });

  return res.status(200).send(generateResponse(200, "", list));
};

export const add = async (
  res: NextApiResponse,
  userId: string,
  teamId: string,
  app: IApplication
) => {
  if (!teamCheck(res, userId, teamId)) return false;

  const teamVersion = await getTeamMembership(teamId);
  const appId = v4();
  const { name, desc, avatar, type, templateId, metadata } = app;
  const teamAppNum = await getTeamAppNumber(teamId);

  if (checkIfTeamOverLimit(teamVersion, teamAppNum)) {
    return res
      .status(422)
      .send(generateResponse(422, "团队应用数量已达上限，请先升级团队"));
  }

  const preInstalledExtension = await prisma.extension.findMany({
    where: {
      isPreInstalled: true,
    },
  });

  let template = null;

  if (templateId) {
    template = await prisma.applicationTemplate.findFirst({
      where: {
        id: templateId,
      },
    });

    if (template && template.isPayMemberOnly && teamVersion === "normal") {
      return res
        .status(422)
        .send(generateResponse(422, "该应用模版仅限付费用户，请先升级团队"));
    }

  }

  const entity = prisma.application.create({
    data: {
      id: appId,
      name,
      desc,
      type,
      avatar: avatar || process.env.DEFAULT_TEAM_IMAGE,
      creatorId: userId,
      teamId,
      templateId,
      wxMpTemplateId: template?.wxMpTemplateId,
      metadata,
    },
  });


  const preInstalled = prisma.appExtensionInstall.createMany({
    data: preInstalledExtension.map((data) => {
      return {
        extensionId: data.id,
        appId: appId,
      };
    }),
  });

  const transaction = [entity, preInstalled, prisma.applicationLoginConfig.create({
    data: {
      secret: v4(),
      appId,
    }
  })];

  // generate by template
  if (template) {
    // generate pages
    if (isArray(template.pages) && (template.pages as any).length > 0) {
      transaction.push(
        ...generatePagesFromTemplate(template as any, userId, appId)
      );
    }

    // generate data models
    if (
      isArray(template.dataModels) &&
      (template.dataModels as any).length > 0
    ) {
      transaction.push(
        ...generateDataModelFromTemplate(template as any, userId, appId, teamId)
      );
    }
  }
  const result = await prisma.$transaction(transaction);

  const newPages = await prisma.page.findMany({ 
    where: {
      appId: appId
    }
  });

  const templateHomePageId = template?.homePageId;

  // set the home page
  if (newPages.length && templateHomePageId) {
    const homePage = newPages.find(item => item.routeKey === templateHomePageId);
    if (homePage) {
      (result[0] as Application).homePageId = homePage.id
      await prisma.application.update({
        where: {
          id: appId
        },
        data: {
          homePageId: homePage.id
        }
      })
    }
  }

  // 直接发布所有页面
  if (newPages.length) {
    const transaction = newPages.map(async page => {
      return await publishPage(res, page.id, userId, "");
    });

    await Promise.all(transaction);
  }

  return res.status(200).send(generateResponse(200, "", result[0]));
};

export const delApp = async (
  res: NextApiResponse,
  userId: string,
  appId: string
) => {
  const app = await prisma.application.findFirst({
    where: {
      id: appId,
    },
  });
  if (!app) return res.status(404).send(generateResponse(404, NO_DATA));
  if (!teamCheck(res, userId, app.teamId as string)) return false;

  await prisma.application.update({
    where: {
      id: appId,
    },
    data: {
      status: -1,
    },
  });

  return res.status(200).send(generateResponse(200, OPERATION_SUCCESS));
};

export const modify = async (
  res: NextApiResponse,
  userId: string,
  appId: string,
  data: IApplication
) => {
  const app = await prisma.application.findFirst({
    where: {
      id: appId,
    },
  });
  if (!app) return res.status(404).send(generateResponse(404, NO_DATA));
  if (!teamCheck(res, userId, app.teamId as string)) return false;

  await prisma.application.update({
    where: {
      id: appId,
    },
    data: {
      name: data.name,
      desc: data.desc,
      avatar: data.avatar,
      type: data.type,
    },
  });
  return res.status(200).send(generateResponse(200, UPDATE_SUCCESS));
};

export const uninstallExtension = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const appId = getFromQuery(req, "appId");
  const extensionId = req.body.extensionId;

  if (!appId) return res.status(422).send(generateResponse(422, PARAMS_ERROR));

  const app = await appCheck(res, appId, userId);
  if (!app) return;

  const installLog = await prisma.appExtensionInstall.findFirst({
    where: {
      appId: appId as string,
      extensionId: extensionId,
    },
    include: {
      extension: true,
    },
  });

  if (installLog?.extension?.isUninstallable)
    return res
      .status(422)
      .send(generateResponse(422, EXTENSION_CANNOT_UNINSTALLED));
  if (!installLog)
    return res.status(404).send(generateResponse(404, EXTENSION_NOT_INSTALLED));
  await prisma.appExtensionInstall.delete({
    where: {
      id: installLog.id,
    },
  });

  return res.status(200).send(generateResponse(200, OPERATION_SUCCESS));
};

export const installExtension = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const appId = getFromQuery(req, "appId");
  const extensionId = req.body.extensionId;

  if (!appId) return res.status(422).send(generateResponse(422, PARAMS_ERROR));
  const app = await appCheck(res, appId, userId);
  if (!app) return;
  // const app = await prisma.application.findFirst({
  //   where: {
  //     id: appId
  //   }
  // })

  // if (!app || !teamCheck(res, userId, app.teamId as string)) return res.status(422).send(generateResponse(422, NO_AUTH))

  const installLog = await prisma.appExtensionInstall.findFirst({
    where: {
      appId: appId as string,
      extensionId: extensionId,
    },
  });

  if (installLog)
    return res.status(422).send(generateResponse(422, INSTALL_BEFORE));

  await prisma.appExtensionInstall.create({
    data: {
      appId: appId as string,
      extensionId: extensionId,
    },
  });

  return res.status(200).send(generateResponse(200, INSTALL_SUCCESS));
};

export const getAppInstalledExtension = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const appId = getFromQuery(req, "appId");

  if (!appId) return res.status(422).send(generateResponse(422, PARAMS_ERROR));
  const app = await appCheck(res, appId, userId);
  if (!app) return;

  // 查询出所有已安装或者默认安装的拓展
  const extensions = await prisma.extension.findMany({
    where: {
      OR: [
        {
          appExtensionInstall: {
            some: {
              appId: appId,
            },
          },
        },
        {
          isPreInstalled: true,
        },
      ],
    },
  });

  return res
    .status(200)
    .send(generateResponse(200, OPERATION_SUCCESS, extensions));
};

export const setHomePage = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const appId = getFromQuery(req, "appId");
  const pageId = getFromBody(req, "pageId");

  if (!appId) return res.status(422).send(generateResponse(422, PARAMS_ERROR));
  const app = await appCheck(res, appId, userId);
  if (!app) return;

  const page = await prisma.page.findFirst({
    where: {
      id: pageId,
    },
  });

  if (!page)
    return res.status(404).send(generateResponse(404, RESOURCE_NOT_FIND));
  if (page.appId !== appId)
    return res.status(400).send(generateResponse(400, PAGE_NOT_IN_APP));

  await prisma.application.update({
    where: {
      id: appId,
    },
    data: {
      homePageId: pageId,
    },
  });

  return res.status(200).send(generateResponse(200, OPERATION_SUCCESS));
};

export const bindDomain = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const appId = getFromQuery(req, "appId");
  const domainName = getFromBody(req, "domainName");
  const certKey = getFromBody(req, "certKey");
  const certPem = getFromBody(req, "certPem");

  if (!appId) return res.status(422).send(generateResponse(422, PARAMS_ERROR));
  if (!domainName)
    return res.status(422).send(generateResponse(422, PARAMS_ERROR));
  if (!certKey)
    return res.status(422).send(generateResponse(422, PARAMS_ERROR));
  if (!certPem)
    return res.status(422).send(generateResponse(422, PARAMS_ERROR));

  const app = await appCheck(res, appId, userId);
  if (!app) return;

  if (app.domainId) {
    const domain = await prisma.domain.update({
      where: {
        id: app.domainId,
      },
      data: {
        certKey,
        certPem,
        domainName,
      },
    });
    return res
      .status(200)
      .send(generateResponse(200, OPERATION_SUCCESS, domain));
  }

  const domainId = generateKeys();

  const domain = prisma.domain.create({
    data: {
      id: domainId,
      certKey,
      certPem,
      domainName,
    },
  });

  const application = prisma.application.update({
    where: {
      id: appId,
    },
    data: {
      domainId: domainId,
    },
  });

  const result = await prisma.$transaction([domain, application]);

  return res
    .status(200)
    .send(generateResponse(200, OPERATION_SUCCESS, result[0]));
};

export const getApp = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const appId = getFromQuery(req, "appId") as string;
  const app = await appCheck(res, appId, userId);
  if (!app) return;

  return res.status(200).send(generateResponse(200, OPERATION_SUCCESS, app));
};

const UpdateMPStatusToWx = ["release", "auditing", "audited"];

export const setAppDetails = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const appId = getFromQuery(req, "appId") as string;
  const app = await appCheck(res, appId, userId);
  if (!app) return;

  const name = getFromBody(req, "name") as string;
  const desc = getFromBody(req, "desc") as string;
  const avatar = getFromBody(req, "avatar") as string;

  console.log("[setAppDetails] name:", name, desc, avatar);

  const modifyData = {} as Record<string, string>;

  const mp = await prisma.wxMiniProgram.findFirst({
    where: {
      appId: app.id,
    },
  });

  const needUpdateMp =
    mp && mp.wxAppId && UpdateMPStatusToWx.indexOf(mp.status) !== -1;

  try {
    if (!isStringEmpty(name)) {
      modifyData["name"] = name;

      if (needUpdateMp) {
        const result = (await setMpName(name, "", mp.wxAppId as string)) as any;

        if (result.errcode !== 0) {
          return res
            .status(400)
            .send(
              generateResponse(
                400,
                SET_NAME_ERROR_CODE[result.errcode] || result.errmsg,
                result
              )
            );
        }
      }
    }

    if (!isStringEmpty(desc)) {
      modifyData["desc"] = desc;

      if (needUpdateMp) {
        const result = (await modifySignature(
          mp.wxAppId as string,
          desc
        )) as any;
        console.log("[setAppDetails] desc result:", result);

        if (result.errcode !== 0) {
          return res
            .status(400)
            .send(generateResponse(400, result.errmsg, result));
        }
      }
    }

    //
    if (!isStringEmpty(avatar)) {
      modifyData["avatar"] = avatar;

      if (needUpdateMp) {
        const result = (await modifyHeadImage(
          mp.wxAppId as string,
          avatar
        )) as any;
        console.log("[setAppDetails] avatar avatar:", avatar);

        if (result.errcode !== 0) {
          return res
            .status(400)
            .send(generateResponse(400, result.errmsg, result));
        }
      }
    }

    const application = await prisma.application.update({
      where: {
        id: appId,
      },
      data: modifyData,
    });

    res.status(200).send(generateResponse(200, OPERATION_SUCCESS, application));
  } catch (e: any) {
    res.status(400).send(generateResponse(400, e.errmsg, e));
  }
};
