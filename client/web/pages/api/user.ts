import type { NextApiRequest, NextApiResponse } from "next";
import { StatusCodes } from "http-status-codes";

import verifyToken from "@/serverLib/utils/verifyToken";
import { getUserInfoByEmail } from "@/serverLib/db/user";
import prisma from "@/prisma";
import plans from "@/serverLib/plans";

type Data = {
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const {
    method,
    headers: { authorization: token },
  } = req;

  if (method !== "GET") {
    return res
      .status(StatusCodes.METHOD_NOT_ALLOWED)
      .json({ error: "Method not allowed" });
  }

  if (!token) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
  }

  const userInfo = await verifyToken(token);

  if (!userInfo) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
  }

  if (!userInfo.email) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "Email is required" });
  }

  if (await getUserInfoByEmail(userInfo.email)) {
    return res.status(StatusCodes.OK).json({ error: "" });
  }

  const { email, name } = userInfo;

  if (!email) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "Email is required" });
  }

  const user = await prisma.user.create({
    data: {
      email,
      name,
    },
  });

  await prisma.plan.create({
    data: {
      userId: user.id,
      ...plans.FREE,
    },
  });

  return res.status(StatusCodes.OK).json({ error: "" });
}
