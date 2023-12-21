import { NextApiRequest, NextApiResponse } from "next";
import { DecodedIdToken } from "firebase-admin/auth";
import { StatusCodes } from "http-status-codes";

import { User } from "@prisma/client";
import withProtectApi from "@/serverLib/utils/withProtectApi";
import authAdmin from "@/firebaseAdmin";

type Data = {
  customToken?: string;
  error?: boolean | string;
};

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<Data>,
  firebaseUserInfo: DecodedIdToken,
  internalUserInfo: User
) => {
  if (req.method !== "GET") {
    return res
      .status(StatusCodes.METHOD_NOT_ALLOWED)
      .json({ error: "Method not allowed" });
  }

  const customToken = await authAdmin.createCustomToken(firebaseUserInfo.uid);
  return res.status(StatusCodes.OK).json({ error: "", customToken });
};

export default withProtectApi(handler);
