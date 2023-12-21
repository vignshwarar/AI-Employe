import styled from "@emotion/styled";
import { motion } from "framer-motion";

const RESPONSIVE_BREAKPOINT = 1480;

export const GreyText =
  "text-gray-400 font-thin transition duration-100 ease-in-out hover:text-gray-100";

export const GreySmallText =
  "text-gray-400 font-thin text-sm transition duration-100 ease-in-out";

export const Container = styled.div`
  width: 70%;
  margin: 0 auto;
  padding-bottom: 50px;

  @media (max-width: 1181px) {
    width: 90%;
  }
`;

export const Header = styled(motion.header)`
  display: flex;
  height: 100px;
  align-items: center;
  justify-content: space-between;
`;

export const SectionTitle = styled.h2`
  background: linear-gradient(167deg, #fff 40%, rgba(0, 0, 0, 1) 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 32px;
  text-align: center;
`;

export const SectionDescription = styled.p`
  color: #868686;
  font-size: 16px;
  font-weight: 300;
  text-align: center;
`;

export const NavLinks = styled.div`
  @media (max-width: 860px) {
    .desktop {
      display: none;
    }
  }
`;

export const MobileMenu = styled.div`
  display: none;
  @media (max-width: 860px) {
    display: block;
    width: 100%;
  }
`;

export const MobileMenuTrigger = styled.div`
  width: 40px;
  height: 40px;
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    position: absolute;
  }
  .ham-svg {
    stroke: #b1b1b1;
    width: 14px;
    height: 14px;
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

export const MainContent = styled(motion.main)`
  display: flex;
  flex-direction: column;
  margin-top: 40px;
  width: 100%;
  align-items: center;
`;

export const MainTitle = styled.h1`
  display: flex;
  flex-direction: column;
  color: #fff;
  font-size: 42px;
  align-items: center;
  white-space: nowrap;
  span {
    text-align: center;
  }
  .subtext {
    white-space: normal;
  }
  .gradient {
    background: linear-gradient(180deg, #ec008c 19.98%, #fc6767 73.65%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    padding-right: 12px;
  }
  @media (max-width: ${RESPONSIVE_BREAKPOINT}px) {
    font-size: 28px;
  }
  @media (max-width: 700px) {
    flex-direction: column;
  }
`;

export const MainDescription = styled.p`
  text-align: center;
  color: #868686;
  font-size: 18px;
  max-width: 63%;

  @media (max-width: ${RESPONSIVE_BREAKPOINT}px) {
    font-size: 16px;
    max-width: 100%;
  }
`;
