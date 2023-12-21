import { Loader2 } from "lucide-react";

import * as DashboardStyles from "@/styles/dashboard";
import { Button } from "@/components/ui/button";

interface DashboardHeaderInfoProps {
  title: string;
  description: string;
  buttonText?: string;
  onclick?: () => void;
  loading?: boolean;
  buttonIcon?: React.ReactNode;
}

const DashboardHeaderInfo = ({
  title,
  description,
  buttonText,
  onclick,
  loading,
  buttonIcon,
}: DashboardHeaderInfoProps) => {
  return (
    <DashboardStyles.DashboardContainerFlex>
      <DashboardStyles.DashboardHeaderWrapper>
        <DashboardStyles.DashboardTitle>{title}</DashboardStyles.DashboardTitle>
        <DashboardStyles.DashboardDescription>
          {description}
        </DashboardStyles.DashboardDescription>
      </DashboardStyles.DashboardHeaderWrapper>
      {buttonText && (
        <Button size="sm" onClick={onclick} disabled={loading}>
          {buttonIcon}
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {buttonText}
        </Button>
      )}
    </DashboardStyles.DashboardContainerFlex>
  );
};

export default DashboardHeaderInfo;
