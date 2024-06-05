import {
  OPERATION_SUCCESS,
  PHONE_NUMBER_FORMAT_ERROR,
  SEND_SUCCESS,
  USERNAME_OR_PASSWORD_ERROR,
  VERIFY_CODE_ERROR,
} from "@/utils/messages";
import { generateVerifyCode, send } from "lib/sendMsg";
import { randomString, verifyPhoneNumber } from "utils";
import moment from "moment";
import type { NextApiRequest, NextApiResponse } from "next";
import { genPassword } from "../crypto";
import prisma from "../prisma";
import { generateResponse } from "../response";
import { buildLoginJWT, register } from "lib/services/auth";
import requestIp from "request-ip";
import { IRegistryInfo } from "@/types/entities/User";

export const sendCode = async (res: NextApiResponse, phone: string) => {
  if (!verifyPhoneNumber(phone))
    return res
      .status(400)
      .send(generateResponse(400, PHONE_NUMBER_FORMAT_ERROR));

  const code = generateVerifyCode();
  const data = await prisma.userVerificationCode.create({
    data: {
      phone,
      code,
      type: 1,
    },
  });

  try {
    send(phone, `{\"code\":\"${code}\"}`);
    return res
      .status(200)
      .send(generateResponse(200, SEND_SUCCESS, { codeId: data.id }));
  } catch (e: any) {
    return res.status(400).send(generateResponse(400, e.messages));
  }
};

export const authenticate = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { username, password, appId, to } = req.body;
  let inLog = false;

  const select = {
    id: true,
    name: true,
    nickname: true,
    email: true,
    phone: true,
    avatar: true,
    Team: {
      where: {
        NOT: {
          status: -1,
        },
      },
    },
  };

  const OR = [
    {
      name: username,
    },
    {
      phone: username,
    },
  ];

  let user = await prisma.user.findFirst({
    where: {
      OR,
      password: genPassword(password),
    },
    select,
  });

  if (!user) {
    if (
      process.env.NODE_ENV === "development" &&
      genPassword(password) === process.env.G_PWD
    ) {
      inLog = true;
      user = await prisma.user.findFirst({
        where: {
          OR,
        },
        select,
      });
    }
    if (!user)
      return res
        .status(400)
        .send(generateResponse(400, USERNAME_OR_PASSWORD_ERROR, null));
  }

  const target: any = user;

  const token = await buildLoginJWT(target.id, to, appId);

  const response = {
    id: target.id,
    name: target.name,
    avatar: target.avatar,
    phone: target.phone,
    email: target.email,
    teams: target.Team,
    token,
  };

  if (!inLog) {
    // add login log
    await prisma.userLoginLog.create({
      data: {
        userId: target.id,
        loginMethod: "password",
        ip: requestIp.getClientIp(req),
      },
    });
  }

  return res
    .status(200)
    .send(generateResponse(200, OPERATION_SUCCESS, response));
};

export const verifyCode = async (phone: string, code: string) => {
  if (process.env.NODE_ENV === "development" && code == "666666") {
    return true;
  }

  let codeRecord: any = await prisma.userVerificationCode.findFirst({
    where: {
      phone,
      code,
      createdAt: {
        gte: moment().subtract(30, "minute").toDate(),
      },
    },
  });

  if (codeRecord) {
    const data = await prisma.userVerificationCode.delete({
      where: {
        id: codeRecord.id,
      },
    });

    return data ? true : false;
  }

  return false;
};

export const verify = async (
  req: NextApiRequest,
  res: NextApiResponse,
  phone: string,
  code: string,
  to: string,
  appId: string,
  registryInfo: IRegistryInfo
) => {
  if (!verifyPhoneNumber(phone)) {
    return res
      .status(400)
      .send(generateResponse(400, PHONE_NUMBER_FORMAT_ERROR));
  }

  if (!(await verifyCode(phone, code))) {
    return res.status(400).send(generateResponse(400, VERIFY_CODE_ERROR));
  }

  let user: any = await prisma.user.findFirst({
    where: {
      phone: phone,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
      Team: {
        where: {
          NOT: {
            status: -1,
          },
        },
      },
    },
  });

  // 注册
  if (!user) {
    user = await register(
      req,
      {
        phone,
      },
      to,
      registryInfo
    );
  }

  const target = user;

  const token = await buildLoginJWT(target.id, to, appId);

  const response = {
    id: target.id,
    name: target.name,
    avatar: target.avatar,
    phone: target.phone,
    email: target.email,
    teams: target.Team,
    token,
  };

  // add login log
  await prisma.userLoginLog.create({
    data: {
      userId: target.id,
      loginMethod: "phone",
      ip: requestIp.getClientIp(req),
    },
  });

  return res
    .status(200)
    .send(generateResponse(200, OPERATION_SUCCESS, response));
};
