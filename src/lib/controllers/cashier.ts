import { OPERATION_SUCCESS, PARAMS_ERROR } from "@/utils/messages";
import prisma from "lib/prisma";
import { generateResponse } from "lib/response";
import { getFromBody } from "lib/utils";
import { NextApiRequest, NextApiResponse } from "next";

export const cancelOrderController = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const id = getFromBody(req, "id");
};

export const orderDetailsController = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const id = getFromBody(req, "id");
  if (!id) return res.status(400).send(generateResponse(400, PARAMS_ERROR));

  const data = await prisma.subscriptionOrder.findFirst({
    where: {
      id,
    },
  });

  if (data?.orderUserId !== userId)
    return res.status(402).send(generateResponse(402, "not your order!"));

  res.status(200).send(generateResponse(200, OPERATION_SUCCESS, data));
};

export const createOrderController = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const name = getFromBody(req, "name");
  const desc = getFromBody(req, "desc");
  const price = getFromBody(req, "price");
  const returnUrl = getFromBody(req, "returnUrl");
  const notifyUrl = getFromBody(req, "notifyUrl");
  const from = getFromBody(req, "from");
  let teamId = getFromBody(req, "teamId");

  if (!teamId) {
    const team = await prisma.teamMember.findFirst({
      where: {
        memberId: userId,
      },
    });
    if (!team) {
      return res.status(400).send(generateResponse(400, "team not find"));
    }
    teamId = team.id;
  }

  const orderAdd = await prisma.subscriptionOrder.create({
    // TODO type error
    // @ts-ignore
    data: {
      orderUserId: userId,
      price,
      name,
      desc,
      returnUrl,
      notifyUrl,
      from,
      teamId,
    },
  });

  return res
    .status(200)
    .send(generateResponse(200, OPERATION_SUCCESS, orderAdd));
};
