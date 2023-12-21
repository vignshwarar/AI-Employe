import { NextApiRequest, NextApiResponse } from "next";
import { DecodedIdToken } from "firebase-admin/auth";
import { StatusCodes } from "http-status-codes";

import { User } from "@prisma/client";
import withProtectApi from "@/serverLib/utils/withProtectApi";
import { getPlanInfoByUserId } from "@/serverLib/db/plan";

type Data = {
  error?: boolean | string;
  planInfo?: {};
};

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<Data>,
  _: DecodedIdToken,
  internalUserInfo: User
) => {
  if (req.method !== "GET") {
    return res
      .status(StatusCodes.METHOD_NOT_ALLOWED)
      .json({ error: "Method not allowed" });
  }

  try {
    const planInfo = await getPlanInfoByUserId(internalUserInfo.id);

    if (!planInfo) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Invalid plan" });
    }
    return res.status(StatusCodes.OK).json({ error: "", planInfo });
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal server error" });
  }
};

export default withProtectApi(handler);
