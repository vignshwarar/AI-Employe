import React, { useEffect, useRef } from "react";

import { useStore } from "../../store";

import * as S from "./styles";

const Messages = () => {
  const { messages } = useStore();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("messages", messages);
    if (ref.current) {
      ref.current.scrollIntoView({
        block: "end",
        inline: "nearest",
      });
    }
  }, [messages]);

  return (
    <S.MessageWrapper>
      <S.MessageList>
        {messages.map((message, index) => (
          <S.Message key={index}>
            <S.Role>
              {message.role === "user" ? (
                <S.You>You</S.You>
              ) : (
                <S.AI>AI Employe</S.AI>
              )}
            </S.Role>
            <S.MessageContent>{message.content}</S.MessageContent>
          </S.Message>
        ))}

        <S.Message>
          <S.Role>
            <S.AI>AI Employe</S.AI>
          </S.Role>
          <S.MessageContent>Typing...</S.MessageContent>
        </S.Message>
        <S.DummyDivToScroll ref={ref} />
      </S.MessageList>
    </S.MessageWrapper>
  );
};

export default Messages;
