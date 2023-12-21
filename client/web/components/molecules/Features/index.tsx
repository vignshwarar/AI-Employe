import { motion } from "framer-motion";

import AIAnswerIcon from "@/components/atoms/Icon/Landingpage/AIAnswer";
import SemanticIcon from "@/components/atoms/Icon/Landingpage/Semantic";
import UploadIcon from "@/components/atoms/Icon/Landingpage/Upload";

import * as S from "./styles";

const Features = () => {
  return (
    <S.FeatureContainer>
      <S.FeatureTitle>
        What used to be unachievable in automation is <br />
        <span>now achievable with AI Employe</span>
      </S.FeatureTitle>

      <Feature
        title="Automate Any Complex Task. Just Describe It!"
        description="Create a workflow by outlining and demonstrating your task in the browser, just as you would show it to a human. We only record browser changes without capturing the screen, mic or camera."
        icon={<AIAnswerIcon />}
        backgroundColor="linear-gradient(90deg, #270119 0%, #020959 100%),
        linear-gradient(90deg, #43024e 0%, #5e025e 100%),
        linear-gradient(90deg, #9f28fa 0%, #85f0fe 100%),
        linear-gradient(90deg, #59010d 0%, #3b003c 100%),
        linear-gradient(90deg, #0c0122 0%, #066d92 100%),
        linear-gradient(90deg, #dff5df 0%, #17010b 100%),
        linear-gradient(90deg, #fb5a8f 0%, #faacbd 100%)"
      />

      <Feature
        title="Gain Hours Back with AI That Thinks Just Like You."
        description="Our AI can execute your tasks, including complex ones requiring human-like intelligence, such as interpreting emails, receipts, and invoices, by taking appropriate actions."
        icon={<SemanticIcon />}
        backgroundColor=" linear-gradient(90deg, rgba(255, 128, 8, 0.20) 0%, rgba(255, 200, 55, 0.20) 100%)"
      />

      <Feature
        title="Your Vision, Our Insight. Research Assistant That Understands."
        description="Leverage AI Employe to glean unique insights from graphs, intricate tables, and image-based OCR."
        icon={<UploadIcon />}
        backgroundColor="linear-gradient(90deg, rgba(5, 117, 230, 0.50) 0%, rgba(2, 27, 121, 0.50) 100%)"
      />
    </S.FeatureContainer>
  );
};

interface FeatureProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  backgroundColor: string;
  customFeatRight?: React.ReactNode;
}

const Feature = ({
  title,
  description,
  icon,
  backgroundColor,
  customFeatRight,
}: FeatureProps) => {
  return (
    <S.FeatureWrapper
      initial={{ scale: 0.9, opacity: 0, y: 5 }}
      whileInView={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      viewport={{ once: true }}
    >
      <S.FeatLeft>
        <S.FeatTitle>{title}</S.FeatTitle>
        <S.FeatDescription>{description}</S.FeatDescription>
      </S.FeatLeft>
      {!customFeatRight ? (
        <S.FeatRight
          initial={{ x: 50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true, amount: 0.1 }}
        >
          <S.FeatBackground style={{ background: backgroundColor }} />
          <S.FeatIconWrapper>{icon}</S.FeatIconWrapper>
        </S.FeatRight>
      ) : (
        customFeatRight
      )}
    </S.FeatureWrapper>
  );
};

interface CustomFeatRightPreviewProps {
  backgroundColor: string;
  icon: React.ReactNode;
}

// const CustomFeatRightPreview = ({
//   backgroundColor,
//   icon,
// }: CustomFeatRightPreviewProps) => {
//   return (
//     <S.FeatRight
//       initial={{ x: 50, opacity: 0 }}
//       whileInView={{ x: 0, opacity: 1 }}
//       transition={{ duration: 1 }}
//       viewport={{ once: true, amount: 0.1 }}
//     >
//       <S.FeatBackground style={{ background: backgroundColor }} />
//       <S.FeatIconWrapper>{icon}</S.FeatIconWrapper>
//       <S.WidgetIconWrapper>
//         <WidgetIcon />
//       </S.WidgetIconWrapper>
//     </S.FeatRight>
//   );
// };

export default Features;
