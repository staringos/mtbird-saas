import prisma from "lib/prisma";

const APP_LIMIT = {
  normal: 1,
  professional: 10,
  enterprise: 20,
  private: 999999,
} as Record<string, number>;

export const checkIfTeamOverLimit = (
  version?: string,
  appNumber: number = 0
) => {
  if (!version) return true;
  return appNumber > APP_LIMIT[version];
};

export const getTeamMembership = async (teamId: string) => {
  const team = await prisma.team.findFirst({
    select: {
      version: true,
    },
    where: {
      id: teamId,
    },
  });

  return team?.version;
};
