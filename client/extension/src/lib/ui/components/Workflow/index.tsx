import React from "react";
import {
  PlayIcon,
  StopIcon,
  CheckCircledIcon,
  Pencil1Icon,
} from "@radix-ui/react-icons";
import { toast } from "sonner";

import { Workflow } from "../../store/workflowSlice";
import { Page } from "../../store/pageSlice";
import { useStore } from "../../store";
import Button from "../Button";
import { sendMessage } from "../../utils/message";
import { ActionType } from "../../utils/types";

import * as S from "../../styles/workflows";
import { colors } from "../../styles/global";

interface WorkflowProps {
  data: Workflow;
  key?: number;
}

const Workflow = ({ data }: WorkflowProps) => {
  const {
    setActivePage,
    setWorkflow,
    clearMessages,
    setShowTyping,
    workflow: currentWorkflow,
    setEditingWorkflow,
  } = useStore();

  const isCurrentWorkflowRunning = currentWorkflow?.id === data.id;
  const isCurrentWorkflowDone = currentWorkflow?.done;

  const cleanUpAndClose = () => {
    clearMessages();
    setWorkflow(null);
    setActivePage(Page.YourWorkflows);
    setShowTyping(false);
  };

  const startWorkflow = async (workflow) => {
    if (currentWorkflow) {
      sendMessage({
        actionType: ActionType.STOP_WORKFLOW,
        payload: { workflowId: currentWorkflow.id },
      });
      cleanUpAndClose();
      toast.success("Workflow stopped successfully");
      return;
    }

    clearMessages();
    setShowTyping(true);
    setWorkflow(workflow);
    setActivePage(Page.Messages);
    sendMessage({
      actionType: ActionType.INITIATE_WORKFLOW,
      payload: { workflowId: workflow.id },
    });
  };

  const handleEditWorkflow = () => {
    setEditingWorkflow(data);
    setActivePage(Page.CreateWorkflow);
  };

  const renderWorkflowStatus = () => {
    if (isCurrentWorkflowDone) {
      return (
        <Button
          onClick={() => cleanUpAndClose()}
          style={{
            marginTop: "auto",
            backgroundColor: colors.grey,
            color: "black",
          }}
        >
          Workflow done 🥳. Click to close.
        </Button>
      );
    }
    return (
      <Button
        onClick={() => startWorkflow(data)}
        style={{
          marginTop: "auto",
          backgroundColor: isCurrentWorkflowRunning ? "red" : colors.blue,
        }}
      >
        {isCurrentWorkflowRunning ? <StopIcon /> : <PlayIcon />}
        {isCurrentWorkflowRunning ? "Stop" : "Start"}
      </Button>
    );
  };

  return (
    <S.WorkflowContentWrapper key={data.id}>
      <S.EditWorkflowButton
        onClick={() => handleEditWorkflow()}
        className="edit"
      >
        <Pencil1Icon />
      </S.EditWorkflowButton>
      <h3>{data.title}</h3>
      <p>{data.objective}</p>
      <S.WorkflowOptions>
        <S.TasksTag onClick={() => handleEditWorkflow()}>
          <CheckCircledIcon />
          <p>{data.tasks && data.tasks.length} tasks</p>
        </S.TasksTag>
      </S.WorkflowOptions>
      {renderWorkflowStatus()}
    </S.WorkflowContentWrapper>
  );
};

export default Workflow;
