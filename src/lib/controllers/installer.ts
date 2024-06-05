import { spawn } from "child_process";
import { generateResponse } from "lib/response";
import { getFromBody } from "lib/utils";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import fs from "fs";
import { OPERATION_SUCCESS } from "@/utils/messages";
import { randomString } from "@/utils/index";

const defaultEnv = {
	DATABASE_URL: "mysql://root:root@mysql/mtbird",
	REDIS_URL: "redis://redis:6379/8",
	LOGIN_SECRET_KEY: "replace key",
	JWT_SECRET: randomString(12),
}

export const installApp = (req: NextApiRequest, res: NextApiResponse) => {
  let envs = getFromBody(req, "env") || {};
	const required = [
		"DATABASE_URL",
		"REDIS_HOST",
		"REDIS_PORT",
		"REDIS_PASS",
		"REDIS_DB"
	];


	// const errorParam = required.find(item => !envs[item]);
	// if (errorParam) return  res.status(400).send(generateResponse(400, `${errorParam} is required`));

	const envFilePath = path.resolve(process.cwd(), '.env');
	const localEnvConfig = require('dotenv').parse(fs.readFileSync(envFilePath));

	envs = {
		...localEnvConfig,
		...defaultEnv,
		...envs,
	}


	envs.NEXT_PUBLIC_IS_INSTALL = "true";

	const newEnvContent = Object.keys(envs)
	.map(envKey => `${envKey}=${envs[envKey] || ''}`)
	.join('\n');

	fs.writeFileSync(envFilePath, newEnvContent);
	

	process.on("exit", function () {
		console.log(process.argv, '<<<')
		require("child_process").spawn(process.argv.shift(), process.argv, {
				cwd: process.cwd(),
				detached : true,
				stdio: "inherit"
			});
	});
	setTimeout(() => {
		process.exit();
	}, 1000)

	return res.status(200).send(generateResponse(200, OPERATION_SUCCESS));

};