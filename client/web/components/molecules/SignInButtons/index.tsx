import Link from "next/link";
import { useState } from "react";
import { signInWithPopup, getAuth, GoogleAuthProvider } from "firebase/auth";
import { useRouter } from "next/router";

import firebaseClient from "@/firebaseClient";
import { axiosClientWithAuth } from "@/lib/axios";
import { useToast } from "@/components/ui/use-toast";
import { useStore } from "@/store";

import * as S from "./styles";

const SignInButtons = () => {
  const { setSignInModal, user } = useStore();
  const [googleBtnDisabled, setGoogleBtnDisabled] = useState(false);
  const auth = getAuth(firebaseClient);
  const googleProvider = new GoogleAuthProvider();
  const { toast } = useToast();
  const router = useRouter();

  const sendAuthStatusResult = async (token: string) => {
    try {
      await axiosClientWithAuth.get("/api/user");
      toast({
        description: "Successfully logged in",
      });
      setSignInModal(false);
      router.push("/dashboard/onboarding");
    } catch (error) {
      toast({
        description: "Something went wrong",
      });
    }
  };

  const handleSocialAuth = async () => {
    setGoogleBtnDisabled(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user?.getIdToken();
      if (!token) {
        throw new Error("Something went wrong");
      }
      sendAuthStatusResult(token);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <S.SignInButtons>
      <S.SignInWithGoogleBackground
        initial={{
          background:
            "linear-gradient(151deg, #575757 0%, rgba(29, 29, 29, 0) 100%)",
        }}
        whileHover={{
          background:
            "linear-gradient(151deg, #575757 200%, rgba(29, 29, 29, 0) 100%)",
        }}
        transition={{ duration: 0.5 }}
      >
        <S.SignInWithGoogle
          disabled={googleBtnDisabled}
          onClick={handleSocialAuth}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
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
          <span>Continue with Google</span>
        </S.SignInWithGoogle>
      </S.SignInWithGoogleBackground>
      <Link
        className="text-gray-400 font-thin transition duration-100 ease-in-out hover:text-gray-100 mx-4 mt-2"
        href="/ltdpricing"
      >
        Go to pricing
      </Link>
    </S.SignInButtons>
  );
};

export default SignInButtons;
