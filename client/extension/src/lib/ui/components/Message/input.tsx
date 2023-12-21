import React, { useState } from "react";
import { ArrowUpIcon } from "@radix-ui/react-icons";
import { toast } from "sonner";

import { useStore } from "../../store";
import { Page } from "../../store/pageSlice";
import { Message } from "../../store/messageSlice";
import { sendMessage } from "../../utils/message";
import { ActionType } from "../../utils/types";
import * as S from "./styles";

const MessageInput = () => {
  const {
    setBlurContent,
    setActivePage,
    addMessage,
    setShowTyping,
    messages,
    editingWorkflow,
  } = useStore();
  const [message, setMessage] = useState("");

  const setInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    if (e.target.value != "") {
      setBlurContent(true);
    } else {
      setBlurContent(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (editingWorkflow) {
      toast.error("You can't send messages while a workflow is running.");
      return;
    }

    if (message === "") {
      return;
    }
    let payloadBackend: Message[] = [];
    if (messages.length > 0) {
      payloadBackend = [
        ...messages,
        {
          content: message,
          role: "user",
        },
      ];
    } else {
      payloadBackend = [
        {
          content: message,
          role: "user",
        },
      ];
    }

    const payload = {
      content: message,
      role: "user",
    };
    addMessage(payload as Message);
    sendMessage({
      actionType: ActionType.NEW_MESSAGE,
      payload: payloadBackend,
    });
    setActivePage(Page.Messages);
    setShowTyping(true);
    setMessage("");
  };

  return (
    <S.MessageContainer>
      <S.MessageInputForm onSubmit={handleSubmit}>
        <S.MessageInput
          value={message}
          onChange={setInput}
          placeholder="Ask questions about what you see (e.g., graphs, images, etc.)."
        />
        <S.SendButton>
          <ArrowUpIcon />
        </S.SendButton>
      </S.MessageInputForm>
    </S.MessageContainer>
  );
};

export default MessageInput;
