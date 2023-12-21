import { NextApiRequest, NextApiResponse } from "next";
import { DecodedIdToken } from "firebase-admin/auth";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";

import { User } from "@prisma/client";
import withProtectApi from "@/serverLib/utils/withProtectApi";
import { getLifetimePricingStripeId } from "@/serverLib/plans";
import stripeClient from "@/serverLib/utils/stripeClient";
import {
  insertStripeCustomerIdByUserId,
  getStripeCustomerIdByUserId,
} from "@/serverLib/db/plan";

const createStripeCustomer = async (email: string) => {
  const newStripeCustomer = await stripeClient.customers.create({ email });
  return newStripeCustomer.id;
};

const LtdPayload = z.object({
  planName: z.string(),
});

type Data = {
  error?: boolean | string;
  redirectUrl?: string;
};

const handle = async (
  req: NextApiRequest,
  res: NextApiResponse<Data>,
  _: DecodedIdToken,
  internalUserInfo: User
) => {
  if (req.method !== "POST") {
    return res
      .status(StatusCodes.METHOD_NOT_ALLOWED)
      .json({ error: "Method not allowed" });
  }

  try {
    const { planName } = await LtdPayload.parseAsync(req.body);
    const stripePricingId = getLifetimePricingStripeId(planName);
    if (!stripePricingId) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Invalid plan" });
    }

    let customerId = await getStripeCustomerIdByUserId(internalUserInfo.id);
    if (!customerId) {
      customerId = await createStripeCustomer(internalUserInfo.email);
      await insertStripeCustomerIdByUserId(internalUserInfo.id, customerId);
    }

    const session = await stripeClient.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: stripePricingId, quantity: 1 }],
      metadata: { planName, userUid: internalUserInfo.id },
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_HOST}/ltdpricing/?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_HOST}/ltdpricing/?canceled=true`,
      allow_promotion_codes: true,
    });

    if (!session.url) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal server error" });
    }

    res.status(StatusCodes.OK).json({ redirectUrl: session.url });
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal server error" });
  }
};

export default withProtectApi(handle);
