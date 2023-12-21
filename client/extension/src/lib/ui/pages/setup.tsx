import React, { useState } from "react";
import { toast } from "sonner";

import { Page } from "../store/pageSlice";
import { sendMessage } from "../utils/message";
import { ActionType } from "../utils/types";
import * as S from "../styles/setup";
import * as MS from "../../ui/components/Message/styles";
import Button from "../components/Button";
import { useStore } from "../store";

const Setup = () => {
  const [openAIKey, setOpenAIKey] = useState("");
  const { setActivePage } = useStore();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (openAIKey === "") {
      toast.error("Please enter your OpenAI key");
      return;
    }
    sendMessage({
      actionType: ActionType.SETUP_OPENAI_KEY,
      payload: openAIKey,
    });
    setActivePage(Page.CreateWorkflow);
  };

  const visitOpenAI = () => {
    chrome.tabs.create({
      url: "https://openai.com/product",
    });
  };
  return (
    <S.SetupKeyContainer>
      <h2>Enter your OpenAI key</h2>
      <p>
        Get your OpenAI key from{" "}
        <a
          targe="_blank"
          onClick={visitOpenAI}
          href="https://openai.com/product"
        >
          https://openai.com/product
        </a>{" "}
        and paste it below. It will be stored locally on your computer; we will
        never store it on our servers. <br />
        <br />
        Note: Once GPT-4 Vision is out of preview, your vision requests are on
        us based on your current plan.
      </p>
      <S.Form onSubmit={handleSubmit}>
        <MS.MessageInput
          value={openAIKey}
          onChange={(e) => setOpenAIKey(e.target.value)}
          placeholder="Pasted your OpenAI key here"
        />
        <Button type="submit" style={{ marginTop: "8px" }}>
          Set OpenAI Key
        </Button>
      </S.Form>
    </S.SetupKeyContainer>
  );
};

export default Setup;
