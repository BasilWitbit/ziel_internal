/* eslint-disable @typescript-eslint/no-unused-vars */
import TableComponent from '@/components/common/TableComponent/TableComponent'
import { Button } from '@/components/ui/button'
import type { ColumnDef } from '@tanstack/react-table';
import ExpandedRow from './ExpandedRow';
import useData, { ITEMS_PER_PAGE } from './useData';
import type { FC } from 'react';

// Define the data types
export interface TaskData {
    time: number;
    type: string;
    task_description: string;
    featureTitle: string;
}

export interface TimelogData {
    date: string;
    status: 'completed' | 'pending';
    tasks?: TaskData[];
    createdAt: string;
}

const STATUS_BADGES = {
    completed: <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 border border-green-200">Completed</span>,
    pending: <span className="px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800 border border-yellow-200">Pending</span>
}

// Define columns for the main table
const columns: ColumnDef<TimelogData>[] = [
    {
        header: 'Date',
        accessorKey: 'date',
        cell: ({ row }) => (
            <span className="font-medium text-gray-900">{row.original.date}</span>
        ),
    },
    {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }) => STATUS_BADGES[row.original.status],
    },
    {
        header: 'Created At',
        accessorKey: 'createdAt'
    }
];

export type SummaryShape = {
    projectName: string;
    user: { name: string; role: string; email: string }
    completedLogs?: number;
    pendingLogs?: number;
    totalLogs?: number;
}

type IProps = {
    timeLogs: TimelogData[];
    summary?: SummaryShape | null;
}

const UserLogsComponent: FC<IProps> = ({ timeLogs, summary: providedSummary = null }) => {
    const {
        paginatedData,
        filter,
        summary,
        paginationOptions,
        setFilter
    } = useData(timeLogs, providedSummary);

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{summary.user.name}</h2>
                <p className="text-gray-600 mb-2">Project Name: {summary.projectName}</p>
                <p className="text-gray-600 mb-4">Role: {summary.user.role} • Email: {summary.user.email}</p>

                <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Summary</h3>
                    <p className="text-gray-600">Total Completed Logs: {summary.completedLogs}</p>
                    <p className="text-gray-600">Total Pending Logs: {summary.pendingLogs}</p>
                </div>

                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    📧 Generate Report
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="mb-6">
                <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 ">
                    <Button
                        className={`px-4 py-2 rounded-md font-medium transition-colors ${filter === 'all'
                            ? 'bg-white shadow-sm text-gray-900'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                        variant="ghost"
                        onClick={() => setFilter('all')}
                    >
                        All Timelogs
                    </Button>
                    <Button
                        className={`px-4 py-2 rounded-md font-medium transition-colors relative ${filter === 'pending'
                            ? 'bg-white shadow-sm text-gray-900'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                        variant="ghost"
                        onClick={() => setFilter('pending')}
                    >
                        Pending Timelogs
                        {summary.pendingLogs !== 0 ? <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {summary.pendingLogs}
                        </span> : null}
                    </Button>
                    <Button
                        className={`px-4 py-2 rounded-md font-medium transition-colors ${filter === 'completed'
                            ? 'bg-white shadow-sm text-gray-900'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                        variant="ghost"
                        onClick={() => setFilter('completed')}
                    >
                        Completed Timelogs
                    </Button>
                </div>
            </div>

            {/* Main Expandable Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <TableComponent
                    data={paginatedData}
                    columns={columns}
                    searchKeys={[]}
                    shortSearch={false}
                    expandable={true}
                    renderExpandedRow={(row) => <ExpandedRow row={row} />}
                    disableSearch={true}
                />
            </div>

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                <span>
                    Dates per Page {ITEMS_PER_PAGE} • {paginationOptions.startIndex + 1}-{Math.min(paginationOptions.endIndex, paginationOptions.totalItems)} of {paginationOptions.totalItems}
                </span>
                <div className="flex space-x-2">
                    <Button
                        className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
                        variant="outline"
                        onClick={() => paginationOptions.prevPage()}
                        disabled={paginationOptions.currentPage === 1}
                    >
                        &lt;
                    </Button>
                    <span className="px-3 py-1 text-gray-700">
                        Page {paginationOptions.currentPage} of {paginationOptions.totalPages}
                    </span>
                    <Button
                        className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
                        variant="outline"
                        onClick={() => paginationOptions.nextPage()}
                        disabled={paginationOptions.currentPage === paginationOptions.totalPages || paginationOptions.totalPages === 0}
                    >
                        &gt;
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default UserLogsComponent