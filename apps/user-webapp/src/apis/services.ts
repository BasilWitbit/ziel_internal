
import axios from "../utils/axiosInstance";
import { getAccessToken } from "../utils/storage";
import type {
	ResponseData,
	User,
	Project,
	UiProjectData,
	CreateProjectPayload,
	Timelog,
	UserProjectTimelogsResponse,
	MySummaryResponse,
	MyPendingLogsResponse,
} from "./types";

export const createProject = async (
	payload: CreateProjectPayload | UiProjectData
): Promise<ResponseData<Project>> => {
	try {
		// Normalize: if payload is UI shape, map it to API payload
		const isUiPayload = (p: any): p is UiProjectData =>
			typeof p === 'object' && p !== null && 'projectName' in p && 'users' in p;

		const toHHmmss = (time: string): string => {
			if (!time) return "00:00:00";
			if (/^\d{1,2}:\d{2}:\d{2}$/.test(time)) return time;
			if (/^\d{1,2}:\d{2}$/.test(time)) return `${time}:00`;
			if (/^\d{1,2}$/.test(time)) return `${time.padStart(2, '0')}:00:00`;
			const parts = time.split(':').map((p) => p.trim());
			const h = parts[0] ? parts[0].padStart(2, '0') : '00';
			const m = parts[1] ? parts[1].padStart(2, '0') : '00';
			const s = parts[2] ? parts[2].padStart(2, '0') : '00';
			return `${h}:${m}:${s}`;
		};

		const apiPayload: CreateProjectPayload = isUiPayload(payload)
			? {
				clientUserId: payload.clientUserId ?? null,
				name: payload.projectName.trim(),
				description: payload.projectDescription.trim(),
				teamMembers: (payload.users || []).map((member) => ({
					userId: member.id,
					role: member.role,
					startTime: toHHmmss(member.startTime),
					endTime: toHHmmss(member.endTime),
					overlappingHoursRequired: member.overlappingHoursRequired ?? 0,
					requiresReporting: member.requiresReporting,
				})),
			}
			: (payload as CreateProjectPayload);

		// Only include clientUserId if provided (avoid DTO failures)
		const body: any = { ...apiPayload };
		if (body.clientUserId === undefined || body.clientUserId === null || body.clientUserId === '') {
			delete body.clientUserId;
		}
		const token = getAccessToken();
		const res = await axios.post("/projects", body, {
			headers: token ? { Authorization: `Bearer ${token}` } : undefined,
		});

		// Expecting envelope with data: Project
		const data = (res?.data?.data ?? res?.data?.project ?? null) as Project | null;

		return {
			error: false,
			message: "Project created successfully",
			data: data ?? (null as unknown as Project),
		};
	} catch (err: any) {
		// Prefer detailed Nest validation errors
		let message = err?.response?.data?.message || err?.response?.data?.error?.message || err?.message;
		if (Array.isArray(message)) message = message.join(", ");
		message = message || "Failed to create project";
		return { error: true, message } as ResponseData<Project>;
	}
};





export const getProjects = async (): Promise<ResponseData<Project[]>> => {
	try {
		const res = await axios.get("/projects");
		const payload = (res?.data?.data ?? res?.data?.projects ?? res?.data ?? []) as unknown;
		const projects = Array.isArray(payload) ? (payload as Project[]) : [];

		return {
			error: false,
			message: "Projects fetched successfully",
			data: projects,
		};
	} catch (err: any) {
		const message = err?.response?.data?.message || err?.message || "Failed to fetch projects";
		return { error: true, message, data: [] };
	}
};


export const getMyProjects = async (): Promise<ResponseData<Project[]>> => {
	try {
		const token = getAccessToken();
		const res = await axios.get("/projects/my-projects", {
			headers: token ? { Authorization: `Bearer ${token}` } : undefined,
		});

		// Sample API returns an envelope with data: []
		const payload = (res?.data?.data ?? res?.data?.projects ?? res?.data ?? []) as unknown;
		const projects = Array.isArray(payload) ? (payload as Project[]) : [];

		return {
			error: false,
			message: res?.data?.message || "My projects fetched successfully",
			data: projects,
		};
	} catch (err: any) {
		let message = err?.response?.data?.message || err?.message || "Failed to fetch my projects";
		if (Array.isArray(message)) message = message.join(", ");
		return { error: true, message, data: [] };
	}
};



export const getUsers = async (): Promise<ResponseData<User[]>> => {
	try {
		const res = await axios.get("/users");
		// Try multiple shapes to be resilient
		const users: User[] =
			res?.data?.data?.data?.users ??
			res?.data?.data?.users ??
			res?.data?.users ??
			[];
		return {
			error: false,
			message: "Users fetched successfully",
			data: users,
		};
	} catch (err: any) {
		const message = err?.response?.data?.message || err?.message || "Failed to fetch users";
		return { error: true, message, data: [] };
	}

};

export const myPendingLogs = async (): Promise<ResponseData<MyPendingLogsResponse>> => {
	try {
		const token = getAccessToken();
		const res = await axios.get("/day-end-logs/my-pending-logs", {
			headers: token ? { Authorization: `Bearer ${token}` } : undefined,
		});

		// Defensive unwrap in case Nest wraps differently
		const data = (res?.data?.data?.data ?? res?.data?.data) as MyPendingLogsResponse;

		return {
			error: false,
			message: res?.data?.message || "My pending logs fetched successfully",
			data,
		};
	} catch (err: any) {
		let message = err?.response?.data?.message || err?.message || "Failed to fetch pending logs";
		if (Array.isArray(message)) message = message.join(", ");
		return { error: true, message, data: undefined };
	}
};


export const getUserById = async (id: string): Promise<ResponseData<User | null>> => {
	try {
		const token = getAccessToken();
		const res = await axios.get(`/users/${id}`, {
			headers: token ? { Authorization: `Bearer ${token}` } : undefined,
		});
		// Defensive: unwrap .data if present - try different response structures
		const user = (res?.data?.data?.data ?? res?.data?.data ?? res?.data) as User | null;
		return {
			error: false,
			message: res?.data?.message || 'User fetched successfully',
			data: user,
		};
	} catch (err: any) {
		let message = err?.response?.data?.message || err?.message;
		if (Array.isArray(message)) message = message.join(', ');
		return { error: true, message, data: null };
	}
};
export const updateProject = async (
	id: string,
	data: { name?: string; description?: string; clientUserId?: string }
): Promise<ResponseData<Project>> => {
	try {
		const token = getAccessToken();
		// Clean payload: trim name/description, omit empty clientUserId
		const body: any = { ...data };
		if (typeof body.name === 'string') body.name = body.name.trim();
		if (typeof body.description === 'string') body.description = body.description.trim();
		if (body.clientUserId === undefined || body.clientUserId === null || body.clientUserId === '') {
			delete body.clientUserId;
		}
		const res = await axios.patch(`/projects/${id}`, body, {
			headers: token ? { Authorization: `Bearer ${token}` } : undefined,
		});
		// Defensive: unwrap .data if present
		const project = (res?.data?.data ?? res?.data) as Project;
		return {
			error: false,
			message: res?.data?.message || 'Project updated successfully',
			data: project,
		};
	} catch (err: any) {
		let message = err?.response?.data?.message || err?.message;
		if (Array.isArray(message)) message = message.join(', ');
		return { error: true, message, data: undefined };
	}
};

// GET /projects/:id — fetch a single project by ID
export const getProjectById = async (id: string): Promise<ResponseData<Project | null>> => {
	try {
		const token = getAccessToken();
		const res = await axios.get(`/projects/${id}`, {
			headers: token ? { Authorization: `Bearer ${token}` } : undefined,
		});
		// Defensive: unwrap .data if present
		const project = (res?.data?.data ?? res?.data) as Project | null;
		return {
			error: false,
			message: res?.data?.message || 'Project fetched successfully',
			data: project,
		};
	} catch (err: any) {
		let message = err?.response?.data?.message || err?.message;
		if (Array.isArray(message)) message = message.join(', ');
		return { error: true, message, data: null };
	}
};

export const getSingleUserTimelogs = async (
	userId: string,
	projectId: string,
	startDate: string,
	endDate: string
): Promise<ResponseData<UserProjectTimelogsResponse>> => {
	try {
		const token = getAccessToken();

		const res = await axios.get(`/day-end-logs/user-project-timelogs`, {
			params: { userId, projectId, startDate, endDate },
			headers: token ? { Authorization: `Bearer ${token}` } : undefined,
		});

		const data = (res?.data?.data?.data ?? res?.data?.data) as UserProjectTimelogsResponse;

		return { error: false, message: res?.data?.message || "Success", data };
	} catch (err: any) {
		let message = err?.response?.data?.message || err?.message;
		if (Array.isArray(message)) message = message.join(", ");
		return { error: true, message, data: undefined };
	}
};

export const getTimeLogSummary = async (): Promise<ResponseData<MySummaryResponse>> => {
	try {
		const token = getAccessToken();

		const res = await axios.get('/day-end-logs/my-summary', {
			headers: token ? { Authorization: `Bearer ${token}` } : undefined,
		});

		const data = (res?.data?.data?.data ?? res?.data?.data) as MySummaryResponse;

		return { error: false, message: res?.data?.message || "Success", data };
	} catch (err: any) {
		let message = err?.response?.data?.message || err?.message;
		if (Array.isArray(message)) message = message.join(", ");
		return { error: true, message, data: undefined };
	}
};

export const postDayEndLogs = async (
	payload: {
		date: string;
		projectId: string;
		entries: Array<{
			description?: string;
			duration?: number;
			type?: "work" | "meeting" | "break";
			taskDescription?: string;
			timeTakenInHours?: number;
		}>;
	}
): Promise<ResponseData<Timelog>> => {
	try {
		const token = getAccessToken();

		// Normalize entries to { description, duration, type }
		const entries = (payload.entries || []).map((e) => {
			const description = e.description ?? e.taskDescription ?? "";
			const duration = typeof e.duration === "number" ? e.duration : e.timeTakenInHours ?? 0;
			const type = (e.type ?? "work") as "work" | "meeting" | "break";
			return { description, duration, type };
		});

		const body = {
			date: payload.date,
			projectId: payload.projectId,
			entries,
		};

		const res = await axios.post("/day-end-logs", body, {
			headers: token ? { Authorization: `Bearer ${token}` } : undefined,
		});

		const data = (res?.data?.data ?? res?.data) as Timelog;

		return {
			error: false,
			message: res?.data?.message || "Day-end logs posted successfully",
			data,
		};
	} catch (err: any) {
		let message = err?.response?.data?.message || err?.message;
		if (Array.isArray(message)) message = message.join(", ");
		return { error: true, message, data: undefined };
	}



};

