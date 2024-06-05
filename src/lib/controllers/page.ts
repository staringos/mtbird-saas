import {
  OPERATION_SUCCESS,
  PAGE_NO_HISTORY,
  PAGE_NO_PUBLISH,
  PARAMS_NEEDED,
  RESOURCE_NOT_FIND,
  THIS_VERSION_IS_LATEST,
  TITLE_CANNOT_BE_NULL,
} from "@/utils/messages";
import { generateResponse } from "lib/response";
import { NextApiRequest, NextApiResponse } from "next/types";
import { IPage } from "types/entities/Page";
import prisma from "../prisma";
import { teamCheck } from "../services/team";
import { flattenComponentTree, findComponentByKey } from "@mtbird/core";
import { IComponentInstance } from "@mtbird/shared/dist/types";
import { IPagination } from "@/types/entities/Common";
import { getPaginationParams, paginationFind } from "lib/pagination";
import { isStringEmpty, randomString } from "@/utils/index";
import { getFromQuery, timeZone } from "lib/utils";
import { pageCheck } from "lib/services/page";
import keys from "lodash/keys";

/**
 * 验证用户是否有操作某页面的权限
 * - 用户是否是该页面所属的应用的团队的团队成员
 * @param res
 * @param appId
 * @returns
 */
export const getPageListByAppId = async (
  res: NextApiResponse,
  userId: string,
  appId: string
) => {
  const app = await prisma.application.findFirst({
    where: {
      id: appId,
    },
  });

  if (!app?.teamId || !teamCheck(res, userId, app?.teamId)) return false;

  const pages = await prisma.page.findMany({
    where: {
      appId,
      NOT: {
        status: -1,
      },
    },
  });

  return res.status(200).send(generateResponse(200, "", pages));
};

export const add = async (
  res: NextApiResponse,
  userId: string,
  appId: string,
  data: IPage
) => {
  const app = await prisma.application.findFirst({
    where: {
      id: appId,
      NOT: {
        status: -1,
      },
    },
  });

  // no auth to modify
  if (!app?.teamId)
    return res.status(404).send(generateResponse(404, RESOURCE_NOT_FIND));
  if (!teamCheck(res, userId, app?.teamId)) return false;

  const { title, desc, avatar, content, type } = data;
  const page = await prisma.page.create({
    data: {
      title,
      desc,
      avatar,
      creatorId: userId,
      teamId: null,
      content,
      type,
      appId,
      routeKey: randomString(6),
    },
  });

  await prisma.pageHistory.create({
    data: {
      pageId: page.id,
      creatorId: userId,
      content,
    },
  });

  return res.status(200).send(generateResponse(200, "", page));
};

export const delPage = async (
  res: NextApiResponse,
  pageId: string,
  userId: string
) => {
  if (!pageCheck(res, pageId, userId)) return;

  await prisma.page.update({
    where: {
      id: pageId,
    },
    data: {
      status: -1,
    },
  });

  return res.status(200).send(generateResponse(200, OPERATION_SUCCESS));
};

export const modify = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const id = getFromQuery(req, "id") as string;
  const data = req.body;

  if (!pageCheck(res, id, userId)) return;
  if (isStringEmpty(data.title))
    return res.status(422).send(generateResponse(422, TITLE_CANNOT_BE_NULL));

  await prisma.page.update({
    where: {
      id,
    },
    data: {
      title: data.title,
      desc: data.desc,
      avatar: data.avatar,
      avatarShare: data.avatarShare,
      tags: data.tags,
      type: data.type,
    },
  });

  return res.status(200).send(generateResponse(200, OPERATION_SUCCESS));
};

const buildPageQueryCondition = (
  params: string | { appId: string; routeKey: string }
) => {
  if (typeof params === "string") {
    return {
      id: params,
    };
  } else {
    return {
      appId: params.appId,
      routeKey: params.routeKey,
    };
  }
};

export const getPageDetails = async (
  res: NextApiResponse,
  id: string | { appId: string; routeKey: string },
  userId: string,
  historyId: string,
  appId: string | null,
  domain: string,
  isPublish: boolean,
  noCheck?: boolean
) => {
  
  // if not id or id = 'home', get app's home page back
  if ((!id || id === "home") && appId) {
    const app = await prisma.application.findFirst({
      where: {
        OR: [
          {
            id: appId,
          },
          {
            domain: {
              domainName: domain,
            },
          },
        ],
      },
    });

    if (!app)
      return res
        .status(404)
        .send(generateResponse(404, PAGE_NO_PUBLISH + "123"));

    if (app?.homePageId) {
      id = app.homePageId;
    }
  }

  if (!noCheck && typeof id === "string" && !pageCheck(res, id, userId)) return;

  let page: any;

  // 如果有参数 id 或者 应用有设置首页，则使用id 或者应用首页，否则，则使用最早创建的页面作为首页返回
  if (id && id !== "home") {
    page = await prisma.page.findFirst({
      where: {
        ...buildPageQueryCondition(id),
      },
    });
  } else {
    // find first created page as home
    const where: Record<string, any> = {
      appId,
      NOT: {
        status: -1,
      },
    };

    if (isPublish) {
      where["NOT"]["publishedHistoryId"] = null; // 必须是发布过的页面
    }

    page = await prisma.page.findFirst({
      where,
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  const versionWhere = {
    pageId: page?.id || id,
  } as Record<string, any>;

  if (historyId) versionWhere.id = historyId;

  if (isPublish) {
    if (!page?.publishedHistoryId) {
      return res
        .status(404)
        .send(generateResponse(404, PAGE_NO_PUBLISH + "234"));
    }
    versionWhere.id = page?.publishedHistoryId;
  }

  let appMetadata = null;
  let application = null;

  if (page?.appId) {
    const app = await prisma.application.findFirst({
      where: {
        OR: [
          {
            id: page.appId,
          },
        ],
      },
    });
    
    if (typeof app?.metadata === "string") {
      try {
        app.metadata = JSON.parse(app?.metadata || "{}");
      } catch (error) {}
    }

    appMetadata = app?.metadata;
    application = app;
  }

  const history = await prisma.pageHistory.findFirst({
    where: versionWhere,
    orderBy: [
      {
        createdAt: "desc",
      },
    ],
  });

  res
    .status(200)
    .send(generateResponse(200, "", { history, page, appMetadata, app: application }));
};

export const addHistory = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const id = getFromQuery(req, "id") as string;
  const { content, avatar } = req.body;

  if (!pageCheck(res, id, userId)) return;

  const page: any = await prisma.page.findFirst({
    where: {
      id,
    },
  });

  if (!page)
    return res.status(404).send(generateResponse(404, RESOURCE_NOT_FIND));

  const trans: any[] = [
    prisma.pageHistory.create({
      data: {
        pageId: id,
        content,
        creatorId: userId,
      },
    }),
  ];

  if (!isStringEmpty(avatar)) {
    trans.push(
      prisma.page.update({
        where: {
          id,
        },
        data: {
          ...page,
          avatar,
        },
      })
    );
  }

  const result = await prisma.$transaction(trans);
  return res
    .status(200)
    .send(generateResponse(200, OPERATION_SUCCESS, result[0]));
};

/**
 * 1. get latest page history
 * 2. change page.publishHistoryId to latest page history
 * @param res
 * @param id
 * @param userId
 * @param content
 * @returns
 */
export const publishPage = async (
  res: NextApiResponse,
  id: string,
  userId: string,
  avatar: string
) => {
  if (!pageCheck(res, id, userId)) return;

  const history = await prisma.pageHistory.findFirst({
    where: {
      pageId: id,
    },
    orderBy: [
      {
        createdAt: "desc",
      },
    ],
  });

  if (!history) return generateResponse(404, PAGE_NO_HISTORY);

  const trans = [];

  const pageUpdate = {
    publishedHistoryId: history?.id,
  } as Record<string, any>;

  if (!isStringEmpty(avatar)) {
    pageUpdate.avatar = avatar;
  }

  // update page info
  trans.push(
    prisma.page.update({
      data: pageUpdate,
      where: {
        id,
      },
    })
  );

  // update page history as Published History
  trans.push(
    prisma.pageHistory.update({
      data: {
        isPublishedHistory: true,
      },
      where: {
        id: (history as any).id,
      },
    })
  );

  const result = await prisma.$transaction(trans);
  return generateResponse(200, OPERATION_SUCCESS, result[0]);
};

interface IAddFormDataParams {
  data: string;
  formId: string;
  userAgent: string;
}

export const addFormData = async (
  res: NextApiResponse,
  id: string,
  params: IAddFormDataParams
) => {
  const data = await prisma.formData.create({
    data: {
      pageId: id,
      ...params,
    },
  });

  res.status(200).send(generateResponse(200, OPERATION_SUCCESS, data));
};

export const getForm = async (req: NextApiRequest, res: NextApiResponse) => {
  const pageId = getFromQuery(req, "id");
  const formId = getFromQuery(req, "formId");

  const history = await prisma.pageHistory.findFirst({
    where: {
      pageId: pageId,
    },
    orderBy: [
      {
        createdAt: "desc",
      },
    ],
  });

  if (!history)
    return res.status(404).send(generateResponse(404, PAGE_NO_PUBLISH));

  const form = findComponentByKey(history?.content as any, formId as string);
  if (!form)
    return res.status(404).send(generateResponse(404, RESOURCE_NOT_FIND));
  return res.status(200).send(generateResponse(200, OPERATION_SUCCESS, form));
};

export const getPageFormDataList = async (
  res: NextApiResponse,
  id: string,
  userId: string,
  formId: string,
  pagination: IPagination,
  search: Record<string, any>
) => {
  if (!pageCheck(res, id, userId)) return;

  const commonKey = ["userAgent", "createdAt"];
  const where: Record<string, any> = {
    pageId: id,
    formId,
  };

  const dataSearch: Record<string, any> = [];
  const searchKeys = keys(search);

  // TODO fix search typeof Datetime and JSON error
  // code: 3143, message: "Invalid JSON path expression. The error is around character position 1."
  if (search && searchKeys.length > 0) {
    searchKeys.forEach((key) => {
      if (commonKey.indexOf(key) !== -1) {
        where[key] = search[key];
        return;
      }
      dataSearch.push({
        path: key,
        string_contains: search[key],
      });
    });
    where.data = dataSearch[0];
  }

  const result = await paginationFind(
    prisma.formData,
    pagination,
    where,
    null,
    {
      createdAt: "desc",
    }
  );

  if (!result.data) return res.status(200).send(result);

  result.data.forEach((cur: any) => {
    cur.createdAt = timeZone(cur.createdAt);
  });

  return res.status(200).send(result);
};

export const getPageFormList = async (
  res: NextApiResponse,
  id: string,
  userId: string
) => {
  if (!pageCheck(res, id, userId)) return;

  const history = await prisma.pageHistory.findFirst({
    where: {
      pageId: id,
    },
    orderBy: [
      {
        createdAt: "desc",
      },
    ],
  });

  if (!history) {
    return res.status(200).send(generateResponse(200, OPERATION_SUCCESS, []));
  }

  let content = history.content;
  if (typeof history.content === "string") {
    content = JSON.parse(history.content);
  }

  const list = flattenComponentTree([content] as any) as any;
  const data = list.filter((cur: IComponentInstance) => {
    return cur.componentName === "Form";
  });
  res.status(200).send(generateResponse(200, OPERATION_SUCCESS, data));
};

export const deleteFormData = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const dataId = getFromQuery(req, "dataId") as string;
  const id = getFromQuery(req, "pageId") as string;

  if (isStringEmpty(dataId))
    return res.status(400).send(generateResponse(400, PARAMS_NEEDED));
  if (!pageCheck(res, id, userId))
    return res.status(400).send(generateResponse(400, PARAMS_NEEDED));

  await prisma.formData.delete({
    where: {
      id: dataId,
    },
  });

  return res.status(200).send(generateResponse(200, OPERATION_SUCCESS));
};

export const getHistoryList = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const id = getFromQuery(req, "id") as string;
  const pagination = getPaginationParams(req);
  if (!id) res.status(400).send(generateResponse(400, PARAMS_NEEDED));
  if (!pageCheck(res, id, userId)) return;

  const condition = {
    pageId: id,
  };

  const include = {
    creator: {
      select: {
        id: true,
        name: true,
        nickname: true,
        avatar: true,
      },
    },
  };

  const orderBy = [
    {
      createdAt: "desc",
    },
  ];

  return res
    .status(200)
    .send(
      await paginationFind(
        prisma.pageHistory,
        pagination,
        condition,
        include,
        orderBy
      )
    );
};

/**
 * Rollback page history
 * By copy content as a new latest version
 * @param req
 * @param res
 * @param userId
 * @returns
 */
export const rollbackHistory = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const id = getFromQuery(req, "id") as string;
  const historyId = getFromQuery(req, "historyId") as string;

  if (!id || !historyId)
    return res.status(400).send(generateResponse(400, PARAMS_NEEDED));
  if (!pageCheck(res, id, userId)) return;

  const history = await prisma.pageHistory.findFirst({
    where: {
      id: historyId,
    },
  });

  if (!history)
    return res.status(404).send(generateResponse(404, PARAMS_NEEDED));

  const latestHistory = await prisma.pageHistory.findFirst({
    where: {
      id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (latestHistory && latestHistory.id === history.id) {
    return res.status(409).send(generateResponse(409, THIS_VERSION_IS_LATEST));
  }

  const newHistory = await prisma.pageHistory.create({
    data: {
      pageId: id,
      content: history.content || {},
      creatorId: userId,
    },
  });

  return res
    .status(200)
    .send(generateResponse(200, OPERATION_SUCCESS, newHistory));
};
