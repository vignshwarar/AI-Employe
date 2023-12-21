import React, { useEffect, useState } from "react";

import { sendMessage } from "../utils/message";
import { ActionType } from "../utils/types";
import { useStore } from "../store";
import { Page } from "../store/pageSlice";
import * as S from "../styles/workflows";
import Workflow from "../components/Workflow";

const Workflows = () => {
  const { setActivePage } = useStore();
  const [workflowsLoading, setWorkflowsLoading] = useState(true);
  const [workflows, setWorkflows] = useState([]);

  useEffect(() => {
    async function fetchWorkflows() {
      try {
        const response = await sendMessage({
          actionType: ActionType.GET_WORKFLOWS,
        });
        setWorkflows(response.payload);
        setWorkflowsLoading(false);
        if (response.payload.length === 0) {
          setActivePage(Page.CreateWorkflow);
        }
      } catch (error) {
        console.error("Error fetching workflows:", error);
      }
    }

    fetchWorkflows();
  }, []);

  if (workflows.length === 0 && !workflowsLoading) {
    setActivePage(Page.CreateWorkflow);
  }

  return (
    <S.WorkflowContainer>
      <S.WorkflowTitle>Your workflows</S.WorkflowTitle>
      {workflowsLoading && <S.WorkflowContentPlaceholder />}
      {workflows.map((data) => (
        <Workflow key={data.id} data={data} />
      ))}
    </S.WorkflowContainer>
  );
};

export default Workflows;
