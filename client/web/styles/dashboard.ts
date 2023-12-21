import styled from "@emotion/styled";
import { motion } from "framer-motion";

export const DashboardContainer = styled.div`
  margin: 32px auto;
  max-width: 700px;

  @media (max-width: 768px) {
    max-width: 90%;
  }
`;

export const DashboardHeader = styled.div`
  width: 100%;
  height: 60px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
`;

export const GradientHeaderBorder = styled(motion.div)`
  background: radial-gradient(
    50% 50% at 50% 50%,
    #fff 0%,
    rgba(255, 255, 255, 0) 100%
  );
  width: 100%;
  height: 2px;
`;

export const DashboardNav = styled.div`
  a {
    font-size: 14px;
    margin-right: 16px;
    padding: 8px 16px;
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.5);
    transition: all 0.2s ease-in-out;

    &:hover {
      background: rgba(255, 240, 240, 0.09);
      color: #fff;
    }
  }

  .active {
    background: rgba(255, 240, 240, 0.09);
    color: #fff;
  }
`;

export const ProfileMenu = styled.div``;

export const ProfileMenuButtonBackground = styled.div`
  width: 40px;
  height: 40px;
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 100%;
    height: 100%;
    position: absolute;
  }
  p {
    background: linear-gradient(115deg, #fff 0%, rgba(255, 255, 255, 0) 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-size: 16px;
    font-weight: 400;
  }
`;

export const ProfileMenuButton = styled.div`
  display: flex;
  align-items: center;
  transition: all 0.2s ease-in-out;
  width: 35px;
  height: 35px;
  cursor: pointer;
  justify-content: center;
  position: absolute;
`;

export const DashboardHeaderWrapper = styled.div``;

export const DashboardContainerFlex = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const DashboardTitle = styled.h1`
  color: #fff;
  font-size: 32px;
  font-weight: 400;
`;

export const DashboardDescription = styled.p`
  color: #868686;
  font-size: 16px;
  font-weight: 300;
`;
