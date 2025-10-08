// User management types
export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  isAdmin?: boolean;
  password?: string;
}

export interface CreateUserResponse {
  appName: string;
  path: string;
  statusCode: number;
  data: {
    statusCode: number;
    message: string;
    data: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      isAdmin: boolean;
      isClient: boolean;
      isActive: boolean;
      createdByUserId: string;
      createdAt: string;
      updatedAt: string;
    };
  };
  apiVersion: string;
  message: string;
  error: any;
  userId: string;
}
export type ResponseData<T> = {
  error?: boolean;
  message?: string;
  data?: T;
};

// User type matching the NestJS backend
export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isAdmin: boolean;
  isClient: boolean;
  isActive: boolean;
  createdByUserId?: string;
  createdAt: string;
  updatedAt: string;
};

// Project-related types based on the provided /projects response
export type ProjectTeamMember = {
  id: string;
  createdAt: string; // ISO string
  userId: string;
  user: User;
  role: string;
  startTime: string; // HH:mm:ss
  endTime: string; // HH:mm:ss
  overlappingHoursRequired: number;
  requiresReporting: boolean;
  projectId: string;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdByUserId: string;
  teamMembers: ProjectTeamMember[];
  client: User | null;
  clientUserId: string | null;
};

// ---------- UI-layer types (from NewProject flow) ----------
export type UiTeamMember = {
  id: string;
  role: string;
  startTime: string; // UI may provide HH:mm; we'll normalize
  endTime: string; // UI may provide HH:mm; we'll normalize
  overlappingHoursRequired?: number;
  requiresReporting: boolean;
};

export type UiProjectData = {
  projectName: string;
  projectDescription: string;
  clientUserId: string | null;
  users: UiTeamMember[];
};

export type CreateProjectTeamMemberInput = {
  userId: string;
  role: string;
  startTime: string; // HH:mm:ss
  endTime: string; // HH:mm:ss
  overlappingHoursRequired: number;
  requiresReporting: boolean;
};

export type CreateProjectPayload = {
  clientUserId?: string | null;
  name: string;
  description: string;
  teamMembers: CreateProjectTeamMemberInput[];
};


export type TimelogEntry = {
  id: string;
  taskDescription: string;
  timeTakenInHours: number;
  type: "work" | "meeting" | "break"; // union type
  featureTitle: string | null;
  createdAt: string; // ISO date string
};

export type Timelog = {
  id: string;
  logDate: string;
  createdAt: string;
  project: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  totalHours: number;
  entries: TimelogEntry[];
};

export type TimelogSummary = {
  totalDaysLogged: number;
  totalHours: number;
  entryTypeBreakdown: {
    work?: { count: number; totalHours: number };
    meeting?: { count: number; totalHours: number };
    break?: { count: number; totalHours: number };
  };
  dateRange: {
    from: string;
    to: string;
  };
};

export type UserProjectTimelogsResponse = {
  summary: TimelogSummary;
  logs: Timelog[];
};

export type TaskEntryV2 = {
  id: string;
  time: number;
  type: string;
  task_description: string;
  featureTitle: string | null;
}

export type TimeLogV2 = {
  date: string; // '2025-10-01'
  status: 'completed' | 'pending';
  createdAt: string; // ISO date string
  tasks?: TaskEntryV2[]
}

export type UserProjectTimeLogsV2Response = {
  summary: {
    projectName: string;
    userName: string;
    role: string;
    email: string;
  }
  logs: TimeLogV2[]
}