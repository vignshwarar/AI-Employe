import { NextApiRequest, NextApiResponse } from "next";
import { StatusCodes } from "http-status-codes";
import { User } from "@prisma/client";

import withProtectApi from "@/serverLib/utils/withProtectApi";
import { getStripeCustomerIdByUserId } from "@/serverLib/db/plan";
import stripeClient from "@/serverLib/utils/stripeClient";
import { DecodedIdToken } from "firebase-admin/auth";

type Data = {
  error?: string;
  redirectUrl?: string;
};

const getBillingPortalSession = async (userId: string) => {
  const stripeCustomerId = await getStripeCustomerIdByUserId(userId);
  if (!stripeCustomerId) {
    throw new Error("Stripe customer ID not found.");
  }

  return stripeClient.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: process.env.NEXT_PUBLIC_HOST,
  });
};

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<Data>,
  _: DecodedIdToken,
  internalUserInfo: User
) => {
  if (req.method === "GET") {
    try {
      const portalSession = await getBillingPortalSession(internalUserInfo.id);
      return res
        .status(StatusCodes.OK)
        .json({ redirectUrl: portalSession.url });
    } catch (error) {
      console.error("Error creating billing portal session:", error);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal server error" });
    }
  } else {
    return res
      .status(StatusCodes.METHOD_NOT_ALLOWED)
      .json({ error: "Method not allowed" });
  }
};

export default withProtectApi(handler);
