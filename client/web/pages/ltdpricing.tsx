import Head from "next/head";
import type { NextPage } from "next";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

import LandingPageLayout from "@/components/molecules/Layout/LandingPageLayout";
import { Button } from "@/components/ui/button";
import * as S from "@/styles/pricing";
import * as IndexStyles from "@/styles";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { axiosClientWithAuth } from "@/lib/axios";
import { useStore } from "@/store";
import { useToast } from "@/components/ui/use-toast";
import FooterCTA from "@/components/molecules/Footer";
import BottomCTA from "@/components/molecules/BottomCTA";

const Pricing: NextPage = () => {
  return (
    <LandingPageLayout>
      <Head>
        <title>Life time deal - Pricing</title>
        <meta name="description" content="AI Employe" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MainContent />
    </LandingPageLayout>
  );
};

const MainContent = () => {
  return (
    <S.PricingWrapper
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
    >
      <IndexStyles.SectionTitle>
        Limited Seats, Lifetime Deal
      </IndexStyles.SectionTitle>
      <IndexStyles.SectionDescription>
        We are running a Life time deal for a limited time (3 days refund).
      </IndexStyles.SectionDescription>

      <PricingPlans />
      <BottomCTA />
      <FooterCTA />
    </S.PricingWrapper>
  );
};

interface SwitchPlanTypeProps {
  checked: boolean;
  onChange: () => void;
}

export function SwitchPlanType({ checked, onChange }: SwitchPlanTypeProps) {
  return (
    <div className="flex items-center space-x-2 mt-6 mb-4">
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        id="yearly"
        className="dark"
      />
      <Label className="cursor-pointer" htmlFor="yearly">
        <p style={{ color: "#868686" }}>Yearly plan (2 months free)</p>
      </Label>
    </div>
  );
}

const PricingPlans = () => {
  const { user, setSignInModal } = useStore();
  const [currentPlanName, setCurrentPlanName] = useState("FREE");
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      const getPlanInfo = async () => {
        try {
          const { data } = await axiosClientWithAuth.get("/api/billing/info");
          console.log({ data });
          setCurrentPlanName(data.planInfo.planName);
        } catch (error) {
          console.log(error);
        }
      };

      getPlanInfo();
    }
  }, [user]);

  const handlePlanSelection = async (planName: string) => {
    if (!user) {
      setSignInModal(true);
      return;
    }

    if (currentPlanName !== "FREE") {
      try {
        const { data } = await axiosClientWithAuth.get("/api/billing/manage");
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
        } else {
          toast({
            description: "Something went wrong",
          });
        }
      } catch (error) {
        console.log(error);
        toast({
          description: "Something went wrong",
        });
      }

      return;
    }

    if (planName === "FREE") {
      toast({
        description: "You are already on free plan",
      });
      return;
    }

    try {
      const { data } = await axiosClientWithAuth.post("/api/billing/ltd", {
        planName,
      });

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        toast({
          description: "Something went wrong",
        });
      }
    } catch (error) {
      console.log(error);
      toast({
        description: "Something went wrong",
      });
    }
  };
  return (
    <S.PricingPlansWrapper>
      <Plan
        onPlanSelection={() => handlePlanSelection("FREE")}
        data={pricingPlans.FREE}
        currentPlan={currentPlanName}
      />
      <Plan
        onPlanSelection={() => handlePlanSelection("STARTER_LTD")}
        data={pricingPlans.STARTER_LTD}
        currentPlan={currentPlanName}
      />
      <Plan
        onPlanSelection={() => handlePlanSelection("PRO_LTD")}
        data={pricingPlans.PRO_LTD}
        currentPlan={currentPlanName}
      />
      <Plan
        onPlanSelection={() => handlePlanSelection("PREMIUM_LTD")}
        data={pricingPlans.PREMIUM_LTD}
        currentPlan={currentPlanName}
      />
    </S.PricingPlansWrapper>
  );
};

interface PlanProps {
  data: {
    title: String;
    planKey: String;
    ltd_price: String;
    features: {
      title: String;
      description?: String;
      id: number;
      crossOut?: boolean;
    }[];
  };
  onPlanSelection?: () => void;
  currentPlan?: string;
}

const Plan = ({
  data: { title, ltd_price, features, planKey },
  onPlanSelection,
  currentPlan,
}: PlanProps) => {
  const [loading, setLoading] = useState(false);
  const { user } = useStore();

  const renderBtnText = () => {
    const isCurrentPlan = currentPlan === planKey;
    if (loading) {
      return "Please wait";
    }
    if (isCurrentPlan && user) {
      return "Current Plan (Manage)";
    }
    if (currentPlan === "FREE" && user) {
      return "Get Started";
    }

    return "Get Started";
  };
  return (
    <S.PlanWrapper>
      <S.PlanPriceWrapper>
        <S.PlanTitle>{title}</S.PlanTitle>
        <S.PlanPrice>
          {ltd_price} <span>Lifetime Deal</span>
        </S.PlanPrice>
      </S.PlanPriceWrapper>
      <S.PlanSpecWrapper>
        {features.map(({ title, description, id, crossOut }) => (
          <S.PlanSpec key={id}>
            <div>
              {crossOut ? (
                <XCircle stroke="#ff5454" size={16} />
              ) : (
                <CheckCircle stroke="#00BFA6" size={16} />
              )}
            </div>
            <div className="plan-spec__title">
              <p>{title}</p>
            </div>
          </S.PlanSpec>
        ))}

        <Button
          onClick={() => {
            if (title === "Basic" && user) {
              onPlanSelection && onPlanSelection();
              return;
            }
            if (user) {
              setLoading(true);
            }
            onPlanSelection && onPlanSelection();
          }}
          disabled={loading}
          className="w-full mt-auto"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}

          {renderBtnText()}
        </Button>
      </S.PlanSpecWrapper>
    </S.PlanWrapper>
  );
};

const pricingPlans = {
  FREE: {
    title: "Basic",
    ltd_price: "Free",
    planKey: "FREE",
    features: [
      {
        id: 1,
        title: "2 workflows",
      },
      {
        id: 2,
        title:
          "10 GPT-4 Vision calls (actions) when the API becomes available/month",
      },
      {
        id: 3,
        title: "Bring your own OpenAI key",
      },
    ],
  },
  STARTER_LTD: {
    title: "Starter",
    ltd_price: "$49",
    planKey: "STARTER_LTD",
    features: [
      {
        id: 1,
        title: "10 workflows",
      },
      {
        id: 2,
        title:
          "100 GPT-4 Vision calls (actions) when the API becomes available/month",
      },
      {
        id: 3,
        title: "Bring your own OpenAI key",
      },
    ],
  },
  PRO_LTD: {
    title: "Pro",
    ltd_price: "$199",
    planKey: "PRO_LTD",
    features: [
      {
        id: 1,
        title: "20 workflows",
      },
      {
        id: 2,
        title:
          "500 GPT-4 Vision calls (actions) when the API becomes available/month",
      },
      {
        id: 3,
        title: "Bring your own OpenAI key",
      },
    ],
  },
  PREMIUM_LTD: {
    title: "Premium",
    ltd_price: "$499",
    planKey: "PREMIUM_LTD",
    features: [
      {
        id: 1,
        title: "50 workflows",
      },
      {
        id: 2,
        title:
          "1500 GPT-4 Vision calls (actions) when the API becomes available/month",
      },
      {
        id: 3,
        title: "Bring your own OpenAI key",
      },
    ],
  },
};

export default Pricing;
