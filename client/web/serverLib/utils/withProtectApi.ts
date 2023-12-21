import type { NextApiRequest, NextApiResponse } from "next";
import { DecodedIdToken } from "firebase-admin/auth";
import { User } from "@prisma/client";

import { getUserInfoByEmail } from "@/serverLib/db/user";
import verifyToken from "@/serverLib/utils/verifyToken";

export type NextApiHandlerWithUserInfo = (
  req: NextApiRequest | any,
  res: NextApiResponse,
  firebaseUserInfo: DecodedIdToken,
  internalUserInfo: User
) => unknown | Promise<unknown>;

const withProtectApi =
  (handler: NextApiHandlerWithUserInfo) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    const token = req.headers.authorization;
    if (!token) {
      res.status(401).json({
        error: "Unauthorized",
      });
      return;
    }
    const firebaseUserInfo = await verifyToken(token);
    if (!firebaseUserInfo) {
      res.status(401).json({
        error: "Unauthorized",
      });
      return;
    }

    if (!firebaseUserInfo.email) {
      res.status(400).json({
        error: "Email is required",
      });
      return;
    }

    const internalUserInfo = await getUserInfoByEmail(firebaseUserInfo.email);

    if (!internalUserInfo) {
      res.status(401).json({
        error: "Unauthorized",
      });
      return;
    }

    return handler(req, res, firebaseUserInfo, internalUserInfo);
  };

export default withProtectApi;
