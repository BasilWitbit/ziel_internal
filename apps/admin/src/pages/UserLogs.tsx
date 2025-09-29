/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import TableComponent from '../components/common/TableComponent/TableComponent';
import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { getSingleUserTimelogs, getUsers } from '@/api/services';
import type {
	User,
	
    UserProjectTimelogsResponse
} from "@/api/types";

// Define the data types
interface TaskData {
  time: number;
  type: string;
  task_description: string;
  featureTitle: string;
}

interface TimelogData {
  date: string;
  status: string;
  tasks?: TaskData[];
  createdAt: string;
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

  const getUserData = () => {
    // If coming from navigation state, save to localStorage and return
    if (navigationState?.user) {
      const userData = navigationState.user;
      localStorage.setItem('userLogs_userData', JSON.stringify(userData));
      return userData;
    }
    // Otherwise, try to get from localStorage
    try {
      const savedUserData = localStorage.getItem('userLogs_userData');
      if (savedUserData) {
        return JSON.parse(savedUserData);
      }
    } catch (e) {
      console.error('Error reading from localStorage:', e);
    }
    return null;
  };

  const getProjectData = () => {
    // If coming from navigation state, save to localStorage and return
    if (navigationState?.projectName && navigationState?.projectId) {
      const projectData = {
        projectId: navigationState.projectId,
        projectName: navigationState.projectName
      };
      localStorage.setItem('userLogs_projectData', JSON.stringify(projectData));
      return projectData;
    }
    
    // Otherwise, try to get from localStorage
    try {
      const savedProjectData = localStorage.getItem('userLogs_projectData');
      if (savedProjectData) {
        return JSON.parse(savedProjectData);
      }
    } catch (e) {
      console.error('Error reading project data from localStorage:', e);
    }
    return null;
  };

  const userData = getUserData();
  const projectData = getProjectData();
  const projectName = projectData?.projectName;
  const projectId = projectData?.projectId;

  // Only show error if we have absolutely no valid data
  if (!userData || !projectName || !projectId) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <p className="text-red-600 text-center">Unable to retrieve the user logs</p>
      </div>
    );
  }

  const [filter, setFilter] = useState('All Timelogs');
  const [data, setData] = useState<TimelogData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 5;

  // Helper function to get user creation date and generate date range
  const generateDateRangeFromUserCreation = async (userId: string) => {
    try {
      let userCreatedAt = null;
      
      // Try to get user creation date from the users list
      try {
        const usersResponse = await getUsers();
        if (!usersResponse.error && usersResponse.data) {
          const user = usersResponse.data.find((u: User) => u.id === userId);
          if (user) {
            userCreatedAt = user.createdAt;
            console.log('Found user creation date from users list:', userCreatedAt);
          }
        }
      } catch (usersError) {
        console.warn('Could not fetch users list:', usersError);
      }
      
      if (!userCreatedAt) {
        console.warn('Could not determine user creation date, using 6 months fallback');
        // Fallback to 6 months ago if we can't get creation date
        const fallbackDate = new Date();
        fallbackDate.setMonth(fallbackDate.getMonth() - 6);
        return {
          startDate: fallbackDate.toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0]
        };
      }
      
      const startDate = new Date(userCreatedAt).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];
      
      console.log('User creation date found:', userCreatedAt, 'Using date range:', { startDate, endDate });
      return { startDate, endDate };
      
    } catch (error) {
      console.error('Error fetching user creation date:', error);
      // Fallback to 6 months ago
      const fallbackDate = new Date();
      fallbackDate.setMonth(fallbackDate.getMonth() - 6);
      return {
        startDate: fallbackDate.toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      };
    }
  };

  // Helper function to generate all dates in range
  const generateDatesInRange = (startDate: string, endDate: string) => {
    const dates = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Start from end date and go backwards to start date for reverse chronological order
    const currentDate = new Date(end);
    while (currentDate >= start) {
      dates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    return dates;
  };

  // Helper function to transform API data to UI format
  const transformTimelogData = (apiResponse: UserProjectTimelogsResponse, dateRange: { startDate: string, endDate: string }) => {
    const { logs } = apiResponse;

    // Generate all dates in the range
    const allDates = generateDatesInRange(dateRange.startDate, dateRange.endDate);

    // Group all entries by their intended log date (prefer logDate, fallback to createdAt date)
    const entriesByDate = new Map<string, { entries: any[]; logCreatedAt: string }>();

    // Group by the parent timelog's logDate (the API returns logDate on the Timelog)
    logs.forEach((log) => {
      const logDateStr = log.logDate ? String(log.logDate).split('T')[0] : String(log.createdAt).split('T')[0];
      // Always keep the actual timelog.createdAt for display (full timestamp)
      const canonicalCreatedAt = String(log.createdAt);

      if (!entriesByDate.has(logDateStr)) {
        entriesByDate.set(logDateStr, { entries: [], logCreatedAt: canonicalCreatedAt });
      }

      // Push all entries from this timelog under the same logDate
      log.entries.forEach((entry: any) => {
        entriesByDate.get(logDateStr)?.entries.push(entry);
      });
    });

    // Transform to UI format, skipping pending weekend dates
    const timelogDataWithNulls = allDates.map((dateStr) => {
      const date = new Date(dateStr);
      const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

      const entriesForDate = entriesByDate.get(dateStr);

      if (entriesForDate && entriesForDate.entries.length > 0) {
        // Transform entries to TaskData format
        const tasks: TaskData[] = entriesForDate.entries.map((entry: any) => ({
          time: entry.timeTakenInHours,
          type: entry.type,
          task_description: entry.taskDescription,
          featureTitle: entry.featureTitle || 'No Feature Title',
        }));

        return {
          date: formattedDate,
          status: 'Completed',
          tasks,
          // show only the date part (YYYY-MM-DD) of the timelog's createdAt
          createdAt: String(entriesForDate.logCreatedAt).split('T')[0],
        } as TimelogData;
      } else {
        // No entries for this date
        const day = date.getDay(); // 0 = Sunday, 6 = Saturday
        const isWeekend = day === 0 || day === 6;

        // For weekends, do not show pending logs — skip them
        if (isWeekend) {
          return null;
        }

        return {
          date: formattedDate,
          status: 'Pending',
          tasks: [],
          createdAt: '',
        } as TimelogData;
      }
    });

    // Remove any nulls (skipped weekend pending dates)
    const timelogData: TimelogData[] = timelogDataWithNulls.filter((item): item is TimelogData => item !== null);

    return timelogData;
  };

  useEffect(() => {
    const fetchUserTimelogs = async () => {
      if (!userData?.id || !projectId) {
        setData([]);
        setLoading(false);
        return;
      }

      try {
        setError(null);
        
        // Get date range from user's creation date to today
        const { startDate, endDate } = await generateDateRangeFromUserCreation(userData.id);
        
        console.log('Fetching timelogs for date range:', { startDate, endDate, userId: userData.id, projectId });
        
        // Call the API
        const response = await getSingleUserTimelogs(
          userData.id,
          projectId,
          startDate,
          endDate
        );

        console.log('API response:', response);

        if (response.error || !response.data) {
          throw new Error(response.message || 'Failed to fetch timelogs');
        }

        // Transform API response to UI format
        const transformedData = transformTimelogData(response.data, { startDate, endDate });
        setData(transformedData);
        
      } catch (err: any) {
        console.error('Error fetching timelogs:', err);
        setError(err.message || 'Failed to fetch timelogs');
      } finally {
        setLoading(false);
      }
    };

    fetchUserTimelogs();
  }, [userData?.id, projectId]);

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
    {
      header: 'Created At',
      accessorKey: 'createdAt'
    }
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

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-800 font-semibold mb-2">Error Loading Timelogs</h3>
          <p className="text-red-700">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-red-600 hover:bg-red-700 text-white"
          >
            Retry
          </Button>
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
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 ">
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
            {pendingLogs !== 0 ? <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {pendingLogs}
            </span> : null}
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