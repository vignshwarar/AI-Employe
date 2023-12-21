import React, { useEffect, useRef } from "react";

import { useStore } from "../store";
import * as S from "../../ui/components/Message/styles";
import { Content } from "../store/messageSlice";
import Workflow from "../components/Workflow";

const Messages = () => {
  const { messages, showTyping, workflow } = useStore();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollIntoView({
        block: "end",
        inline: "nearest",
      });
    }
  }, [messages]);

  const renderContent = (message: Content) => {
    console.log("i am rendering.. message ---->", message);
    if (typeof message === "string") {
      return <S.MessageContent>{message}</S.MessageContent>;
    }
    return message.map((content, index) => {
      if (typeof content === "string") {
        return <S.MessageContent key={index}>{content}</S.MessageContent>;
      }
      return (
        <S.MessageContent key={index}>
          {content?.value}
          {content?.thought_process && (
            <>
              <br />
              {content?.thought_process}
            </>
          )}
        </S.MessageContent>
      );
    });
  };

  return (
    <S.MessageWrapper>
      {workflow && <Workflow data={workflow} />}
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
            {renderContent(message.content)}
          </S.Message>
        ))}

        {showTyping && (
          <S.Message>
            <S.Role>
              <S.AI>AI Employe</S.AI>
            </S.Role>
            <S.MessageContent>Typing...</S.MessageContent>
          </S.Message>
        )}

        <S.DummyDivToScroll ref={ref} />
      </S.MessageList>
    </S.MessageWrapper>
  );
};

export default Messages;
