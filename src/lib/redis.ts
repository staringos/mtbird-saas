import { RedisClientOptions } from "redis";

const redis = require("redis");

const getClient = () => {
  try {
    const config = {
      // socket: {
      //   host: process.env.REDIS_HOST,
      //   port: process.env.REDIS_PORT,
      // },
      url: process.env.REDIS_URL
    } as RedisClientOptions;

    if (process.env.REDIS_PASS) {
      config.password = process.env.REDIS_PASS;
    }

    const client = redis.createClient(config);

    client.connect();

    client.on("error", function (err: any) {
      console.log(process.env.REDIS_HOST)
      console.error("Redis error:", err);
    });

    return client;
  } catch (e) {
    console.log(
      "redis connect error:", e
    );
  }
};

export default getClient() as any;
