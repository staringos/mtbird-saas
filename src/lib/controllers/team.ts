import {
  INVITE_FAILED_ALREADY_IN_TEAM,
  INVITE_FAILED_TRY_LATER,
  NAME_CANNOT_BE_NULL,
  OPERATION_SUCCESS,
  PARAMS_ERROR,
  TEAM_DELETE_NO_AUTH,
  TEAM_DELETE_SUCCESS,
  TEAM_EXISTS,
  TEAM_NAME_CANNOT_EMPTY,
  UPDATE_SUCCESS,
  PARAMS_NEEDED,
  ORDER_REPEAT,
  PRICE_NOT_MATCH,
} from "@/utils/messages";
import { generateResponse } from "lib/response";
import { NextApiRequest, NextApiResponse } from "next/types";
import ITeam from "types/entities/Team";
import prisma from "../prisma";
import { isStringEmpty, phoneMask } from "../../utils";
import { getFromBody, getFromQuery } from "lib/utils";
import { teamCheck } from "lib/services/team";
import { register } from "lib/services/auth";
import { send } from "lib/sendMsg";
import isNumber from "lodash/isNumber";
import { getPrice } from "@/utils/common";
import { addMember, getCompanyByTeamId } from "lib/services/company";

const { sign } = require("jsonwebtoken");

export const takeOrder = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const teamId = getFromQuery(req, "id") as string;
  if (!teamCheck(res, userId, teamId)) return;

  const order = await prisma.subscriptionOrder.findFirst({
    where: {
      teamId,
      status: "created",
    },
  });

  if (order)
    return res.status(400).send(generateResponse(407, ORDER_REPEAT, order));

  const companyName = getFromBody(req, "companyName") as string;
  const version = getFromBody(req, "version") as any;
  const period = getFromBody(req, "period") as any;
  const times = getFromBody(req, "times") as number;
  const contact = getFromBody(req, "contact") as string;
  const price = getFromBody(req, "price") as number;

  if (
    isStringEmpty(version) ||
    isStringEmpty(period) ||
    !isNumber(price) ||
    price <= 0 ||
    !isNumber(times) ||
    times <= 0
  ) {
    return res.status(400).send(generateResponse(400, PARAMS_NEEDED));
  }
  const goods = await prisma.subscriptionGood.findMany({
    orderBy: [
      {
        sort: "asc",
      },
    ],
  });

  const good: any | undefined = goods.find(
    (cur: any) => cur.version === version
  );

  if (!good) return res.status(400).send(generateResponse(400, PARAMS_ERROR));

  const pricesBE: (number | string)[] = getPrice(
    goods as any[],
    times,
    period,
    version
  );

  console.log("pricesBE:", pricesBE);

  if (price !== pricesBE[0])
    return res.status(400).send(generateResponse(400, PRICE_NOT_MATCH));

  const orderAdd = await prisma.subscriptionOrder.create({
    data: {
      goodId: good.id,
      orderUserId: userId,
      teamId,
      companyName,
      contact,
      period: period as any,
      times,
      price: pricesBE[0],
      version,
    },
  });

  return res
    .status(200)
    .send(generateResponse(200, OPERATION_SUCCESS, orderAdd));
};

export const getList = async (res: NextApiResponse, userId: string) => {
  const list = await prisma.team.findMany({
    where: {
      TeamMember: {
        some: {
          memberId: userId,
        },
      },
      NOT: {
        status: -1,
      },
    },
  });

  return res.status(200).send(generateResponse(200, "", list));
};

export const verifyTeam = (entity: ITeam, res: NextApiResponse) => {
  if (isStringEmpty(entity.name)) {
    res.status(400).send(TEAM_NAME_CANNOT_EMPTY);
    return false;
  }
  return true;
};

export const add = async (
  req: NextApiRequest,
  userId: string,
  res: NextApiResponse
) => {
  const { name, desc, avatar, companyId } = req.body;
  if (!verifyTeam(req.body, res)) return false;

  const teams = await prisma.team.findMany({ where: { name } });
  if (teams && teams.length !== 0)
    return res.status(400).send(generateResponse(400, TEAM_EXISTS));

  const entity = await prisma.team.create({
    data: {
      name,
      desc,
      avatar: avatar || process.env.DEFAULT_TEAM_IMAGE,
      creatorId: userId,
      companyId,
    },
  });

  await prisma.teamMember.create({
    data: {
      type: 1,
      memberId: userId,
      teamId: entity.id,
    },
  });

  return res.status(200).send(generateResponse(200, "", entity));
};

export const modify = async (res: NextApiResponse, id: string, data: ITeam) => {
  const teams = await prisma.team.findMany({ where: { name: data.name } });
  if (teams && teams.length !== 0)
    return res.status(400).send(generateResponse(400, TEAM_EXISTS));

  await prisma.team.update({
    where: {
      id,
    },
    data: {
      name: data.name,
      desc: data.desc,
      avatar: data.avatar,
    },
  });
  return res.status(200).send(generateResponse(200, TEAM_DELETE_SUCCESS));
};

export const delTeam = async (
  res: NextApiResponse,
  id: string,
  userId: string
) => {
  const teamMember = await prisma.teamMember.findMany({
    where: {
      teamId: id,
      memberId: userId,
    },
  });

  if (!teamMember || teamMember.length < 1)
    return res.status(401).send(generateResponse(401, TEAM_DELETE_NO_AUTH));
  if (teamMember[0].type !== 1)
    return res.status(401).send(generateResponse(401, TEAM_DELETE_NO_AUTH));

  await prisma.team.update({
    where: {
      id,
    },
    data: {
      status: -1,
    },
  });
  res.status(200).send(generateResponse(200, UPDATE_SUCCESS));
  return false;
};

export const getMembers = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const teamId = getFromQuery(req, "id") as string;
  const team = await teamCheck(res, userId, teamId);
  if (!team) return false;

  const teamMembers = await prisma.teamMember.findMany({
    where: {
      teamId: teamId,
    },
    include: {
      member: {
        select: {
          id: true,
          name: true,
          nickname: true,
          phone: true,
          avatar: true,
          createdAt: true,
        },
      },
    },
  });

  return res.status(200).send(
    generateResponse(
      200,
      OPERATION_SUCCESS,
      teamMembers.map((cur) => ({
        ...cur.member,
        phone: phoneMask(cur.member.phone as string),
        createdAt: cur.createdAt,
      }))
    )
  );
};

export const deleteMembers = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const teamId = getFromQuery(req, "id") as string;
  const targetUserId = getFromBody(req, "targetUserId") as string;

  if (!targetUserId)
    return res.status(422).send(generateResponse(422, PARAMS_ERROR));
  if (!teamCheck(res, userId, teamId)) return false;
  await prisma.teamMember.deleteMany({
    where: {
      teamId,
      memberId: targetUserId,
    },
  });

  return res.status(200).send(generateResponse(200, OPERATION_SUCCESS));
};

enum InviteFrom {
  StaringAITeamInvite = "StaringAITeamInvite",
}
export const inviteMember = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const teamId = getFromQuery(req, "id") as string;
  const phone = getFromBody(req, "phone") as string;
  const from = getFromBody(req, "from") as undefined | InviteFrom;

  if (from !== InviteFrom.StaringAITeamInvite) {
    if (!(await teamCheck(res, userId, teamId))) return false;
  }
  

  let targetUser = await prisma.user.findFirst({
    where: {
      phone,
    },
  });

  // register user
  if (!targetUser) {
    targetUser = await register(
      req,
      {
        phone,
      },
      "(团队邀请)"
    );

    if (!targetUser) {
      return res
        .status(500)
        .send(generateResponse(500, INVITE_FAILED_TRY_LATER));
    }
  } else {
    // if already in team, then 409 conflict
    const alreadyInTeam = await prisma.teamMember.findFirst({
      where: {
        teamId,
        memberId: targetUser.id,
      },
    });

    if (alreadyInTeam)
      return res
        .status(409)
        .send(generateResponse(409, INVITE_FAILED_ALREADY_IN_TEAM));
  }

  // 如果是通过小星的团队邀请，需要帮用户在小星里注册账号
  if (from === InviteFrom.StaringAITeamInvite) {
    try {
      const token = sign({ userId: targetUser.id }, process.env.JWT_SECRET);

      // 注册小星账号
      // await getAiSign(token);

      // 如果团队有所属企业 将用户拉入企业
      const company = await getCompanyByTeamId(teamId);

      const inviteResult = await prisma.$transaction(async (tx) => {
        if (
          company &&
          !(await tx.companyMember.count({
            where: { memberId: targetUser?.id },
          }))
        ) {
          await addMember(targetUser?.id!, company.id, tx as PrismaClient);
        }

        // await staringAiCallback(userId, "inviteComplete", {
        //   company,
        //   user: targetUser,
        //   teamId,
        // });

        const teamMember = await prisma.teamMember.create({
          data: {
            teamId,
            memberId: targetUser?.id!,
            type: 2,
          },
          include: {
            team: true,
          }
        });

        try {
          send(phone, `{\"team\":\"${teamMember?.team?.name}\"}`, "SMS_464036111");
        } catch (e) {}

        return true;
      });

      if (!inviteResult) return;
    } catch (error) {
      console.log(error);
    }

  } else {
    await prisma.teamMember.create({
      data: {
        teamId,
        memberId: targetUser.id,
        type: 2,
      },
    });

    try {
      send(phone, ``, "SMS_254870805");
    } catch (e) {}
  }

 

  return res.status(200).send(generateResponse(200, OPERATION_SUCCESS));
};

export const updateTeamProfile = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const id = getFromQuery(req, "id") as string;
  const name = getFromBody(req, "name") as string;
  const avatar = getFromBody(req, "avatar") as string;

  if (isStringEmpty(name))
    return res.status(422).send(generateResponse(422, NAME_CANNOT_BE_NULL));
  if (!teamCheck(res, userId, id)) return false;

  await prisma.team.update({
    where: {
      id,
    },
    data: {
      name,
      avatar,
    },
  });
  res.status(200).send(generateResponse(200, UPDATE_SUCCESS));
  return false;
};

export const getTeam = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const id = getFromQuery(req, "id") as string;

  if (!teamCheck(res, userId, id)) return false;

  const data = await prisma.team.findFirst({
    where: {
      id,
    },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          avatar: true,
          status: true,
        },
      },
    },
  });

  res.status(200).send(generateResponse(200, UPDATE_SUCCESS, data));
  return false;
};

export const getCompanyInfos = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const id = getFromQuery(req, "id") as string;

  if (!teamCheck(res, userId, id)) return false;

  const data = await prisma.companyInfo.findMany({
    where: {
      teamId: id,
    },
  });

  return res.status(200).send(generateResponse(200, OPERATION_SUCCESS, data));
};

export const addCompanyInfo = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const name = getFromBody(req, "name") as string;
  const teamId = getFromBody(req, "teamId") as string;

  const code = getFromBody(req, "code") as string;
  const codeType = getFromBody(req, "codeType") as string;
  const legalPersonaWechat = getFromBody(req, "legalPersonaWechat") as string;
  const legalPersonaName = getFromBody(req, "legalPersonaName") as string;
  const legalPersonaIdCard = getFromBody(req, "legalPersonaIdCard") as string;
  const licenseUrl = getFromBody(req, "licenseUrl") as string;

  if (
    isStringEmpty(licenseUrl) ||
    isStringEmpty(name) ||
    isStringEmpty(teamId) ||
    isStringEmpty(code) ||
    !isNumber(codeType) ||
    isStringEmpty(legalPersonaWechat) ||
    isStringEmpty(legalPersonaIdCard) ||
    isStringEmpty(legalPersonaName)
  ) {
    return res.status(400).send(generateResponse(400, PARAMS_NEEDED));
  }

  const data = await prisma.companyInfo.create({
    data: {
      code,
      codeType: parseInt(codeType),
      name,
      teamId,
      legalPersonaWechat,
      creatorId: userId,
      legalPersonaName,
      legalPersonaIdCard,
      componentPhone: "",
      licenseUrl,
    },
  });

  return res.status(200).send(generateResponse(200, OPERATION_SUCCESS, data));
};

export const getDefaultTeamController = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const data = await prisma.team.findFirst({
    where: {
      TeamMember: {
        some: {
          memberId: userId,
        },
      },
    },
    orderBy: {
      sort: "asc",
    },
  });
  res.status(200).send(generateResponse(200, OPERATION_SUCCESS, data));
  return false;
};

export const getMemberCount = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const teamId = getFromQuery(req, "id");
  if (!teamId) {
    return res.status(400).send(generateResponse(400, PARAMS_NEEDED));
  }
  const companyEntity = await getCompanyByTeamId(teamId);

  let company;
  if (companyEntity) {
    company = await prisma.companyMember.count({
      where: {
        companyId: companyEntity.id,
      },
    });
  }

  const team = await prisma.teamMember.count({
    where: {
      teamId,
    },
  });
  res.status(200).send(
    generateResponse(200, OPERATION_SUCCESS, {
      company,
      team,
    })
  );
};
