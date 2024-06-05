import { generateResponse } from "lib/response";
import { NextApiRequest, NextApiResponse } from "next/types";
import prisma from "../prisma";
import { teamCheck } from "../services/team";
import { getFromBody, getFromQuery } from "lib/utils";
import {
  createCompany,
  getAllMemberOfCompany,
  getCompanyById,
} from "lib/services/company";
import { PARAMS_ERROR } from "@/utils/messages";

export const createCompanyCtrl = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const name = getFromBody(req, "name") as string;
  try {
    const { company } = await createCompany(
      {
        name,
      },
      userId
    );

    return res.status(200).send(
      generateResponse(200, "", {
        company,
      })
    );
  } catch (error: any) {
    console.log(error)
    return res.status(500).send(generateResponse(500, error.msg));
  }
};

export const getAllMemberCtrl = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const companyId = getFromQuery(req, "companyId");
  if (!companyId)
    return res.status(400).send(generateResponse(400, "未指定企业"));

  const result = await getAllMemberOfCompany(companyId, userId);

  res.status(200).send(generateResponse(200, "", result));
};

export const getCompany = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const companyId = getFromQuery(req, "companyId");
  if (!companyId) {
    return res.status(400).send(generateResponse(400, "未指定企业"));
  }
  const result = await getCompanyById(companyId);

  if (!result) {
    return res.status(404).send(generateResponse(400, "未找到企业"));
  }
  return res.status(200).send(generateResponse(200, "", result));
};

export const addTeam = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const companyId = getFromQuery(req, "companyId");
  if (!companyId) {
    return res.status(400).send(generateResponse(400, "未指定企业"));
  }
  const result = await getCompanyById(companyId);
  if (!result) {
    return res.status(404).send(generateResponse(400, "未找到企业"));
  }

  const avatar = getFromBody(req, "avatar");
  const name = getFromBody(req, "name");

  try {
    const teamEntity = await prisma.$transaction(async (tx) => {
      // 创建团队
      const entity = await tx.team.create({
        data: {
          name,
          avatar: avatar || process.env.DEFAULT_TEAM_IMAGE,
          creatorId: userId,
          companyId,
        },
      });

      // 添加自己为团队成员
      await tx.teamMember.create({
        data: {
          type: 1,
          memberId: userId,
          teamId: entity.id,
        },
      });

      return entity;
    });

    res.status(200).send(
      generateResponse(200, "", {
        team: teamEntity,
      })
    );
  } catch (error: any) {
    console.log("add team error", error);
    res.status(500).send(generateResponse(500, error.msg));
  }
};

export const removeMember = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const memberId = getFromQuery(req, "memberId");
  const companyId = getFromQuery(req, "companyId");

  if (!memberId || !companyId) {
    return res.status(400).send(generateResponse(400, PARAMS_ERROR));
  }

  const member = await prisma.companyMember.findFirst({
    where: {
      companyId,
      memberId,
    },
  });

  if (member) {
    await prisma.companyMember.delete({
      where: {
        id: member.id,
      },
    });
  }

  res.status(200).send(generateResponse(200, ""));
};
