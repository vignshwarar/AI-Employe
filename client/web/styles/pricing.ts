import styled from "@emotion/styled";
import { motion } from "framer-motion";

export const PricingWrapper = styled(motion.div)`
  margin-top: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const PricingPlansWrapper = styled.div`
  margin-top: 28px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
`;

export const PlanWrapper = styled.div`
  width: 330px;
  height: 500px;
  border: 1px solid rgb(38 38 38);
  border-radius: 16px;
  margin-right: 24px;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
`;

export const PlanSpecWrapper = styled.div`
  width: 100%;
  height: 90%;
  background: rgba(255, 255, 255, 0.03);
  margin-top: auto;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  border-top: 1px solid rgb(38 38 38);
`;

export const PlanPriceWrapper = styled.div`
  width: 100%;
  padding: 24px;
`;

export const PlanTitle = styled.p`
  color: #fff;
  font-size: 15px;
  font-weight: 300;
  color: #868686;
`;

export const PlanPrice = styled.p`
  color: #fff;
  font-size: 40px;
  span {
    font-size: 15px;
    font-weight: 300;
    color: #868686;
  }
`;

export const PlanSpec = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;

  .plan-spec__title {
    color: rgba(255, 255, 255, 0.9);
    margin-left: 12px;

    p {
      font-size: 15px;
      font-weight: 400;
      margin-top: -4px;
      &:hover {
        color: rgba(255, 255, 255, 0.8);
        cursor: pointer;
        transition: all 0.2s ease-in-out;
      }
    }

    span {
      font-size: 12px;
      color: #868686;
      font-weight: 400;
    }
  }
`;

export const SubscribeButton = styled.button``;
