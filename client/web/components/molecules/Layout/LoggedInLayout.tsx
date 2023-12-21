import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { CreditCard, LogOut, Key } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAuth } from "firebase/auth";

import Loader from "@/components/atoms/Loader";
import { useStore } from "@/store";
import firebaseClient from "@/firebaseClient";
import * as S from "@/styles/dashboard";

interface LoggedInLayoutProps {
  children: React.ReactNode;
}

const LoggedInLayout = ({ children }: LoggedInLayoutProps) => {
  const { loading } = useStore();

  if (loading) {
    return <Loader />;
  }

  return (
    <ConditionalRedirect>
      <LoggedInHeader />
      {children}
    </ConditionalRedirect>
  );
};

interface ConditionalRedirectProps {
  children: React.ReactNode;
}

const ConditionalRedirect = ({ children }: ConditionalRedirectProps) => {
  const { user, loading } = useStore();
  const router = useRouter();

  if (!user && !loading) {
    router.push("/");
    return null;
  }

  return <>{children}</>;
};

type NavItem = {
  name: string;
  path: string;
};

const NAV_ITEMS: NavItem[] = [
  { name: "Onboarding", path: "/dashboard/onboarding" },
  { name: "Workflows", path: "/dashboard/workflows" },
  { name: "Stats", path: "/dashboard/stats" },
];

const LoggedInHeader = () => {
  const router = useRouter();
  const animationProps = router.query?.stopAnimation
    ? undefined
    : {
        initial: { opacity: 0, scale: 0 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 1 },
      };

  return (
    <>
      <S.DashboardHeader>
        <Link href="/">
          <p>AI Employe</p>
        </Link>
        <LoggedInNav />
        <Menu />
      </S.DashboardHeader>
      <S.GradientHeaderBorder {...animationProps} />
    </>
  );
};

const Menu = () => {
  const auth = getAuth(firebaseClient);
  const { user } = useStore();
  const router = useRouter();

  return (
    <S.ProfileMenu>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <S.ProfileMenuButtonBackground>
            <MenuSvg />
            <S.ProfileMenuButton>
              <p>V</p>
            </S.ProfileMenuButton>
          </S.ProfileMenuButtonBackground>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 border-neutral-800 mr-7">
          <DropdownMenuLabel className="text-neutral-100">
            {user?.email}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() =>
                router.push(
                  {
                    pathname: "/ltdpricing",
                    query: { stopAnimation: false },
                  },
                  "/ltdpricing"
                )
              }
            >
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Upgrade</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => auth.signOut()}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </S.ProfileMenu>
  );
};

export const MenuSvg = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="36"
      height="36"
      fill="none"
      viewBox="0 0 36 36"
    >
      <circle
        cx="18"
        cy="18"
        r="16"
        fill="url(#paint0_linear_124_880)"
        fillOpacity="0.1"
        stroke="url(#paint1_linear_124_880)"
        strokeWidth="4"
      ></circle>
      <defs>
        <linearGradient
          id="paint0_linear_124_880"
          x1="28.5"
          x2="45.5"
          y1="26"
          y2="48"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#fff"></stop>
          <stop offset="1" stopColor="#fff" stopOpacity="0"></stop>
        </linearGradient>
        <linearGradient
          id="paint1_linear_124_880"
          x1="-12"
          x2="29"
          y1="-11.5"
          y2="26.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#fff"></stop>
          <stop offset="1" stopOpacity="0"></stop>
        </linearGradient>
      </defs>
    </svg>
  );
};

const LoggedInNav = () => {
  const router = useRouter();
  const activePath = useMemo(() => router.pathname, [router.pathname]);

  const navigate = (e: React.MouseEvent, item: NavItem) => {
    e.preventDefault();
    router.push(
      {
        pathname: item.path,
        query: { stopAnimation: false },
      },
      item.path
    );
  };

  return (
    <S.DashboardNav>
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.path}
          href={item.path}
          className={activePath === item.path ? "active" : ""}
          onClick={(e) => navigate(e, item)}
        >
          {item.name}
        </Link>
      ))}
    </S.DashboardNav>
  );
};

export default LoggedInLayout;
