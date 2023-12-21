import { useEffect, useState, useCallback } from "react";
import { LogIn } from "lucide-react";
import { useRouter } from "next/router";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";

import { Input } from "@/components/ui/input";
import ModalLayout from "@/components/atoms/ModalLayout";
import { Button } from "@/components/ui/button";
import firebaseClient from "@/firebaseClient";
import { axiosClientWithAuth } from "@/lib/axios";
import { useToast } from "@/components/ui/use-toast";
import { useStore } from "@/store";

import * as S from "./styles";

export default function SignIn() {
  const [googleBtnDisabled, setGoogleBtnDisabled] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const { setSignInModal, user } = useStore();
  const router = useRouter();
  const auth = getAuth(firebaseClient);
  const googleProvider = new GoogleAuthProvider();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [emailBtnDisabled, setEmailBtnDisabled] = useState(false);
  const signInFromExtension = router.query.signInFromExtension;

  const sendAuthStatusResult = useCallback(async () => {
    try {
      await axiosClientWithAuth.get("/api/user");
      toast({
        description: "Successfully logged in",
      });
      setSignInModal(false);
      const { data } = await axiosClientWithAuth.get("/api/auth");
      // let chrome know that the user has logged in
      router.push(`/dashboard/onboarding?extensionToken=${data.customToken}`);

      setTimeout(() => {
        router.push(`/dashboard/onboarding`);
      }, 3000);
    } catch (error) {
      toast({
        description: "Something went wrong",
      });
    }
  }, [router, toast, setSignInModal]);

  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href) && !user) {
      setModalLoading(true);
      let email = window.localStorage.getItem("emailForSignIn");
      if (!email) {
        email = window.prompt("Please provide your email for confirmation");
      }
      if (!email) {
        return;
      }
      signInWithEmailLink(auth, email, window.location.href)
        .then(async (result) => {
          const token = await result.user?.getIdToken();
          if (!token) {
            throw new Error("Something went wrong");
          }
          sendAuthStatusResult();
          window.localStorage.removeItem("emailForSignIn");
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [
    router.query.emailSignIn,
    router.query.signInFromExtension,
    user,
    auth,
    sendAuthStatusResult,
  ]);

  const handleSocialAuth = async () => {
    setGoogleBtnDisabled(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user?.getIdToken();
      if (!token) {
        throw new Error("Something went wrong");
      }
      sendAuthStatusResult();
    } catch (error) {
      console.log(error);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        description: "Please enter a valid email",
      });
      return;
    }
    setEmailBtnDisabled(true);
    const url = `${process.env.NEXT_PUBLIC_HOST}?signinWithEmail=true&${
      signInFromExtension ? "signInFromExtension=true" : ""
    }`;
    try {
      await sendSignInLinkToEmail(auth, email, {
        url,
        handleCodeInApp: true,
      });
      window.localStorage.setItem("emailForSignIn", email);
      toast({
        title: "Email sent",
        description: "Check your email for the sign in link",
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <ModalLayout>
      <S.SignInContainer>
        <S.SignInModalIcon>
          <LogIn size={28} />
        </S.SignInModalIcon>
        <S.ModalTitle>Sign up for AI Employe</S.ModalTitle>
        <S.ModalDescription className="text-zinc-600 text-sm">
          Please provide your email to sign up for AI Employe.
        </S.ModalDescription>
        <S.InputContainer className="mt-4">
          <form onSubmit={handleFormSubmit}>
            <Input
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              type="email"
            />
            <Button
              type="submit"
              disabled={emailBtnDisabled}
              className="mt-3 w-full"
            >
              Send magic link
            </Button>
          </form>

          <LineBreak />
          <Button
            disabled={googleBtnDisabled}
            onClick={handleSocialAuth}
            variant="secondary"
            className="mt-3 w-full text-gray-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 24 24"
              className="mr-2"
            >
              <path
                fill="#FFC107"
                d="M21.805 10.041H21V10h-9v4h5.651A5.998 5.998 0 016 12a6 6 0 016-6c1.53 0 2.921.577 3.98 1.52L18.81 4.69A9.954 9.954 0 0012 2C6.478 2 2 6.478 2 12c0 5.523 4.478 10 10 10 5.523 0 10-4.477 10-10 0-.67-.069-1.325-.195-1.959z"
              ></path>
              <path
                fill="#FF3D00"
                d="M3.153 7.346l3.285 2.409A5.997 5.997 0 0112 6c1.53 0 2.92.577 3.98 1.52L18.81 4.69A9.954 9.954 0 0011.999 2a9.994 9.994 0 00-8.846 5.346z"
              ></path>
              <path
                fill="#4CAF50"
                d="M12 22c2.583 0 4.93-.988 6.705-2.596l-3.095-2.619A5.955 5.955 0 0112 18a5.997 5.997 0 01-5.641-3.973L3.098 16.54C4.753 19.778 8.114 22 12 22z"
              ></path>
              <path
                fill="#1976D2"
                d="M21.805 10.041H21V10h-9v4h5.651a6.02 6.02 0 01-2.043 2.785h.002l3.095 2.619C18.485 19.602 22 17 22 12c0-.67-.069-1.325-.195-1.959z"
              ></path>
            </svg>
            Continue with Google
          </Button>
        </S.InputContainer>
      </S.SignInContainer>
    </ModalLayout>
  );
}

const LineBreak = () => {
  return (
    <div className="flex items-center justify-center mt-4">
      <div className="h-px bg-zinc-900 w-1/2"></div>
      <span className="mx-2 text-zinc-500 text-xs">OR</span>
      <div className="h-px bg-zinc-900 w-1/2"></div>
    </div>
  );
};
