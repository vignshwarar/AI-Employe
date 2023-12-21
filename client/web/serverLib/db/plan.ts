import planInfo from "@/serverLib/plans";
import prisma from "@/prisma";

export const getPlanInfoByUserId = async (userId: string) => {
  return await prisma.plan.findUnique({
    where: {
      userId,
    },
  });
};

export const insertStripeCustomerIdByUserId = async (
  userId: string,
  stripeCustomerId: string
) => {
  return await prisma.plan.update({
    where: {
      userId,
    },
    data: {
      stripeCustomerId,
    },
  });
};

export const getStripeCustomerIdByUserId = async (userId: string) => {
  const plan = await prisma.plan.findUnique({
    where: { userId },
  });
  return plan?.stripeCustomerId;
};

export const updateLTDPlan = async (userId: string, planName: string) => {
  const planSpecs = planInfo[planName as keyof typeof planInfo];
  await prisma.plan.update({
    where: { userId },
    data: { ...planSpecs, planName },
  });
};

export const updatePlanByStripeCustomerId = async (
  stripeCustomerId: string,
  planName: string,
  planDuration: string | null
) => {
  const planSpecs = planInfo[planName as keyof typeof planInfo];
  const existingPlan = await prisma.plan.findFirst({
    where: { stripeCustomerId },
  });
  if (!existingPlan) {
    console.log("❌ No plan found for stripeCustomerId", stripeCustomerId);
    return;
  }
  await prisma.plan.update({
    where: { id: existingPlan.id },
    data: { ...planSpecs, planDuration, planName },
  });
};
