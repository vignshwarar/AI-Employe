import styled from "@emotion/styled";
import { motion } from "framer-motion";

const FEATURE_BREAKPOINT = 850;

export const FeatureContainer = styled.div`
  position: relative;
  width: 80%;

  @media (max-width: 1550px) {
    width: 100%;
  }
`;

export const FeatureTitle = styled.h3`
  font-size: 24px;
  font-size: 32px;
  color: #787878;
  margin-top: 56px;
  margin-bottom: 24px;
  text-align: center;
  span {
    color: #fff;
  }
`;

export const FeatureWrapper = styled(motion.div)`
  width: 100%;
  min-height: 420px;
  border-radius: 20px;
  border: 1px solid rgba(120, 120, 120, 0.3);
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  margin-bottom: 24px;

  @media (max-width: ${FEATURE_BREAKPOINT}px) {
    flex-direction: column;
    min-height: 480px;
  }
`;

export const FeatLeft = styled.div`
  width: 50%;
  padding: 28px;

  @media (max-width: ${FEATURE_BREAKPOINT}px) {
    width: 100%;
  }
`;

export const FeatTitle = styled.p`
  color: #fff;
  font-size: 28px;
`;

export const FeatDescription = styled.p`
  color: #868686;
  font-size: 16px;
  font-weight: 300;
  margin-top: 4px;
`;

export const FeatRight = styled(motion.div)`
  width: 50%;
  position: relative;

  @media (max-width: ${FEATURE_BREAKPOINT}px) {
    width: 100%;
  }
`;

export const FeatBackground = styled.div`
  filter: blur(123px);
  width: 100%;
  height: 100%;

  @media (max-width: ${FEATURE_BREAKPOINT}px) {
    height: 400px;
    position: absolute;
  }
`;

export const FeatIconWrapper = styled.div`
  position: absolute;
  top: 15%;
  width: 100%;

  @media (max-width: ${FEATURE_BREAKPOINT}px) {
    padding: 0 24px;
    svg {
      width: 100%;
      height: auto;
    }
  }
`;

export const WidgetIconWrapper = styled.div`
  position: absolute;
  bottom: 5%;
  right: 5%;

  @media (max-width: ${FEATURE_BREAKPOINT}px) {
    z-index: 1;
    width: 100%;
    right: -60%;
    bottom: -230px;
  }

  @media (max-width: 500px) {
    /* Make it center */
    right: -35%;
    bottom: -150px;
  }
`;
