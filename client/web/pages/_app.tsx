import "@/styles/globals.css";

import type { AppProps } from "next/app";
import { getAuth, isSignInWithEmailLink } from "firebase/auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import useWindowSize from "react-use/lib/useWindowSize";
import Confetti from "react-confetti";
import posthog from "posthog-js";
import { Crisp } from "crisp-sdk-web";
import Script from "next/script";

import { Toaster } from "@/components/ui/toaster";
import SignInModal from "@/components/molecules/Modals/SignIn";
import { useStore } from "@/store";
import firebaseClient from "@/firebaseClient";
import { useAuthState } from "react-firebase-hooks/auth";
import { useToast } from "@/components/ui/use-toast";

function MyApp({ Component, pageProps }: AppProps) {
  const auth = getAuth(firebaseClient);
  const [user, loading, error] = useAuthState(auth);
  const router = useRouter();
  const { signInModal, setUser, setSignInModal } = useStore();
  const { toast } = useToast();
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);

  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
  };

  const installGoogleAnalytics = () => {
    return (
      <>
        <Script
          id="google-analytics"
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`}
        />
        <Script id="google-analytics-2">
          {`
           window.dataLayer = window.dataLayer || [];
           function gtag(){dataLayer.push(arguments);}
           gtag('js', new Date());
           gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}');
          `}
        </Script>
      </>
    );
  };

  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_CLIENT_KEY!, {
        api_host: "https://app.posthog.com",
      });
    }
    Crisp.configure(process.env.NEXT_PUBLIC_CRISP_CLIENT_KEY!);

    setUser({ user, loading, error });
    if (isSignInWithEmailLink(auth, window.location.href)) {
      setSignInModal(true);
    }
    if (router.query.emailSignIn || router.query.signInFromExtension) {
      setSignInModal(true);
    }
    if (router.query.success) {
      triggerConfetti();
      toast({
        description: "Payment successful!",
      });
    }
  }, [
    auth,
    user,
    loading,
    error,
    setUser,
    router.query.emailSignIn,
    router.query.signInFromExtension,
    router.query.success,
    setSignInModal,
    toast,
  ]);

  return (
    <>
      {installGoogleAnalytics()}
      {showConfetti && (
        <Confetti width={width} run={showConfetti} height={height} />
      )}
      {signInModal && <SignInModal />}
      <Component {...pageProps} />;
      <Toaster />
    </>
  );
}

export default MyApp;
