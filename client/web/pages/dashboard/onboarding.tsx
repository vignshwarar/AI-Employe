import { ChromeIcon } from "lucide-react";
import Head from "next/head";

import LoggedInLayout from "@/components/molecules/Layout/LoggedInLayout";
import { Button } from "@/components/ui/button";
import * as S from "@/styles/onboarding";

const Onboarding = () => {
  return (
    <LoggedInLayout>
      <Head>
        <title>Onboarding</title>
        <meta name="description" content="AIEmploye" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <S.OnboardingContainer>
        <h1>Install our extension to get started</h1>
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

export default Onboarding;
