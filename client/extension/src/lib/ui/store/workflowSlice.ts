import { StateCreator } from "zustand";

export interface Task {
  task: string;
  task_number: number;
}

export interface Workflow {
  id: string;
  userId: string;
  objective: string;
  createdAt: string;
  title: string;
  tasks: Task[];
  done?: boolean;
}

export type WorkflowSlice = {
  editingWorkflow: Workflow | null;
  setEditingWorkflow: (workflow: Workflow) => void;
  updateTitle: (title: string) => void;
  updateObjective: (objective: string) => void;
  setUpdatedTasks: (tasks: Task[]) => void;
};

export const createWorkflowSlice: StateCreator<WorkflowSlice> = (set) => ({
  editingWorkflow: null,
  setEditingWorkflow: (workflow: Workflow) =>
    set({ editingWorkflow: workflow }),
  updateTitle: (title: string) =>
    set((state) => ({
      editingWorkflow: {
        ...state.editingWorkflow,
        title,
      },
    })),
  updateObjective: (objective: string) =>
    set((state) => ({
      editingWorkflow: {
        ...state.editingWorkflow,
        objective,
      },
    })),
  setUpdatedTasks: (tasks: Task[]) =>
    set((state) => ({
      editingWorkflow: {
        ...state.editingWorkflow,
        tasks,
      },
    })),
});
