import TinyBanner from "../TinyBanner";
import { SectionTitle } from "@/styles";

import * as S from "./styles";
import Timer from "../Timer";
import SignInButtons from "../SignInButtons";

const BottomCTA = () => {
  return (
    <S.BottomCtaWrapper>
      <TinyBanner />
      <SectionTitle>
        {/* Save double the time and money with
        <br /> AI Employee Buy now. */}
        Get Your AI Employe Now and <br />
        Reclaim Your Week!
      </SectionTitle>
      <Timer />
      <SignInButtons />
    </S.BottomCtaWrapper>
  );
};

export default BottomCTA;
