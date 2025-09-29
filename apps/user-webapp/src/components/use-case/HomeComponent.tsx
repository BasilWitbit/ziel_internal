import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import TableComponent from '@/components/common/TableComponent/TableComponent'
import type { ColumnDef } from '@tanstack/react-table'
import { MoreVertical, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import SingleDayForm from '@/components/use-case/DayEndLogsComponent/SingleDayForm'
import {getTimeLogSummary} from '@/apis/services'
import type { MySummaryResponse, ResponseData } from '@/apis/types' // Import the types

// Define the data structure for time logs
interface TimeLogEntry {
  id: string
  project: string
  date: string
  hours: number
  entriesCount: number
  verified: boolean
}

// Verified badge component
const VerifiedBadge = ({ verified }: { verified: boolean }) => (
  <div className="flex justify-center">
    {verified ? (
      <span className="text-green-600">✓</span>
    ) : (
      <span className="text-gray-400">○</span>
    )}
  </div>
)

// Dropdown component (kept but removed the "Mark Day End Logs" item so it no longer opens the modal)
const ActionsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false)
  
  const toggleDropdown = () => setIsOpen(!isOpen)
  
  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.dropdown-container')) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="relative dropdown-container">
      <Button
        onClick={toggleDropdown}
        variant="ghost"
        size="icon"
        className="text-gray-400 hover:text-gray-600 p-1"
        aria-label="More actions"
      >
        <MoreVertical size={16} />
      </Button>
      
      {/* Intentionally left empty: no "Mark Day End Logs" item here to avoid opening the modal from the three-dots menu */}
      {isOpen && (
        <div className="absolute right-0 top-8 z-50 bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-[160px]">
          {/* Add other non-modal actions here if needed */}
        </div>
      )}
    </div>
  )
}

// Actions component
const ActionsCell = ({ row }: { row: TimeLogEntry }) => {
  return (
    <div className="flex justify-center space-x-2">
      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600 p-1" aria-label={`View ${row.project}`}>
        <Eye size={16} />
      </Button>
      <ActionsDropdown />
    </div>
  )
}

// Table columns definition
const columns: ColumnDef<TimeLogEntry>[] = [
  { 
    accessorKey: 'project', 
    header: 'Project' 
  },
  { 
    accessorKey: 'date', 
    header: 'Date' 
  },
  { 
    accessorKey: 'hours', 
    header: 'Total Hours',
    cell: ({ getValue }) => (getValue() as number).toFixed(2),
  },
  { 
    accessorKey: 'entriesCount', 
    header: 'Entries Count' 
  },
  {
    accessorKey: 'verified',
    header: 'Marked',
    cell: ({ getValue }) => (
      <VerifiedBadge verified={getValue() as boolean} />
    ),
  },
  {
    id: 'actions',
    header: 'Action',
    cell: ({ row }) => <ActionsCell row={row.original} />,
  },
]

const HomeComponent = () => {
  const [timeLogs, setTimeLogs] = useState<TimeLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDayEnd, setOpenDayEnd] = useState(false)
  const [activeRow, setActiveRow] = useState<TimeLogEntry | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res: ResponseData<MySummaryResponse> = await getTimeLogSummary();
        if (!res.error && res.data?.recentLogs) {
          // Map API response to table rows - accessing recentLogs directly from MySummaryResponse
          const rows: TimeLogEntry[] = res.data.recentLogs.map((log: MySummaryResponse['recentLogs'][0]) => ({
            id: log.id,
            project: log.project.name,
            date: log.logDate,
            hours: log.totalHours,
            entriesCount: log.entriesCount,
            verified: false // Set default value since API doesn't provide this
          }));
          setTimeLogs(rows);
        }
      } catch (error) {
        console.error('Error fetching time logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Keep existing global listener for backward compatibility (if other code dispatches 'openDayEnd')
  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent
      setActiveRow(custom.detail as TimeLogEntry)
      setOpenDayEnd(true)
    }

    window.addEventListener('openDayEnd', handler as EventListener)
    return () => window.removeEventListener('openDayEnd', handler as EventListener)
  }, [])

  const handleClose = () => {
    setOpenDayEnd(false)
    setActiveRow(null)
  }

  const handleSave = (payload: any) => {
    // for now just log; caller can extend to call API
    console.log('Saved day end logs:', payload)
  toast.success('Logs submitted successfully')
  handleClose()
  }

  // New: open modal to add a fresh day-end log
  const handleAddDayEnd = () => {
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    setActiveRow({
      id: '',
      project: '',
      date: today,
      hours: 0,
      entriesCount: 0,
      verified: false
    })
    setOpenDayEnd(true)
  }

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Time Logs Summary</h1>
          <p className="text-gray-600">Track and manage your project time entries</p>
        </div>

        {/* NEW: Add Day End Logs button */}
            <div>
              <Button onClick={handleAddDayEnd} className="bg-black text-white hover:bg-gray-900" variant="default">
                Add Day End Logs
              </Button>
            </div>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <TableComponent
            data={timeLogs}
            columns={columns}
            searchKeys={['project', 'date']}
            shortSearch={true}
          />

          {openDayEnd && activeRow ? (
            <div className="fixed inset-0 z-60 flex items-center justify-center">
              <div className="absolute inset-0 bg-black opacity-40" onClick={handleClose} />
              <div className="relative bg-white rounded-md shadow-lg w-full max-w-3xl p-6 z-70">
                <SingleDayForm
                  projectName={activeRow.project}
                  date={activeRow.date}
                  projectId={activeRow.id}
                  next={handleSave}
                  onCancel={handleClose}
                />
              </div>
            </div>
          ) : null}
          
        </div>
      </div>
    </div>
  )
}

export default HomeComponent