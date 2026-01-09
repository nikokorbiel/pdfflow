// Workflow system for chaining PDF tools

export type WorkflowToolType =
  | "compress"
  | "watermark"
  | "rotate"
  | "page-numbers"
  | "protect";

export interface WorkflowStep {
  id: string;
  tool: WorkflowToolType;
  config: Record<string, unknown>;
}

export interface Workflow {
  id: string;
  name: string;
  steps: WorkflowStep[];
  createdAt: number;
  updatedAt: number;
}

export const WORKFLOW_TOOLS: {
  id: WorkflowToolType;
  name: string;
  description: string;
  icon: string;
  gradient: string;
  defaultConfig: Record<string, unknown>;
}[] = [
  {
    id: "compress",
    name: "Compress",
    description: "Reduce file size",
    icon: "FileDown",
    gradient: "from-emerald-500 to-teal-400",
    defaultConfig: {
      quality: "medium", // low, medium, high
    },
  },
  {
    id: "watermark",
    name: "Watermark",
    description: "Add text watermark",
    icon: "Droplets",
    gradient: "from-blue-500 to-indigo-500",
    defaultConfig: {
      text: "CONFIDENTIAL",
      opacity: 0.3,
      fontSize: 48,
      rotation: -45,
      color: "#6b7280",
    },
  },
  {
    id: "rotate",
    name: "Rotate",
    description: "Rotate all pages",
    icon: "RotateCw",
    gradient: "from-teal-500 to-cyan-400",
    defaultConfig: {
      angle: 90, // 90, 180, 270
    },
  },
  {
    id: "page-numbers",
    name: "Page Numbers",
    description: "Add page numbers",
    icon: "Hash",
    gradient: "from-slate-500 to-gray-400",
    defaultConfig: {
      position: "bottom-center", // bottom-center, bottom-right, top-right
      startFrom: 1,
      format: "number", // number, page-x, page-x-of-y
    },
  },
  {
    id: "protect",
    name: "Protect",
    description: "Add password",
    icon: "Lock",
    gradient: "from-amber-500 to-yellow-500",
    defaultConfig: {
      password: "",
      allowPrinting: true,
      allowCopying: false,
    },
  },
];

const WORKFLOWS_KEY = "pdfflow_workflows";

export function getWorkflows(): Workflow[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(WORKFLOWS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveWorkflow(workflow: Omit<Workflow, "id" | "createdAt" | "updatedAt">): Workflow {
  const workflows = getWorkflows();
  const newWorkflow: Workflow = {
    ...workflow,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  workflows.push(newWorkflow);
  localStorage.setItem(WORKFLOWS_KEY, JSON.stringify(workflows));
  return newWorkflow;
}

export function updateWorkflow(id: string, updates: Partial<Workflow>): Workflow | null {
  const workflows = getWorkflows();
  const index = workflows.findIndex((w) => w.id === id);
  if (index === -1) return null;

  workflows[index] = {
    ...workflows[index],
    ...updates,
    updatedAt: Date.now(),
  };
  localStorage.setItem(WORKFLOWS_KEY, JSON.stringify(workflows));
  return workflows[index];
}

export function deleteWorkflow(id: string): boolean {
  const workflows = getWorkflows();
  const filtered = workflows.filter((w) => w.id !== id);
  if (filtered.length === workflows.length) return false;
  localStorage.setItem(WORKFLOWS_KEY, JSON.stringify(filtered));
  return true;
}

export function createWorkflowStep(tool: WorkflowToolType): WorkflowStep {
  const toolDef = WORKFLOW_TOOLS.find((t) => t.id === tool);
  return {
    id: crypto.randomUUID(),
    tool,
    config: { ...(toolDef?.defaultConfig || {}) },
  };
}
