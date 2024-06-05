import redisClient from "../redis";

export async function tryLock(key: string, value: string, timeout: number) {
  try {
    const result = await redisClient?.set(key, value, "EX", timeout, "NX");
    return result === "OK";
  } catch (error) {
    console.error("Error acquiring lock:", error);
    return false;
  }
}

export async function lock(
  key: string,
  value: string,
  timeout: number,
  maxAttempts: number = 10,
  retryDelay: number = 500
) {
  let attempts = 0;

  const doLock = async () => {
    const lockAcquired = await tryLock(key, value, timeout);

    if (lockAcquired) {
      return true;
    }

    attempts++;
    if (attempts >= maxAttempts) {
      return false;
    }

    return new Promise((resolve) => {
      setTimeout(async () => {
        const result = await doLock();
        resolve(result);
      }, retryDelay);
    });
  };

  return doLock();

}

export async function unlock(key: string, value: string) {
  const releaseScript = `
    if redis.call("get", KEYS[1]) == ARGV[1] then
      return redis.call("del", KEYS[1])
    else
      return 0
    end
  `;

  try {
    const result = await redisClient.eval(releaseScript, 1, key, value);
    console.log("Release lock result:", result);
  } catch (error) {
    console.error("Error releasing lock:", error);
  }
}
