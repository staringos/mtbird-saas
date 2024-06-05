import {
  IApplication,
  IApplicationTemplate,
} from "@/types/entities/Application";
import { IPage } from "@/types/entities/Page";
import { RESOURCE_NOT_FIND } from "@/utils/messages";
import { generateKeys } from "@mtbird/core";
import { generateResponse } from "lib/response";
import { NextApiResponse } from "next/types";
import prisma from "../prisma";
import { teamCheck } from "../services/team";

export const generatePagesFromTemplate = (
  template: IApplicationTemplate,
  userId: string,
  appId: string
) => {
  const res = [];
  const data: IPage[] = (template.pages).map((cur) => {
    return {
      id: generateKeys(),
      title: cur.title,
      desc: cur.desc,
      avatar: cur.avatar,
      creatorId: userId,
      teamId: null,
      content: cur.content,
      type: cur.type,
      isNativePage: cur.isNativePage,
      appId,
      routeKey: cur.routeKey,
    };
  });

  res.push(
    prisma.page.createMany({
      data,
    })
  );

  res.push(
    prisma.pageHistory.createMany({
      data: data.map((cur: any) => {
        return {
          pageId: cur.id,
          creatorId: userId,
          content: cur.content,
        };
      }),
    })
  );

  return res;
};

export const pageCheck = async (
  res: NextApiResponse,
  pageId: string,
  userId: string
) => {
  const page = await prisma.page.findFirst({
    where: {
      id: pageId,
    },
  });

  if (!page) {
    res.status(404).send(generateResponse(404, RESOURCE_NOT_FIND));
    return false;
  }

  const app = await prisma.application.findFirst({
    where: {
      id: page.appId as string,
    },
  });

  // no auth to modify
  if (!app?.teamId || !teamCheck(res, userId, app?.teamId)) return false;
  return page;
};
