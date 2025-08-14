import { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import { supabase } from '@/lib/supabaseClient';
import TableComponent from '../components/common/TableComponent/TableComponent';
import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';

// Define the data types
interface TaskData {
  time: number;
  type: string;
  title: string;
}

interface TimelogData {
  date: string;
  status: string;
  tasks?: TaskData[];
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
}

interface NavigationState {
  user: TeamMember;
  projectName: string;
  projectId: string;
}

const UserTimelogScreen = () => {
  const location = useLocation();
  const navigationState = location.state as NavigationState | null;

  // Use passed data or fallback to default
  const userData = navigationState?.user || {
    id: '', // Empty ID to prevent invalid UUID error
    name: 'John Doe',
    role: 'Developer',
    email: 'john.doe@example.com'
  };
  const projectName = navigationState?.projectName || 'Default Project';
  const projectId = navigationState?.projectId || '';
  const [filter, setFilter] = useState('All Timelogs');
  const [data, setData] = useState<TimelogData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Generate dates from user creation date to today
  const generateUserDates = (userCreatedDate: string) => {
    const days = [];
    const today = new Date();
    const createdDate = new Date(userCreatedDate);

    // Start from today and go backwards to user creation date
    const currentDate = new Date(today);
    while (currentDate >= createdDate) {
      days.push(currentDate.toISOString().split('T')[0]); // YYYY-MM-DD format
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return days; // Already in reverse chronological order (today first)
  };

  useEffect(() => {
    const fetchUserTimelogs = async () => {
      // If no valid user ID, show empty state
      if (!userData.id || userData.id === '') {
        setData([]);
        setLoading(false);
        return;
      }

      try {
        // First, fetch user's creation date
        const { data: userDetails, error: userError } = await supabase
          .from('Users')
          .select('created_at')
          .eq('id', userData.id)
          .single();

        if (userError) {
          console.error('Error fetching user data:', userError);
          setLoading(false);
          return;
        }

        // Fetch user's day end logs for the specific project
        const { data: dayEndLogs, error } = await supabase
          .from('DayEndLog')
          .select(`
            id,
            created_at,
            createdByUserId,
            projectId
          `)
          .eq('createdByUserId', userData.id)
          .eq('projectId', projectId);

        if (error) {
          console.error('Error fetching timelogs:', error);
          console.error('User ID:', userData.id);
          console.error('Error details:', {
            code: error.code,
            message: error.message,
            details: error.details
          });
          setLoading(false);
          return;
        }

        // Fetch entries for all found logs
        const logIds = (dayEndLogs || []).map(log => log.id);
        let dayEndLogEntries: any[] = [];

        if (logIds.length > 0) {
          const { data: entries, error: entriesError } = await supabase
            .from('DayEndLogEntry')
            .select(`
              id,
              created_at,
              task_description,
              timeTakenInHours,
              type,
              dayEndLogId
            `)
            .in('dayEndLogId', logIds);

          if (entriesError) {
            console.error('Error fetching log entries:', entriesError);
          } else {
            dayEndLogEntries = entries || [];
          }
        }

        // Generate dates from user creation to today
        const userCreationDate = userDetails?.created_at || new Date().toISOString();
        const userDates = generateUserDates(userCreationDate);

        // Create a map of logs by date with their entries
        const logsByDate = new Map();
        (dayEndLogs || []).forEach((log: any) => {
          const logDate = new Date(log.created_at).toISOString().split('T')[0];
          if (!logsByDate.has(logDate)) {
            logsByDate.set(logDate, []);
          }

          // Find entries for this log
          const logEntries = dayEndLogEntries.filter(entry => entry.dayEndLogId === log.id);
          logsByDate.get(logDate).push({
            ...log,
            entries: logEntries
          });
        });

        // Create timelog data for each day
        const timelogData: TimelogData[] = userDates.map((dateStr: string) => {
          const date = new Date(dateStr);
          const formattedDate = date.toLocaleDateString('en-US', {
            weekday: 'long',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });

          const dayLogs = logsByDate.get(dateStr) || [];

          // Extract tasks from all logs for this day
          const tasks: TaskData[] = [];
          dayLogs.forEach((log: any) => {
            (log.entries || []).forEach((entry: any) => {
              tasks.push({
                time: entry.timeTakenInHours || 0,
                type: entry.type || 'Task', // Use actual type from database
                title: entry.task_description || 'No description'
              });
            });
          });

          // Determine status based on whether there are actual task entries
          // Even if DayEndLog exists, if there are no entries, it should be Pending
          const status = tasks.length > 0 ? 'Completed' : 'Pending';

          return {
            date: formattedDate,
            status: status,
            tasks
          };
        });

        setData(timelogData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching timelogs:', error);
        setLoading(false);
      }
    };

    fetchUserTimelogs();
  }, [userData.id, projectId]);

  const getStatusBadge = (status: string) => {
    if (status === 'Pending') {
      return (
        <span className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-800 border border-red-200">
          Pending
        </span>
      );
    } else if (status === 'Completed') {
      return (
        <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 border border-green-200">
          Completed
        </span>
      );
    }
    return null;
  };

  const renderExpandedRow = (row: TimelogData) => {
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
    const taskColumns: ColumnDef<TaskData, unknown>[] = [
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
        accessorKey: 'title',
      },
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
  };

  // Define columns for the main table
  const columns: ColumnDef<TimelogData, unknown>[] = [
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
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
  ];

  // Filter data based on selected filter
  const filteredData = data.filter(item => {
    if (filter === 'All Timelogs') return true;
    if (filter === 'Pending Timelogs') return item.status === 'Pending';
    if (filter === 'Completed Timelogs') return item.status === 'Completed';
    return true;
  });

  // Calculate pagination
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Calculate summary statistics from original data (not filtered)
  const completedLogs = data.filter(item => item.status === 'Completed').length;
  const pendingLogs = data.filter(item => item.status === 'Pending').length;

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex justify-center items-center py-12">
          <div className="animate-pulse text-gray-500">Loading user timelogs...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{userData.name}</h2>
        <p className="text-gray-600 mb-2">Project Name: {projectName}</p>
        <p className="text-gray-600 mb-4">Role: {userData.role} • Email: {userData.email}</p>

        <div className="mb-4">
          <h3 className="font-semibold text-gray-900 mb-2">Summary</h3>
          <p className="text-gray-600">Total Completed Logs: {completedLogs}</p>
          <p className="text-gray-600">Total Pending Logs: {pendingLogs}</p>
        </div>

        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          📧 Generate Report
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 inline-flex">
          <Button
            className={`px-4 py-2 rounded-md font-medium transition-colors ${filter === 'All Timelogs'
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-600 hover:text-gray-900'
              }`}
            variant="ghost"
            onClick={() => setFilter('All Timelogs')}
          >
            All Timelogs
          </Button>
          <Button
            className={`px-4 py-2 rounded-md font-medium transition-colors relative ${filter === 'Pending Timelogs'
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-600 hover:text-gray-900'
              }`}
            variant="ghost"
            onClick={() => setFilter('Pending Timelogs')}
          >
            Pending Timelogs
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {pendingLogs}
            </span>
          </Button>
          <Button
            className={`px-4 py-2 rounded-md font-medium transition-colors ${filter === 'Completed Timelogs'
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-600 hover:text-gray-900'
              }`}
            variant="ghost"
            onClick={() => setFilter('Completed Timelogs')}
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
          renderExpandedRow={renderExpandedRow}
          disableSearch={true}
        />
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <span>
          Dates per Page {itemsPerPage} • {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems}
        </span>
        <div className="flex space-x-2">
          <Button
            className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            &lt;
          </Button>
          <span className="px-3 py-1 text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            &gt;
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserTimelogScreen;