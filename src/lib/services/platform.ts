import prisma from "lib/prisma";

export const getPlatformById = async (id: number, include?: any) => {
	return await prisma.staringOSPlatform.findUnique({
		where: {
			id,
		},
		include: {
			platformPaymentConfig: true,
			...include,
		}
	})
}

export const createStaringOSPlatform = async  (name: string, desc: string, key: string) => {
	const platform = await prisma.staringOSPlatform.create({
		data: {
			name,
			desc,
			key,
		}
	});
	return platform;
}

export const createPlatformPaymentConfig = async (platformId: number, layoutConfig?: any, returnUrl?: string, notifyUrl?: string) => {
	return 	await prisma.platformPaymentConfig.create({
		data: {
			platformId,
			layoutConfig: layoutConfig,
			returnUrl: returnUrl,
			notifyUrl: notifyUrl,
		}
	})

}