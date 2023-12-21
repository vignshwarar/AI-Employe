import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { buffer } from "micro";
import Cors from "micro-cors";

import stripeClient from "@/serverLib/utils/stripeClient";
import {
  updateLTDPlan,
  updatePlanByStripeCustomerId,
} from "@/serverLib/db/plan";

const webhookSecret: string = process.env.STRIPE_WEBHOOK_SECRET!;
export const config = {
  api: {
    bodyParser: false,
  },
};

const cors = Cors({
  allowMethods: ["POST", "HEAD"],
});

const webhookHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const buf = await buffer(req);
    const sig = req.headers["stripe-signature"]!;

    let event: Stripe.Event;

    try {
      event = stripeClient.webhooks.constructEvent(
        buf.toString(),
        sig,
        webhookSecret
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      if (err! instanceof Error) console.log(err);
      console.log(`❌ Error message: ${errorMessage}`);
      res.status(400).send(`Webhook Error: ${errorMessage}`);
      return;
    }

    if (event.type === "checkout.session.completed") {
      const paymentIntent = event.data
        .object as unknown as Stripe.PaymentIntent;
      const { metadata } = paymentIntent;
      if (!metadata) {
        console.log("❌ No metadata found");
        res.status(400).send(`Webhook Error: No metadata found`);
        return;
      }

      const { planName, userUid } = metadata;
      console.log("planName:" + planName, "userUid:" + userUid);
      if (!planName || !userUid) {
        console.log("❌ No metadata found");
        res.status(400).send(`Webhook Error: No metadata found`);
        return;
      }
      await updateLTDPlan(userUid, planName);
    }

    if (event.type === "charge.refunded") {
      const paymentIntent = event.data
        .object as unknown as Stripe.PaymentIntent;
      const customerId = paymentIntent.customer as string;
      await updatePlanByStripeCustomerId(customerId, "FREE", null);
    }

    res.status(200).json({ received: true });
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
};

export default cors(webhookHandler as any);
