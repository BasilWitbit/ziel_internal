import type { TimelogData } from ".";

// inputs: teammemberID, projectID
// outputs: {user, projectName, timelogs[]}

export const USER_DATA = {
    name: 'John Doe',
    role: 'Developer',
    email: 'john.doe@example.com'
}
export const PROJECT_NAME = 'Project Alpha'
export const LOGS: TimelogData[] = [
    {
        date: '2025-10-01',
        status: 'completed',
        createdAt: '2025-10-01T09:15:00Z',
        tasks: [
            { time: 120, type: 'bugfix', task_description: 'Fixed login API issue causing 500 errors', featureTitle: 'Authentication' },
            { time: 90, type: 'refactor', task_description: 'Refactored auth middleware for cleaner session validation', featureTitle: 'Session Handling' },
            { time: 60, type: 'testing', task_description: 'Wrote Jest unit tests for login and token refresh', featureTitle: 'Authentication' },
        ],
    },
    {
        date: '2025-10-02',
        status: 'completed',
        createdAt: '2025-10-02T10:30:00Z',
        tasks: [
            { time: 180, type: 'feature', task_description: 'Implemented role-based UI access controls', featureTitle: 'Access Control' },
            { time: 120, type: 'refactor', task_description: 'Cleaned up project routes and improved folder structure', featureTitle: 'Routing' },
        ],
    },
    {
        date: '2025-10-03',
        status: 'pending',
        createdAt: '2025-10-03T08:45:00Z',
        tasks: [
            { time: 120, type: 'feature', task_description: 'Integrated email report generator with backend API', featureTitle: 'Reporting' },
            { time: 60, type: 'ui', task_description: 'Fixed minor CSS and alignment issues in dashboard cards', featureTitle: 'Dashboard' },
        ],
    },
    {
        date: '2025-10-04',
        status: 'completed',
        createdAt: '2025-10-04T11:00:00Z',
        tasks: [
            { time: 150, type: 'feature', task_description: 'Added pagination to timelogs table', featureTitle: 'Timelog Module' },
            { time: 120, type: 'optimization', task_description: 'Optimized database queries for faster loading', featureTitle: 'Database' },
            { time: 60, type: 'feature', task_description: 'Added endpoints for audit trail tracking', featureTitle: 'Audit Trail' },
        ],
    },
    {
        date: '2025-10-05',
        status: 'pending',
        createdAt: '2025-10-05T07:20:00Z',
        tasks: [
            { time: 90, type: 'feature', task_description: 'Implemented export-to-CSV function for reports', featureTitle: 'Export' },
            { time: 120, type: 'feature', task_description: 'Added filters for completed and pending logs', featureTitle: 'Filters' },
        ],
    },
    {
        date: '2025-10-06',
        status: 'completed',
        createdAt: '2025-10-06T13:00:00Z',
        tasks: [
            { time: 180, type: 'devops', task_description: 'Configured CI/CD pipeline for automatic deployments', featureTitle: 'DevOps' },
            { time: 120, type: 'deployment', task_description: 'Deployed staging environment on Railway', featureTitle: 'Deployment' },
        ],
    },
    {
        date: '2025-10-07',
        status: 'pending',
        createdAt: '2025-10-07T09:10:00Z',
        tasks: [
            { time: 120, type: 'feature', task_description: 'Added search functionality to timelogs table', featureTitle: 'Search' },
            { time: 60, type: 'ui', task_description: 'Implemented expandable row UI for nested tasks', featureTitle: 'UI/UX' },
        ],
    },
    {
        date: '2025-10-08',
        status: 'completed',
        createdAt: '2025-10-08T08:30:00Z',
        tasks: [
            { time: 90, type: 'bugfix', task_description: 'Fixed date filter issue causing skipped entries', featureTitle: 'Timelog Filter' },
            { time: 60, type: 'testing', task_description: 'Added test cases for pagination logic', featureTitle: 'Testing' },
        ],
    },
];

