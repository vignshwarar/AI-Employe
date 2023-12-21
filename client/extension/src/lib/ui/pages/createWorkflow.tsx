import React, { useCallback, useMemo, useState } from "react";
import {
  ClockIcon,
  PlusIcon,
  ArrowLeftIcon,
  StopIcon,
} from "@radix-ui/react-icons";
import { toast } from "sonner";
import parseJson from "json-parse-even-better-errors";

import Button from "../components/Button";
import { useStore } from "../store";
import { Page } from "../store/pageSlice";
import { sendMessage } from "../utils/message";
import { ActionType } from "../utils/types";
import * as S from "../styles/createWorkflow";

const CreateWorkflow = () => {
  const [showNewWorkflowInput, setShowNewWorkflowInput] = useState(false);
  const [workflowTitle, setWorkflowTitle] = useState("");
  const [workflowObjective, setWorkflowObjective] = useState("");
  const [recording, setRecording] = useState(false);
  const [disableCreateWorkflowButton, setDisableCreateWorkflowButton] =
    useState(true);

  const {
    setActivePage,
    editingWorkflow,
    setEditingWorkflow,
    updateTitle,
    updateObjective,
    setUpdatedTasks,
  } = useStore();

  const toggleNewWorkflowInput = useCallback(() => {
    setShowNewWorkflowInput((prev) => !prev);
    setWorkflowObjective("");
    setWorkflowTitle("");
    if (editingWorkflow) {
      setEditingWorkflow(null);
      setActivePage(Page.YourWorkflows);
    }
  }, [editingWorkflow, setEditingWorkflow, setActivePage]);

  const handleStartRecording = useCallback(async () => {
    const actionType = recording
      ? ActionType.STOP_RECORDING
      : ActionType.START_RECORDING;
    await sendMessage({ actionType });
    setRecording(!recording);
  }, [recording]);

  const handleCreateWorkflow = useCallback(async () => {
    if (!workflowTitle || !workflowObjective) {
      toast.error("Please enter workflow title and objective");
      return;
    }
    setDisableCreateWorkflowButton(true);
    toast.loading("It may take a few seconds to create your workflow");
    const response = await sendMessage({
      actionType: ActionType.CREATE_WORKFLOW,
      payload: { workflowTitle, workflowObjective },
    });

    if (response.payload.status?.error) {
      toast.error(response.payload.status.error);
      return;
    }

    toast.success("Workflow created successfully");
    setActivePage(Page.YourWorkflows);
  }, [workflowTitle, workflowObjective, setActivePage]);

  const handleChange = useCallback(
    (setter) => (e) => {
      setter(e.target.value);
      if (e.target.value.length === 0) {
        setDisableCreateWorkflowButton(true);
      } else {
        setDisableCreateWorkflowButton(false);
      }
    },
    []
  );

  const handleUpdateWorkflowTasks = useCallback(
    (e) => {
      try {
        setDisableCreateWorkflowButton(false);
        const tasks = parseJson(e.target.value);
        setUpdatedTasks(tasks);
      } catch (error) {
        toast.error(error.message);
      }
    },
    [setUpdatedTasks]
  );

  const updateWorkflow = useCallback(async () => {
    setDisableCreateWorkflowButton(true);
    const response = await sendMessage({
      actionType: ActionType.UPDATE_WORKFLOW,
      payload: editingWorkflow,
    });

    if (response.payload.status?.error) {
      toast.error(response.payload.status.error);
    } else {
      toast.success("Workflow updated successfully");
    }

    setEditingWorkflow(null);
    setActivePage(Page.YourWorkflows);
  }, [editingWorkflow]);

  const renderDefaultContent = () => (
    <>
      <h2>Hey there 👋,</h2>
      <p>
        You currently have zero workflows. Please either create one or describe
        what you want to achieve in the text box below.
      </p>
      <Button onClick={toggleNewWorkflowInput}>
        <PlusIcon />
        Create workflow
      </Button>
    </>
  );

  const renderNewWorkflowInput = () => (
    <>
      <S.BackButton onClick={toggleNewWorkflowInput}>
        <ArrowLeftIcon />
        Back
      </S.BackButton>
      <h2>Create new workflow</h2>
      <p>
        When you start recording, simply enter your objective and perform your
        task. We don't capture your screen, microphone, or camera - only website
        changes.
      </p>
      <S.CreateWorkflowTitle
        onChange={handleChange(
          editingWorkflow ? updateTitle : setWorkflowTitle
        )}
        value={editingWorkflow?.title || workflowTitle}
        placeholder="Your workflow title"
      />
      <S.CreateWorkflowTextarea
        onChange={handleChange(
          editingWorkflow ? updateObjective : setWorkflowObjective
        )}
        value={editingWorkflow?.objective || workflowObjective}
        placeholder="Please explain your objective point by point as if you were explaining it to a human."
      />
      {editingWorkflow && (
        <S.CreateWorkflowTextarea
          onChange={handleUpdateWorkflowTasks}
          value={JSON.stringify(editingWorkflow?.tasks, null, 2)}
          placeholder="Tasks generated from the recording"
        />
      )}
      {!editingWorkflow && (
        <Button
          onClick={handleStartRecording}
          style={{ backgroundColor: "red", marginTop: "8px" }}
          disabled={
            workflowObjective?.length === 0 || workflowTitle?.length === 0
          }
        >
          {recording ? <StopIcon /> : <ClockIcon />}
          {recording ? "Stop" : "Start"} recording
        </Button>
      )}
      <Button
        onClick={editingWorkflow ? updateWorkflow : handleCreateWorkflow}
        disabled={disableCreateWorkflowButton}
        style={{ marginTop: "8px" }}
      >
        <PlusIcon />
        {editingWorkflow ? "Update" : "Create"} workflow
      </Button>
    </>
  );

  return (
    <S.CreateWorkflowContainer>
      <S.CreateWorkflowContentWrapper>
        {showNewWorkflowInput || editingWorkflow
          ? renderNewWorkflowInput()
          : renderDefaultContent()}
      </S.CreateWorkflowContentWrapper>
    </S.CreateWorkflowContainer>
  );
};

export default CreateWorkflow;
