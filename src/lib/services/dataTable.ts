import { IApplicationTemplate } from "@/types/entities/Application";
import { RESOURCE_NOT_FIND } from "@/utils/messages";
import { generateKeys } from "@mtbird/core";
import prisma from "lib/prisma";
import { generateResponse } from "lib/response";
import { NextApiResponse } from "next";
import { teamCheck } from "./team";

export const generateDataModelFromTemplate = (
  template: IApplicationTemplate,
  userId: string,
  appId: string,
  teamId: string
) => {
  const tranDataModels = (template.dataModels as any).map((cur: any) => {
    return prisma.dataModel.create({
      data: {
        id: generateKeys(),
        name: cur.name,
        appId: appId,
        creatorId: userId,
        teamId,
        DataModelField: cur.DataModelField,
        DataModelData: cur.DataModelData,
      },
    });
  });
  return tranDataModels;
};

export const dataModelCheck = async (
  res: NextApiResponse,
  userId: string,
  id: string
) => {
  const model = await prisma.dataModel.findFirst({ where: { id } });

  if (!model)
    return res.status(404).send(generateResponse(404, RESOURCE_NOT_FIND));
  if (!(await teamCheck(res, userId, model.teamId))) return false;
  return true;
};
