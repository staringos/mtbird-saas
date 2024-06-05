import crypto from "crypto";
import { NextApiRequest, NextApiResponse } from "next";
import { getFromBody, randomString } from "../utils";
import { generateResponse } from "lib/response";
import { OPERATION_SUCCESS, PARAMS_ERROR } from "@/utils/messages";
import { buildLoginJWT, register } from "lib/services/auth";
import requestIp from "request-ip";
import prisma from "lib/prisma";

const jwt = require("jsonwebtoken");

export const visitorToken = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const anonyId = getFromBody(req, "anonyId") as string;
  const appPath = getFromBody(req, "appPath");

  const hmacAnnoyId =
    anonyId &&
    crypto
      .createHmac("sha1", process.env.VISITOR_SECRET!)
      .update(anonyId)
      .digest("hex");

  const ip = requestIp.getClientIp(req);
  const visitorId = hmacAnnoyId
    ? `visitor${hmacAnnoyId}`
    : `visitor${randomString(12)}`;
  // const hmac = crypto
  //   .createHmac("sha1", process.env.VISITOR_SECRET!)
  //   .update(visitorId)
  //   .digest("hex");

  // const payload = { userId: hmac, isVisitor: true };
  // if (appId) payload.appId = appId;

  const findUser = await prisma.user.findFirst({
    where: {
      id: visitorId,
    },
  });

  let userId: string | undefined;
  if (findUser) {
    userId = findUser.id;
  } else {
    const user = await register(
      ip || "",
      {
        userID: visitorId,
      },
      `apps: ${appPath}`,
      {
        appsId: appPath,
      } as any
    );

    userId = user.id;
  }

  const token = await buildLoginJWT(userId, undefined, undefined, undefined, {
    isVisitor: true,
  });

  return res.status(200).send(
    generateResponse(200, OPERATION_SUCCESS, {
      token: token,
      userId,
    })
  );
};
