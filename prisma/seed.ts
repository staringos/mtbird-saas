import { PrismaClient } from '@prisma/client'
import crypto from "crypto";

// 密匙
const SECRET_KEY = process.env.LOGIN_SECRET_KEY;

console.log(SECRET_KEY)

// md5 加密
function md5(content: string) {
  let md5 = crypto.createHash("md5");
  return md5.update(content).digest("hex"); // 把输出编程16进制的格式
}

// 加密函数
export function genPassword(password: string) {
  const str = `password=${password}&key=${SECRET_KEY}`; // 拼接方式是自定的，只要包含密匙即可
  return md5(str);
}


const prisma = new PrismaClient()
async function main() {
  await prisma.user.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      password: genPassword('admin'),
			nickname: 'admin',
    },
  })
}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })