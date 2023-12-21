import ConfettiIcon from "@/components/atoms/Icon/Confetti";
import { Github, ChevronRight } from "lucide-react";

import * as S from "./styles";

const TinyBanner = () => {
  return (
    <S.TinyBannerContainer
      onClick={() => {
        window.open("https://github.com/vignshwarar/AI-Employe", "_blank");
      }}
      initial={{
        background: "linear-gradient(90deg, #ec008c 0%, #fc6767 100%)",
      }}
      animate={{
        background: "linear-gradient(180deg, #ec008c 100%, #fc6767 100%)",
      }}
      transition={{
        duration: 1,
        repeat: Infinity,
        repeatType: "reverse",
        transition: "linear",
      }}
    >
      <p>
        <Github />
        &nbsp; We are open source <span>|</span> Start us on Github
        <ChevronRight />
      </p>
    </S.TinyBannerContainer>
  );
};

export default TinyBanner;
