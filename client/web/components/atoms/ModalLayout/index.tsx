import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";

import { useStore } from "@/store";

import * as S from "./styles";

interface ModalProps {
  children: React.ReactNode;
}

export default function Modal({ children }: ModalProps) {
  const { setSignInModal } = useStore();
  const escPressed = useKeyPress("Escape");

  const closeModal = useCallback(() => {
    setSignInModal(false);
  }, [setSignInModal]);

  useEffect(() => {
    if (escPressed) {
      closeModal();
    }
  }, [escPressed, closeModal]);

  return (
    <S.ModalBackground
      initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
      animate={{ opacity: 1, backdropFilter: "blur(40px)" }}
      onClick={() => closeModal()}
    >
      <S.ModalContainer
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <S.CloseBtn onClick={() => closeModal()}>
          <X size={16} />
        </S.CloseBtn>
        {children}
      </S.ModalContainer>
    </S.ModalBackground>
  );
}

export const useKeyPress = (targetKey: string) => {
  const [keyPressed, setKeyPressed] = useState(false);

  useEffect(() => {
    const downHandler = ({ key }: KeyboardEvent) => {
      if (key === targetKey) setKeyPressed(true);
    };

    const upHandler = ({ key }: KeyboardEvent) => {
      if (key === targetKey) setKeyPressed(false);
    };

    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);

    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
  }, [targetKey]);

  return keyPressed;
};
