import {
  OPERATION_SUCCESS,
  PARAMS_NEEDED,
  PARAMS_ERROR,
  PASSWORD_FORMAT_FAILED,
  PHONE_NUMBER_FORMAT_ERROR,
  RESOURCE_NOT_FIND,
  VERIFY_CODE_ERROR,
  NO_AUTH,
} from "@/utils/messages";
import { genPassword } from "lib/crypto";
import { generateResponse } from "lib/response";
import { getFromBody, getFromQuery, vaildPassword } from "lib/utils";
import { NextApiRequest, NextApiResponse } from "next/types";
import prisma from "../prisma";
import { verifyPhoneNumber } from "@/utils/index";
import { verifyCode } from "./auth";
import { register } from "lib/services/auth";
import requestIp from "request-ip";

export const updatePassword = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const password = getFromBody(req, "password") as string;

  if (!vaildPassword(password))
    return res.status(422).send(generateResponse(422, PASSWORD_FORMAT_FAILED));

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      password: genPassword(password),
    },
  });

  return res.status(200).send(generateResponse(200, OPERATION_SUCCESS));
};

export const updateUserProfile = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const nickname = getFromBody(req, "nickname") as string;
  const avatar = getFromBody(req, "avatar") as string;

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      nickname: nickname,
      avatar: avatar,
    },
  });

  return res.status(200).send(generateResponse(200, OPERATION_SUCCESS));
};

export const getUserInfo = async (res: NextApiResponse, userId: string, accessIdentifier?: string) => {
  const info = await prisma.user.findFirst({
    where: {
      id: userId,
    },
    select: {
      name: true,
      nickname: true,
      email: true,
      phone: true,
      avatar: true,
      TeamMember: {
        select: {
          team: true,
        },
      },
      UserWechatInfo: {
        select: {
          nickname: true,
          headImage: true,
          corpid: true
        },
      },
      companyMember: {
        select: {
          company: true,
        }
      },
      dealer: true,
      // Company: {
      //   where: {
      //     status: 0,
      //   },
      //   include: {
      //     companyTeam: true,
      //   }
      // },
      registryInfo: true,
    },
  });
  if (!info)
    return res.status(404).send(generateResponse(404, RESOURCE_NOT_FIND));

  // if (!await validateSessionByAccessIdentifier(userId, accessIdentifier)) {
  //   return res.status(401).send("Please login");
  // }

  const teams = info.TeamMember.map((cur) => {
    if (cur.team.status === -1) return undefined;
    return cur.team;
  }).filter((cur) => !!cur);

  return res.status(200).send(
    generateResponse(200, "", {
      name: info.name,
      nickname: info.nickname,
      email: info.email,
      phone: info.phone,
      avatar: info.avatar,
      teams,
      wxInfo: info.UserWechatInfo,
      company: info.companyMember?.map(item => item.company).filter(Boolean),
      dealer: {
        level: info.dealer?.dealerLevel,
        id: info.dealer?.id,
      },
      registryInfo: info.registryInfo
    })
  );
};


export const getBasicPublicUserInfo = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const userId = getFromQuery(req, 'id');

  if (!userId) {
    return res.status(400).send(generateResponse(400, PARAMS_NEEDED));
    // return res.status(400).send(generateResponse(400, RESOURCE_NOT_FIND));
  }


  const info = await prisma.user.findFirst({
    where: {
      id: userId,
    },
    select: {
      name: true,
      nickname: true,
      avatar: true,
    },
  });

  if (!info) {
    return res.status(404).send(generateResponse(404, RESOURCE_NOT_FIND));
  }

  return res.status(200).send(generateResponse(200, OPERATION_SUCCESS, info));;
}

export const bindPhone = async(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const phone = getFromBody(req, "phone");
  const code = getFromBody(req, "code");
  const confirmed = getFromBody(req, "confirmed");

  if (!phone || !code) {
    return res.status(400).send(generateResponse(400, PARAMS_ERROR));
  }

  if (!verifyPhoneNumber(phone)) {
    return res
      .status(400)
      .send(generateResponse(400, PHONE_NUMBER_FORMAT_ERROR));
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      phone,
    }
  });

  if (existingUser) {
    if (!confirmed) {
      return res
      .status(409)
      .send(generateResponse(409, "手机号已注册"));
    }

    if (!(await verifyCode(phone, code))) {
      return res.status(400).send(generateResponse(400, VERIFY_CODE_ERROR));
    }
    
    await prisma.user.update({
      where: {
        id: existingUser.id,
      },
      data: {
        phone: `delete-${phone}`,
      }
    })
  } else {
    if (!(await verifyCode(phone, code))) {
      return res.status(400).send(generateResponse(400, VERIFY_CODE_ERROR));
    }
  }

  const user = await prisma.user.findFirst({
    where: {
      id: userId
    }
  });

  if (!user) {
    return res.status(404).send(generateResponse(404, RESOURCE_NOT_FIND));
  }

  if (user.phone) {
    console.log('update phone', user.phone, phone);
  }

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      phone,
    }
  });

  return res.status(200).send(generateResponse(200, OPERATION_SUCCESS));
}


export const registerFromDealer = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const ip = requestIp.getClientIp(req);
  const phone = getFromBody(req, "phone");
  const actionUserId = getFromBody(req, "actionUserId");


  const actionUser = await prisma.user.findUnique({
    where: {
      id: actionUserId,
    },
    include: {
      dealer: true,
    }
  });

  if (!verifyPhoneNumber(phone)) {
    return res
      .status(400)
      .send(generateResponse(400, PHONE_NUMBER_FORMAT_ERROR));
  }

  if (!actionUser?.dealerId) {
    return res
      .status(400)
      .send(generateResponse(400, NO_AUTH));
  }

  let user = await prisma.user.findFirst({
    where: {
      phone,
    },
  });

  let isRegister = false;
  if (!user) {
    isRegister = true;
    user = await register(
      ip || "",
      {
        phone,
      },
      "代理商"
    );
    
    if (actionUser) {
      await prisma.user.update({
        where: {
          id: user.id
        },
        data: {
          fromDealerId: actionUser?.dealerId,
        }
      })
    }

  }

  
  actionUser && await prisma.dealerProductRecord.create({
    data: {
      dealerId: actionUser?.dealerId!,
      actionUserId: actionUser.id,
      targetUserId: user.id,
    }
  })

  return res.status(200).send(generateResponse(200, OPERATION_SUCCESS, {
    register: isRegister,
    user,
  }));
};


export const registerFromApps = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const ip = requestIp.getClientIp(req);
  const phone = getFromBody(req, "phone");
  const appPath = getFromBody(req, "appPath");
  const userId = getFromBody(req, "userId");

  if (!verifyPhoneNumber(phone)) {
    return res
      .status(400)
      .send(generateResponse(400, PHONE_NUMBER_FORMAT_ERROR));
  }

  let where = userId ? {
    id: userId,
  } : {
    phone,
  }

  const data = userId ? {
    phone,
    userID: userId
  } : {
    phone
  }

  let user = await prisma.user.findFirst({
    where,
  });

  let isRegister = false;
  if (!user) {
    isRegister = true;
    user = await register(
      ip || "",
      data,
      `apps: ${appPath}`,
      {
        appsId: appPath
      } as any
    );
  }

  return res.status(200).send(generateResponse(200, OPERATION_SUCCESS, {
    register: isRegister,
    user,
  }));
};