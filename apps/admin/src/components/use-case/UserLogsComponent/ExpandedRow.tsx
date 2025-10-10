import TableComponent from '@/components/common/TableComponent/TableComponent';
import { type FC } from 'react'
import type { TaskData, TimelogData } from '.';
import type { ColumnDef } from '@tanstack/react-table';

type IProps = {
    row: TimelogData;
}

const ExpandedRow: FC<IProps> = ({ row }) => {
    // If no tasks or pending status, show "Timelog Not Added"
    if (!row.tasks || row.tasks.length === 0) {
        return (
            <div className="p-4 text-center">
                <p className="text-gray-500 italic text-lg">Timelog Not Added</p>
            </div>
        );
    }

    // Calculate total time
    const totalTime = row.tasks.reduce((sum, task) => sum + task.time, 0);

    // Define columns for the nested task table
    const taskColumns: ColumnDef<TaskData>[] = [
        {
            header: 'Time Taken (Hours)',
            accessorKey: 'time',
        },
        {
            header: 'Task Type',
            accessorKey: 'type',
        },
        {
            header: 'Task Title',
            accessorKey: 'task_description',
        },
        {
            header: 'Feature Title',
            accessorKey: 'featureTitle',
        }
    ];

    return (
        <div className="p-4">
            <h4 className="font-semibold text-gray-900 mb-3">
                Total Time Worked: {totalTime} hours
            </h4>
            <TableComponent
                data={row.tasks}
                columns={taskColumns}
                searchKeys={[]}
                shortSearch={false}
                disableSearch={true}
            />
        </div>
    );
}

export default ExpandedRow