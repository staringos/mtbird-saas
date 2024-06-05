import { PrismaClient } from "@prisma/client";
import prisma from "lib/prisma";

export const createCompany = async (
  companyInfo: { name: string; avatar?: string },
  // 企业微信通过授权后 会创建一个企业，但没有创建人
  userId?: string,
  corpInfoId?: string
) => {
  const company = await prisma.$transaction(async (tx) => {
    const company = await tx.companyInfo.create({
      data: {
        name: companyInfo.name,
        creatorId: userId,
        avatar: companyInfo.avatar,
        corpInfoId: corpInfoId,
      },
    });

    // const companyTeam = await tx.companyTeam.create({
    //   data: {
    //     companyId: company.id,
    //     teamId: companyInfo.teamId,
    //   },
    // });

    if (
      userId &&
      !(await tx.companyMember.findFirst({
        where: { memberId: userId, companyId: company.id },
      }))
    ) {
      await tx.companyMember.create({
        data: {
          companyId: company.id,
          memberId: userId,
        },
      });
    }

    return {
      company,
    };
  });

  return company;
};

export const getAllMemberOfCompany = async (
  companyId: string,
  userId: string
) => {
  // const companyTemList = await prisma.companyTeam.findMany({
  //   where: {
  //     companyId,
  //   },
  // });

  const result = await prisma.user.findMany({
    where: {
      companyMember: {
        some: {
          companyId,
        },
      },
      // TeamMember: {
      //   some: {
      //     team: {
      //       companyId,
      //     },
      //   },
      // },
    },
    select: {
      id: true,
      name: true,
      nickname: true,
      avatar: true,
      phone: true,
      TeamMember: {
        select: {
          createdAt: true,
          team: {
            select: {
              version: true,
              name: true,
              id: true,
              company: {
                select: {
                  id: true
                }
              },
            }
          },
        },
      },
      companyMember: {
        select: {
          createdAt: true,
        },
      },
    },
  });

  // 只展示当前企业的团队
  return result.map(item => {
    const team = item.TeamMember.filter(tm => tm.team.company?.id === companyId);
    item.TeamMember = team;
    return item;
  })
};

export const getCompanyById = async (companyId: string) => {
  return await prisma.companyInfo.findFirst({
    where: { id: companyId, status: 0 },
    include: {
      teams: true,
    },
  });
};

export const getCompanyByTeamId = async (teamId: string) => {
  return (
    await prisma.team.findFirst({
      where: {
        id: teamId,
      },
      include: {
        company: true,
      },
    })
  )?.company;
};

export const addMember = async (
  userId: string,
  companyId: string,
  prismaClient?: PrismaClient
) => {
  const client = prismaClient || prisma;
  return await client.companyMember.create({
    data: {
      companyId,
      memberId: userId,
    },
  });
};

// 企业微信登录，将用户加入企业
export const joinCompany = async (userId: string, corpInfoId: string) => {
  console.log("=====================企业微信用户登录 同步企业成员数据 开始=======================")
  const company = await prisma.companyInfo.findFirst({
    where: {
      corpInfoId: corpInfoId,
    },
    include: {
      teams: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  await prisma.$transaction(async (tx) => {
    if (
      company &&
      !(await prisma.companyMember.findFirst({
        where: {
          companyId: company.id,
          memberId: userId,
        },
      }))
    ) {
      console.log("保存企业-成员关系", company, userId)
      await addMember(userId, company.id, tx as any);
    }

    const team = company?.teams?.[0];
    if (
      team &&
      !(await prisma.teamMember.findFirst({
        where: { teamId: team.id, memberId: userId },
      }))
    ) {
      console.log("保存团队-成员关系", team, userId)
      await prisma.teamMember.create({
        data: {
          teamId: team.id,
          memberId: userId,
          type: 2,
        },
      });
    }
  });

  console.log("回调小星 joinCompanyAfterWecomUserAuth", company);
  // await staringAiCallback(userId, "joinCompanyAfterWecomUserAuth", {
  //   company,
  //   team: company?.teams?.[0],
  //   userId
  // });
  console.log("=====================企业微信用户登录 同步企业数据 结束=======================")
};
