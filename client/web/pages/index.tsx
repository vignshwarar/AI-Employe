import Head from "next/head";

import LandingPageLayout from "@/components/molecules/Layout/LandingPageLayout";
import SignInButtons from "@/components/molecules/SignInButtons";
import Timer from "@/components/molecules/Timer";
import TinyBanner from "@/components/molecules/TinyBanner";
import Showcase from "@/components/molecules/Showcase";
import BottomCTA from "@/components/molecules/BottomCTA";
import FooterCTA from "@/components/molecules/Footer";
import Features from "@/components/molecules/Features";
import * as S from "@/styles";

const Home = () => {
  return (
    <LandingPageLayout>
      <Head>
        <title>
          GPT-4 Vision Powered First-ever reliable browser automation to gain
          hours back every week.
        </title>
        <meta
          name="title"
          content="GPT-4 Vision Powered First-ever reliable browser automation to gain hours back every week."
        />
        <meta
          name="description"
          content="Effortlessly automate email-to-CRM/ERP data transfers. Automate tasks requiring human-like intelligence: understanding emails, receipts, and invoice, etc."
        />

        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://aiemploye.com/" />
        <meta
          property="og:title"
          content="GPT-4 Vision Powered First-ever reliable browser automation to gain hours back every week."
        />
        <meta
          property="og:description"
          content="Effortlessly automate email-to-CRM/ERP data transfers. Automate tasks requiring human-like intelligence: understanding emails, receipts, and invoice, etc."
        />
        <meta
          property="og:image"
          content="https://res.cloudinary.com/dgxzz0bav/image/upload/c_pad,b_auto:predominant,fl_preserve_transparency/v1703117939/Frame_15_jbcql5.jpg"
        />

        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://aiemploye.com/" />
        <meta
          property="twitter:title"
          content="GPT-4 Vision Powered First-ever reliable browser automation to gain hours back every week."
        />
        <meta
          property="twitter:description"
          content="Effortlessly automate email-to-CRM/ERP data transfers. Automate tasks requiring human-like intelligence: understanding emails, receipts, and invoice, etc."
        />
        <meta
          property="twitter:image"
          content="https://res.cloudinary.com/dgxzz0bav/image/upload/c_pad,b_auto:predominant,fl_preserve_transparency/v1703117939/Frame_15_jbcql5.jpg"
        />

        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MainContent />
    </LandingPageLayout>
  );
};

const MainContent = () => {
  return (
    <S.MainContent
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <TinyBanner />
      <S.MainTitle>
        <span className="gradient">GPT-4 Vision Powered</span>
        <span className="subtext">
          First-ever reliable browser automation <br />
          to gain hours back every week.
        </span>
      </S.MainTitle>
      <S.MainDescription>
        Effortlessly automate email-to-CRM/ERP data transfers. Automate tasks
        requiring human-like intelligence: understanding emails, receipts,
        invoices, etc.
      </S.MainDescription>

      <SignInButtons />
      <Timer />
      <Showcase />
      <Features />
      <BottomCTA />
      <FooterCTA />
    </S.MainContent>
  );
};

export default Home;
