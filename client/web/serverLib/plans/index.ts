const Plan = {
  FREE: {
    workflowCreationAllowed: 1,
    actionPerMonthAllowed: 10,
  },
  STARTER_LTD: {
    workflowCreationAllowed: 10,
    actionPerMonthAllowed: 100,
  },
  PRO_LTD: {
    workflowCreationAllowed: 20,
    actionPerMonthAllowed: 500,
  },
  PREMIUM_LTD: {
    workflowCreationAllowed: 50,
    actionPerMonthAllowed: 1500,
  },
};

export const pricing_ltd_stripe_ids = {
  STARTER_LTD: process.env.STRIPE_STARTER_PLAN_PRICE_ID,
  PRO_LTD: process.env.STRIPE_PRO_PLAN_PRICE_ID,
  PREMIUM_LTD: process.env.STRIPE_PREMIUM_PLAN_PRICE_ID,
};

export const getLifetimePricingStripeId = (planName: string) => {
  return pricing_ltd_stripe_ids[
    planName as keyof typeof pricing_ltd_stripe_ids
  ];
};

export default Plan;
