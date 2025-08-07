import type { LogsPayload } from "./MultiStepControllerLogs";
import type { DayEndLogEntry } from "./SingleDayForm";

export type GroupedPayload = {
    projectName: string;
    projectId: string;
    logs: {
        date: string;
        logs: DayEndLogEntry[];
        totalHours: number;
    }[];
};

export function groupByProjectNameWithDates(data: LogsPayload[]): GroupedPayload[] {
    const projectMap: Record<string, Record<string, DayEndLogEntry[]>> = {};

    data.forEach(item => {
        if (!projectMap[item.projectName]) {
            projectMap[item.projectName] = {};
        }
        if (!projectMap[item.projectName][item.date]) {
            projectMap[item.projectName][item.date] = [];
        }
        projectMap[item.projectName][item.date].push(...item.logs);
    });

    return Object.entries(projectMap).map(([projectName, datesMap]) => {
        // Find the first item in data with this projectName to get projectId
        const projectItem = data.find(item => item.projectName === projectName);
        return {
            projectName,
            projectId: projectItem?.projectId ?? "",
            logs: Object.entries(datesMap).map(([date, logs]) => ({
                date,
                logs,
                totalHours: logs.reduce((acc, log) => acc + (log.timeTaken || 0), 0)
            }))
        };
    });
}
