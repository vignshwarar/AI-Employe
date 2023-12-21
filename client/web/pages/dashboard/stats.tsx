import Head from "next/head";
import { ChromeIcon } from "lucide-react";

import LoggedInLayout from "@/components/molecules/Layout/LoggedInLayout";
import { Button } from "@/components/ui/button";
import * as S from "@/styles/onboarding";

const Stats = () => {
  return (
    <LoggedInLayout>
      <Head>
        <title>Stats</title>
        <meta name="description" content="AIEmploye" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <S.OnboardingContainer>
        <h1>Soon!</h1>
        <a target="_blank" href="https://example.com">
          <Button size="lg">
            <ChromeIcon size={16} />
            <span
              style={{
                marginLeft: "4px",
              }}
            >
              Install from Chrome store
            </span>
          </Button>
        </a>
      </S.OnboardingContainer>
    </LoggedInLayout>
  );
};

export default Stats;
