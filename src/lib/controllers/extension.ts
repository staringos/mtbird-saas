import { isStringEmpty } from "utils";
import {
  EXTENSION_NAME_NOT_EMPTY,
  EXTENSION_NOT_FIND,
  EXTENSION_VERSION_EXISTS,
  EXTENSION_VERSION_NOT_EMPTY,
  OPERATION_SUCCESS,
  RESOURCE_NOT_FIND,
  TOKEN_NO_AUTH,
  USER_NO_AUTH,
} from "@/utils/messages";
import { generateResponse } from "lib/response";
import { NextApiRequest, NextApiResponse } from "next/types";
import prisma from "../prisma";
import template from "lodash/template";
import { teamCheck } from "../services/team";
import { getPaginationParams, paginationFind } from "lib/pagination";
import { getFromQuery } from "lib/utils";
const jwt = require("jsonwebtoken");

const registryPath =
  "https://registry.staringos.com/<%- name %>/<%- version %>/";

/**
 * pre1. check if user has auth to modify team send by token
 * 1. if there no extension named as params name, then create extension
 * 2. if there extension exists
 *  1. has version used? -> 422
 *  2. teamId is right? -> 401
 *  2. new version
 *  3. update extension latest version
 * 4. return 200
 *
 * @param res
 * @param userId
 * @param teamId
 * @param body
 * @returns {extension: extension object, history: extension version object}
 */
export const publish = async (
  res: NextApiResponse,
  userId: string,
  teamId: string,
  body: any
) => {
  const { name, version, title, desc } = body;

  if (isStringEmpty(teamId))
    return res
      .status(401)
      .send(generateResponse(401, EXTENSION_NAME_NOT_EMPTY));
  if (isStringEmpty(name))
    return res
      .status(400)
      .send(generateResponse(400, EXTENSION_NAME_NOT_EMPTY));
  if (isStringEmpty(version))
    return res
      .status(400)
      .send(generateResponse(400, EXTENSION_VERSION_NOT_EMPTY));
  if (!(await teamCheck(res, userId, teamId))) return false;

  const tmp = template(registryPath);
  const path = tmp(body);

  // has this extension
  let extension = await prisma.extension.findFirst({
    where: {
      name: name,
    },
  });

  if (!extension) {
    // create extension
    extension = await prisma.extension.create({
      data: {
        name,
        title,
        desc,
        path,
        teamId,
        ownerId: userId,
        ownerType: 2,
        private: body.private,
        latestVersion: version,
      },
    });
  } else {
    // is extension belongs to token's team?
    if (extension.teamId !== teamId)
      return res.status(401).send(generateResponse(401, TOKEN_NO_AUTH));

    // has same version before?
    const extensionHistory = await prisma.extensionHistory.findFirst({
      where: {
        extensionId: extension.id,
        version,
      },
    });

    if (extensionHistory) {
      return res
        .status(422)
        .send(generateResponse(422, EXTENSION_VERSION_EXISTS));
    }

    // update extension latest version field
    extension = await prisma.extension.update({
      where: {
        id: extension.id,
      },
      data: {
        title,
        desc,
        latestVersion: version,
      },
    });
  }

  // add new version
  const extensionHistory = await prisma.extensionHistory.create({
    data: {
      extensionId: extension.id,
      path,
      version,
    },
  });

  // success
  if (extensionHistory) {
    // publish success
    return "success";
  }

  return res.status(400).send(generateResponse(400, OPERATION_SUCCESS));
};

export const getToken = async (
  res: NextApiResponse,
  userId: string,
  teamId: string,
  body: any
) => {
  if (!(await teamCheck(res, userId, teamId))) return false;

  const token = jwt.sign({ userId, teamId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  return res.status(200).send(
    generateResponse(200, OPERATION_SUCCESS, {
      token,
    })
  );
};

export const deleteHistory = async (
  res: NextApiResponse,
  userId: string,
  teamId: string,
  body: any
) => {
  if (!(await teamCheck(res, userId, teamId))) return false;

  let extension = await prisma.extension.findFirst({
    where: {
      name: body.name,
    },
  });

  if (!extension)
    return res.status(404).send(generateResponse(404, EXTENSION_NOT_FIND));
  if (extension.teamId !== teamId)
    return res.status(401).send(generateResponse(401, EXTENSION_NOT_FIND));

  await prisma.extensionHistory.deleteMany({
    where: {
      version: body.version as string,
      id: extension.id as string,
    },
  });

  return res.status(200).send(generateResponse(200, OPERATION_SUCCESS));
};

export const getExtensionList = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const pagination = getPaginationParams(req);
  const scope = getFromQuery(req, "scope") || "market";
  const teamId = getFromQuery(req, "teamId");
  const appId = getFromQuery(req, "appId");

  let where: any = {
    private: false,
  };

  // filter by name or title or desc field
  if (!isStringEmpty(pagination.query || "")) {
    where = {
      OR: [
        {
          name: {
            contains: pagination.query,
          },
        },
        {
          title: {
            contains: pagination.query,
          },
        },
        {
          desc: {
            contains: pagination.query,
          },
        },
      ],
      NOT: {
        private: true,
      },
    };
  }

  if (scope === "team" && teamId) {
    if (where.OR) {
      where["AND"]["teamId"] = teamId;
    } else {
      where["teamId"] = teamId;
    }
  }

  if (scope === "my") {
    if (where.OR) {
      where["AND"]["ownerId"] = userId;
    } else {
      where["ownerId"] = userId;
    }
  }

  const include = {
    appExtensionInstall: {
      where: {
        appId,
      },
    },
  };

  const data = await paginationFind(
    prisma.extension,
    pagination,
    where,
    include
  );

  if (data.data && data.data.length > 0) {
    data.data.forEach((cur: any) => {
      const hasInstalled = cur.appExtensionInstall.length > 0;
      cur.hasInstalled = hasInstalled;
      delete cur.appExtensionInstall;
    });
  }

  return res.status(200).send(data);
};

export const getExtensionManageList = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const pagination = getPaginationParams(req);
  const teamId = getFromQuery(req, "teamId") as string;
  if (!(await teamCheck(res, userId, teamId))) return false;

  const where = { teamId };
  const data = await paginationFind(prisma.extension, pagination, where);

  return res.status(200).send(data);
};
