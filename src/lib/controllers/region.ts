import { generateResponse } from "lib/response";
import { getFromQuery } from "lib/utils";
import { NextApiRequest, NextApiResponse } from "next";
import provincesJson from "../data/provinces.json";
import regionsJson from "../data/regions.json";
import keys from "lodash/keys";

const basicAPI = process.env.JISUAPI_URL;
const key = process.env.JISUAPI_KEY;

export const getProvince = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  // const response = await fetch(`${basicAPI}/area/province?appkey=${key}`);
  // const provinces = await response.json()

  const provinces = keys(provincesJson).map((cur) => {
    return {
      id: cur,
      name: (provincesJson as any)[cur],
    };
  });
  return res.status(200).send(generateResponse(200, "", provinces));
};

export const getRegions = async (req: NextApiRequest, res: NextApiResponse) => {
  const parentId = getFromQuery(req, "parentId") as string;
  // const response = await fetch(`${basicAPI}/area/city?parentid=${parentId}&appkey=${key}`);
  // const cities = await response.json();
  let regions = (regionsJson as any)[parentId];

  if (!regions) {
    return res.status(404).send(generateResponse(404, "地区未找到"));
  }

  regions = keys(regions).map((cur) => {
    return {
      id: cur,
      name: regions[cur],
    };
  });
  return res.status(200).send(generateResponse(200, "", regions));
};

// export const getAreas = async (req: NextApiRequest, res: NextApiResponse) => {
//   const parentId = getFromQuery(req, 'parentId') as string
//   const response = await fetch(`${basicAPI}/area/city?parentid=${parentId}&appkey=${key}`);
//   const areas = await response.json()
//   return res.status(200).send(generateResponse(200, '', areas?.result || []))
// };
