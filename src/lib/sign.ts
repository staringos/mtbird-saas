const { verify, sign } = require("jsonwebtoken");

export const chatSign = (payload: any = {}, expiresIn = "1h") => {
  return sign(payload, process.env.JWT_STARING_CHAT_SECRET, {
    expiresIn,
  });
};
