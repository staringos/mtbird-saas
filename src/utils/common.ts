import Decimal from "decimal.js";
import { IGoodDTO } from "@/types/entities/Order";

export const getPrice = (
  goods: IGoodDTO[],
  times: number,
  period: string,
  version: string
) => {
  if (goods.length === 0 || !version || !times) return [-1];

  const good: IGoodDTO | undefined = goods.find(
    (cur: IGoodDTO) => cur.version === version
  );

  if (!good) return [-1];

  const d10 = new Decimal(10);

  // monthly bill 10 month fee for a year
  if (times === 12 || (times === 11 && period === "monthly")) {
    return [
      d10.times(good.unitPrice).toNumber(),
      new Decimal(times).times(good.unitPrice).toNumber(),
    ];
  }

  if (period === "yearly") {
    const basic = d10.times(times).times(good.unitPrice);
    const basicOrigin = new Decimal(12)
      .times(times)
      .times(good.unitPrice)
      .toFixed(2);

    // 2 years off 0.98
    if (times === 2) return [basic.times(0.98).toFixed(2), basicOrigin];

    // 3 years off 0.88
    if (times >= 3) return [basic.times(0.88).toFixed(2), basicOrigin];
    return [basic.toNumber(), basicOrigin];
  }

  return [new Decimal(times).times(good.unitPrice).toNumber()];
};
