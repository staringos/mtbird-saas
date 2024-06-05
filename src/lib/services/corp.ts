import prisma from "lib/prisma";

export const getCorpNameById = async (corpid?: string | null) => {
  try {
    const corpInfo = corpid
      ? await prisma.corpInfo.findFirst({
          where: {
            corpid: corpid,
          },
        })
      : null;

    const info = corpInfo?.corpInfo as any;
    const corpName =
      info?.corp_full_name || info?.corp_name || corpid || "未知";

    return corpName;
  } catch (error) {}
};
