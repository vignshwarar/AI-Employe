import Link from "next/link";
import { useRouter } from "next/router";
import { AlignJustify } from "lucide-react";

import Logo from "@/components/atoms/Logo";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MenuSvg } from "./LoggedInLayout";
import * as IndexStyles from "@/styles";

interface LandingPageLayoutProps {
  children: React.ReactNode;
}

const LandingPageLayout = ({ children }: LandingPageLayoutProps) => {
  return (
    <IndexStyles.Container>
      <Header />
      {children}
    </IndexStyles.Container>
  );
};

export const Header = () => {
  return (
    <IndexStyles.Header>
      <Logo />
      <NavLinks />
    </IndexStyles.Header>
  );
};

interface NavLinksProps {
  style?: React.CSSProperties;
}

export const NavLinks = ({ style }: NavLinksProps) => {
  const { user, setSignInModal } = useStore();
  const router = useRouter();
  return (
    <IndexStyles.NavLinks style={style}>
      <div className="desktop">
        <Button variant="link" size="sm">
          <Link
            target="_blank"
            className={IndexStyles.GreyText}
            href="https://github.com/vignshwarar/AI-Employe"
          >
            Star us on Github
          </Link>
        </Button>
        <Button variant="link" size="sm">
          <Link
            target="_blank"
            className={IndexStyles.GreyText}
            href="mailto:vigneshwarar.j@gmail.com"
          >
            Contact
          </Link>
        </Button>
        <Button variant="link" size="sm">
          <Link className={IndexStyles.GreyText} href="/ltdpricing">
            Lifetime deal
          </Link>
        </Button>
        <Button variant="link" size="sm">
          <Link
            onClick={() => {
              if (!user) {
                setSignInModal(true);
              }
            }}
            className={IndexStyles.GreyText}
            href={user ? "/dashboard/onboarding" : ""}
          >
            {user ? "Dashboard" : "Sign In"}
          </Link>
        </Button>
      </div>

      <IndexStyles.MobileMenu className="mobile">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <IndexStyles.MobileMenuTrigger>
              <MenuSvg />
              <AlignJustify className="ham-svg" />
            </IndexStyles.MobileMenuTrigger>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 border-neutral-800 mr-7">
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() =>
                  window.open(
                    "https://github.com/vignshwarar/AI-Employe",
                    "_blank"
                  )
                }
              >
                <span>Star us on Github</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  window.open("mailto:vigneshwarar.j@gmail.com", "_blank")
                }
              >
                <span>Contact</span>
              </DropdownMenuItem>

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
                <span>Lifetime deal</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  if (!user) {
                    setSignInModal(true);
                  } else {
                    router.push(
                      {
                        pathname: "/dashboard/onboarding",
                        query: { stopAnimation: false },
                      },
                      "/dashboard/onboarding"
                    );
                  }
                }}
              >
                <span>{user ? "Dashboard" : "Sign In"}</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </IndexStyles.MobileMenu>
    </IndexStyles.NavLinks>
  );
};

export default LandingPageLayout;
