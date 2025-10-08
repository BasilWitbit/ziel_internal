import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import { PlusIcon, Check, ChevronsUpDown, CalendarIcon } from 'lucide-react'
import React, { useEffect, useRef, useState, type FC } from 'react'
import { getMyProjects, postDayEndLogs, myPendingLogs, getValidDateRange } from '@/apis/services'
//import type { LogsPayload } from './MultiStepControllerLogs'
import EntriesSummaryModal from './EntriesSummaryModal'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

type EntryTypes = 'meeting' | 'work' | 'break'

export type DayEndLogEntry = {
  type: EntryTypes
  featureTitle: string
  timeTaken: number
  taskDescription: string
}
export type LogsPayload = {
  projectName: string;
  projectId: string;
  date: string;
  logs: DayEndLogEntry[];

}
const INITIAL_DAY_END_STATE: DayEndLogEntry = {
  type: 'work',
  featureTitle: '',
  taskDescription: '',
  timeTaken: 0
}

const taskTypeOptions: Option<EntryTypes>[] = [
  { label: 'Work', value: 'work' },
  { label: 'Meeting', value: 'meeting' },
  { label: 'Break', value: 'break' }
]

const timeOptions = [
  { label: '0.25h', value: 0.25 },
  { label: '0.5h', value: 0.5 },
  { label: '0.75h', value: 0.75 },
  { label: '1h', value: 1 },
  { label: '2h', value: 2 },
  { label: '4h', value: 4 },
  { label: '6h', value: 6 },
  { label: '8h', value: 8 },
]

type IProps = {
  projectName: string
  date?: string
  next: (payload: LogsPayload) => void
  projectId: string
  initialLogs?: DayEndLogEntry[]
  onCancel?: () => void
  projects?: Option<string>[]
  onProjectChange?: (projectId: string, projectName: string) => void
  onDateChange?: (date: string) => void
}

interface Option<T = string> {
  label: string
  value: T
}

const SingleDayForm: FC<IProps> = ({
  projectName,
  date: initialDate,
  next,
  projectId,
  initialLogs = [],
  onCancel,
  projects = [],
  onProjectChange,
  onDateChange,
}) => {
  const [dayEndValues, setDayEndValues] = useState<DayEndLogEntry>(INITIAL_DAY_END_STATE)
  const [logs, setLogs] = useState<DayEndLogEntry[]>(initialLogs)
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedTimeButton, setSelectedTimeButton] = useState<number | null>(null)
  const [showSummaryModal, setShowSummaryModal] = useState(false)
  const [openProject, setOpenProject] = useState(false)
  const [openTaskType, setOpenTaskType] = useState(false)
  const [openDatePicker, setOpenDatePicker] = useState(false)
  const [commandKey, setCommandKey] = useState(0)
  const [taskTypeCommandKey, setTaskTypeCommandKey] = useState(0)
  const [projectOptions, setProjectOptions] = useState<Option<string>[]>(projects)
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [pendingLogDates, setPendingLogDates] = useState<string[]>([])
  const [loadingPendingLogs, setLoadingPendingLogs] = useState(false)
  const [minDate, setMinDate] = useState<Date | undefined>(undefined)
  const [loadingValidDateRange, setLoadingValidDateRange] = useState(false)
  const fetchedRef = useRef(false)

  // Local state for project selection if parent doesn't provide callback
  const [localProjectId, setLocalProjectId] = useState(projectId)
  const [localProjectName, setLocalProjectName] = useState(projectName)

  // Local state for date selection
  const [localDate, setLocalDate] = useState<string>(
    initialDate || new Date().toISOString().split('T')[0]
  )
  // Helper to parse a YYYY-MM-DD string into a local Date at midnight (avoids timezone shifts)
  const parseISODateToLocal = (iso?: string) => {
    if (!iso) return new Date()
    const parts = iso.split('-')
    if (parts.length !== 3) return new Date(iso)
    const [y, m, d] = parts
    return new Date(Number(y), Number(m) - 1, Number(d))
  }

  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | undefined>(
    initialDate ? parseISODateToLocal(initialDate) : new Date()
  )

  // Use local state if parent doesn't manage project/date selection
  const currentProjectId = projectId || localProjectId
  const currentProjectName = projectName || localProjectName
  const currentDate = localDate // Always use local date state

  // Check if a project is selected to determine if other fields should be shown
  const isProjectSelected = Boolean(currentProjectId)

  // Combined loading state for form overlay
  const isLoadingProjectData = loadingPendingLogs || loadingValidDateRange

  // Date formatting helper functions
  const formatDateForInput = (date: Date): string => {
    // Return YYYY-MM-DD using local date components to avoid timezone shifts
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  const formatDateForDisplay = (dateStr: string): string => {
    const date = parseISODateToLocal(dateStr)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Fetch valid date range for the selected project
  const fetchValidDateRangeForProject = async (projectId: string) => {
    if (!projectId) {
      setMinDate(undefined)
      setLoadingValidDateRange(false)
      return
    }

    try {
      setLoadingValidDateRange(true)
      const response = await getValidDateRange(projectId)

      if (!response.error && response.data) {
        setMinDate(new Date(response.data.minDate))
      } else {
        console.error('Failed to fetch valid date range:', response.message)
        setMinDate(undefined)
      }
    } catch (error) {
      console.error('Error fetching valid date range:', error)
      setMinDate(undefined)
    } finally {
      setLoadingValidDateRange(false)
    }
  }

  // Fetch pending logs for the selected project
  const fetchPendingLogsForProject = async (projectId: string) => {
    if (!projectId) {
      setPendingLogDates([])
      return
    }

    try {
      setLoadingPendingLogs(true)
      const response = await myPendingLogs()

      if (!response.error && response.data) {
        // Find the pending dates for the current project
        const projectPendingLogs = response.data.projectsPendingLogs.find(
          (project) => project.projectId === projectId
        )

        if (projectPendingLogs) {
          setPendingLogDates(projectPendingLogs.pendingDates)
        } else {
          setPendingLogDates([])
        }
      } else {
        console.error('Failed to fetch pending logs:', response.message)
        setPendingLogDates([])
      }
    } catch (error) {
      console.error('Error fetching pending logs:', error)
      setPendingLogDates([])
    } finally {
      setLoadingPendingLogs(false)
    }
  }



  // Handle date changes - FIXED VERSION
  const handleCalendarDateSelect = (date: Date | undefined) => {
    if (date) {
      // Create a new date object to avoid timezone issues
      const selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const formattedDate = formatDateForInput(selectedDate)

      console.log('Selected date:', selectedDate, 'Formatted:', formattedDate) // Debug log

      // Update both local states
      setLocalDate(formattedDate)
      setSelectedCalendarDate(selectedDate)

      // Call parent callback if provided
      if (onDateChange) {
        onDateChange(formattedDate)
      }

      // Close the date picker
      setOpenDatePicker(false)
    }
  }

  const handleTimeSelection = (timeValue: number) => {
    setShowError(false)
    setErrorMessage('')
    setSelectedTimeButton(timeValue)
    setDayEndValues((prevState) => ({ ...prevState, timeTaken: timeValue }))
  }

  const handleManualTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowError(false)
    setErrorMessage('')
    setSelectedTimeButton(null)
    setDayEndValues((prevState) => ({ ...prevState, timeTaken: +e.target.value }))
  }

  const handleDeleteEntry = (indexToDelete: number) => {
    const filteredLogs = logs.filter((_, idx) => idx !== indexToDelete)
    setLogs(filteredLogs)
  }

  const handleSaveAndNext = async (): Promise<boolean> => {
    if (!currentProjectId || logs.length === 0) {
      setShowError(true)
      setErrorMessage('Please select a project and add at least one entry')
      return false
    }

    try {
      setSubmitting(true)
      setShowError(false)

      // Transform logs to match API payload structure
      const entries = logs.map((log) => ({
        description: log.taskDescription,
        duration: log.timeTaken,
        type: log.type
      }))

      const payload = {
        date: currentDate,
        projectId: currentProjectId,
        entries
      }

      const response = await postDayEndLogs(payload)

      if (response.error) {
        setShowError(true)
        setErrorMessage(response.message || 'Failed to submit logs')
        return false
      }

      // Refresh pending logs after successful submission
      await fetchPendingLogsForProject(currentProjectId)

      // Call the parent's next function to proceed
      next({
        projectName: currentProjectName,
        date: currentDate,
        logs,
        projectId: currentProjectId
      })

      // Reset form state
      setLogs([])
      setSelectedTimeButton(null)
      setDayEndValues(INITIAL_DAY_END_STATE)

      return true
    } catch (err) {
      console.error('Error submitting logs:', err)
      setShowError(true)
      setErrorMessage('An unexpected error occurred while submitting logs')
      return false
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    // If parent provided projects, use them; otherwise fetch from API
    if (projects.length > 0) {
      setProjectOptions(projects)
      return
    }

    if (fetchedRef.current) {
      return
    }
    fetchedRef.current = true

    const fetchProjects = async () => {
      try {
        setLoadingProjects(true)
        const res = await getMyProjects()
        const payload = res?.data ?? []

        if (Array.isArray(payload) && payload.length > 0) {
          const opts = payload.map((p: any) => {
            const mapped = {
              label: p.name || p.projectName || p.title || `Project ${p.id || p._id}`,
              value: p.id || p._id || p.projectId,
            }
            return mapped
          })

          setProjectOptions(opts)
        } else {
          setProjectOptions([])
        }
      } catch (err) {
        console.error('Error fetching projects:', err)
        setProjectOptions([])
      } finally {
        setLoadingProjects(false)
      }
    }

    fetchProjects()
  }, [projects])

  useEffect(() => {
    setCommandKey((k) => k + 1)
  }, [projectOptions.length])

  useEffect(() => {
    if (openProject) {
      setCommandKey((k) => k + 1)
    }
  }, [openProject])

  useEffect(() => {
    if (openTaskType) {
      setTaskTypeCommandKey((k) => k + 1)
    }
  }, [openTaskType])

  // Sync local date with parent date changes
  useEffect(() => {
    if (initialDate && initialDate !== localDate) {
      setLocalDate(initialDate)
      setSelectedCalendarDate(parseISODateToLocal(initialDate))
    }
  }, [initialDate])

  // Fetch pending logs and valid date range when project changes
  useEffect(() => {
    if (currentProjectId) {
      fetchPendingLogsForProject(currentProjectId)
      fetchValidDateRangeForProject(currentProjectId)
    } else {
      setPendingLogDates([])
      setMinDate(undefined)
      setLoadingValidDateRange(false)
    }
  }, [currentProjectId])

  return (
    <>
      {showSummaryModal ? (
        <EntriesSummaryModal
          isOpen={showSummaryModal}
          onClose={() => setShowSummaryModal(false)}
          logs={logs}
          projectName={currentProjectName}
          date={currentDate}
          onDeleteEntry={handleDeleteEntry}
          onSaveAndNext={handleSaveAndNext}
        />
      ) : (
        <div className="relative flex flex-col gap-3 md:gap-4 p-3 md:p-4 bg-white">
          {/* Loading overlay for project data */}
          {isLoadingProjectData && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-lg shadow-lg border">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-700">
                  {loadingValidDateRange ? "Loading available dates..." : "Loading pending logs..."}
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 md:gap-3">
            <h1 className="text-lg md:text-xl font-bold text-gray-800">Log Time For All Your Projects</h1>

            {/* Project Selection - Always visible */}
            <div className="w-full">
              <label className="text-sm font-medium text-gray-700">Project *</label>
              <Popover
                open={openProject}
                onOpenChange={setOpenProject}
              >
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={openProject}
                    className="w-full justify-between h-8 md:h-9"
                    disabled={loadingProjects}
                  >
                    {currentProjectId
                      ? projectOptions.find((p) => p.value === currentProjectId)?.label || 'Select Project'
                      : loadingProjects
                        ? 'Loading projects...'
                        : projectOptions.length > 0
                          ? 'Select Project'
                          : 'No projects available'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-80 z-[10000]">
                  <Command key={`cmd-project-${commandKey}`}>
                    <CommandInput placeholder="Search project..." />
                    <CommandList>
                      <CommandEmpty>
                        {loadingProjects ? 'Loading projects...' : 'No projects found.'}
                      </CommandEmpty>
                      <CommandGroup>
                        {projectOptions.map((option) => (
                          <CommandItem
                            key={option.value}
                            value={option.label}
                            onSelect={(selectedLabel) => {
                              const selectedOption = projectOptions.find((p) => p.label === selectedLabel)
                              if (selectedOption) {
                                if (onProjectChange) {
                                  onProjectChange(selectedOption.value, selectedOption.label)
                                } else {
                                  setLocalProjectId(selectedOption.value)
                                  setLocalProjectName(selectedOption.label)
                                }
                              }
                              setOpenProject(false)
                            }}
                          >
                            <Check
                              className={cn('mr-2 h-4 w-4', currentProjectId === option.value ? 'opacity-100' : 'opacity-0')}
                            />
                            {option.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Show message when no project is selected */}
            {!isProjectSelected && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-700">
                  Please select a project to continue with time logging.
                </p>
              </div>
            )}

            {/* All other fields - Only visible when project is selected */}
            {isProjectSelected && (
              <>
                {/* Date Selection */}
                <div className="w-full">
                  <label className="text-sm font-medium text-gray-700">Date *</label>
                  <Popover open={openDatePicker} onOpenChange={setOpenDatePicker}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between h-8 md:h-9"
                        type="button"
                      >
                        {currentDate ? formatDateForDisplay(currentDate) : "Select Date"}
                        <CalendarIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[10000]" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedCalendarDate}
                        onSelect={handleCalendarDateSelect}
                        className="rounded-md border shadow-sm"
                        captionLayout="dropdown"
                        initialFocus
                        // usman leghari bug fix #01
                        disabled={(date) => {
                          // Disable future dates
                          const today = new Date()
                          if (date > today) return true

                          // Disable weekends (Saturday = 6, Sunday = 0)
                          // const dayOfWeek = date.getDay()
                          // if (dayOfWeek === 0 || dayOfWeek === 6) return true

                          // Disable dates before user was added to project (date-only comparison)
                          if (minDate) {
                            const minDateOnly = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())
                            const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
                            if (checkDate < minDateOnly) return true
                          }
                          return false
                        }}
                        modifiers={{
                          pending: (date) => {
                            const dateStr = formatDateForInput(date)
                            return pendingLogDates.includes(dateStr)
                          }
                        }}
                        components={{
                          DayButton: ({ day, modifiers, ...props }) => {
                            const dateStr = formatDateForInput(day.date)
                            const hasPendingLog = pendingLogDates.includes(dateStr)

                            return (
                              <Button
                                variant="ghost"
                                size="icon"
                                data-day={day.date.toLocaleDateString()}
                                data-selected-single={
                                  modifiers.selected &&
                                  !modifiers.range_start &&
                                  !modifiers.range_end &&
                                  !modifiers.range_middle
                                }
                                className={cn(
                                  "data-[selected-single=true]:bg-neutral-900 data-[selected-single=true]:text-neutral-50 relative flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-normal",
                                  props.className
                                )}
                                {...props}
                              >
                                <span>{day.date.getDate()}</span>
                                {hasPendingLog && (
                                  <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                                )}
                              </Button>
                            )
                          }
                        }}
                      />
                      {pendingLogDates.length > 0 && (
                        <div className="p-3 border-t bg-gray-50">
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                            <span>Dates with missing logs</span>
                          </div>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Duration Section */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">Duration *</label>
                  <div className="w-full md:w-1/4">
                    <Input
                      placeholder="0.00"
                      type="number"
                      step="0.25"
                      min="0.1"
                      max="24"
                      value={dayEndValues.timeTaken}
                      onChange={handleManualTimeChange}
                      className="text-center h-8 md:h-9"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {timeOptions.map((option) => (
                      <Button
                        key={option.value}
                        variant={selectedTimeButton === option.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleTimeSelection(option.value)}
                        className={`min-w-[50px] h-7 text-xs px-2 ${selectedTimeButton === option.value
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'hover:bg-gray-100'
                          }`}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Time Log Details Section */}
                <div className="flex flex-col gap-2.5">
                  <label className="text-sm font-medium text-gray-700">Time Log Detail *</label>
                  <div className="flex flex-col md:flex-row gap-2.5">
                    <div className="flex-1">
                      <Input
                        placeholder="Feature Title (Optional)"
                        value={dayEndValues.featureTitle}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setShowError(false)
                          setErrorMessage('')
                          if (dayEndValues.featureTitle.length > 50) return
                          setDayEndValues((prevState) => ({
                            ...prevState,
                            featureTitle: e.target.value,
                          }))
                        }}
                        className="h-8 md:h-9"
                      />
                    </div>
                    <div className="flex-1">
                      <Popover
                        open={openTaskType}
                        onOpenChange={setOpenTaskType}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            role="combobox"
                            aria-expanded={openTaskType}
                            className="max-w-[200px] justify-between h-8 md:h-9"
                          >
                            {dayEndValues.type
                              ? taskTypeOptions.find((option) => option.value === dayEndValues.type)?.label || 'Select Type of Entry'
                              : 'Select Type of Entry'}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-[200px] z-[10000]">
                          <Command key={`cmd-task-type-${taskTypeCommandKey}`}>
                            <CommandInput placeholder="Search type..." />
                            <CommandList>
                              <CommandEmpty>No entry types found.</CommandEmpty>
                              <CommandGroup>
                                {taskTypeOptions.map((option) => (
                                  <CommandItem
                                    key={option.value}
                                    value={option.label}
                                    onSelect={(selectedLabel) => {
                                      const selectedType = taskTypeOptions.find((opt) => opt.label === selectedLabel)
                                      if (selectedType) {
                                        setDayEndValues((prevState) => ({
                                          ...prevState,
                                          type: selectedType.value as EntryTypes,
                                        }))
                                      }
                                      setOpenTaskType(false)
                                    }}
                                  >
                                    <Check
                                      className={cn('mr-2 h-4 w-4', dayEndValues.type === option.value ? 'opacity-100' : 'opacity-0')}
                                    />
                                    {option.label}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <div className="w-full">
                    <textarea
                      className="w-full min-h-[80px] md:min-h-[90px] p-2.5 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                      placeholder="Enter task description here..."
                      value={dayEndValues.taskDescription}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                        setShowError(false)
                        setErrorMessage('')
                        setDayEndValues((prevState) => ({
                          ...prevState,
                          taskDescription: e.target.value,
                        }))
                      }}
                    />
                  </div>
                  <div className="flex justify-start">
                    <Button
                      onClick={() => {
                        let errors = false
                        let errorMsg = ''
                        if (!dayEndValues.taskDescription.trim()) {
                          errors = true
                          errorMsg = 'Task description is required'
                        } else if (dayEndValues.timeTaken < 0.1) {
                          errors = true
                          errorMsg = 'Time taken must be at least 0.1 hours'
                        } else if (dayEndValues.timeTaken > 24) {
                          errors = true
                          errorMsg = 'Time taken for a task cannot be more than 24 hours'
                        }
                        if (errors) {
                          setErrorMessage(errorMsg)
                          return setShowError(true)
                        }
                        setShowError(false)
                        setLogs((prevState) => [...prevState, dayEndValues])
                        setDayEndValues(INITIAL_DAY_END_STATE)
                        setSelectedTimeButton(null)
                      }}
                      disabled={showError}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 h-8 md:h-9 text-sm"
                    >
                      <PlusIcon className="w-3 h-3 mr-1.5" />
                      Add Entry
                    </Button>
                  </div>
                  {showError ? <p className="text-red-400 text-sm">{errorMessage}</p> : null}
                </div>
              </>
            )}
          </div>

          {/* Action Buttons - Only visible when project is selected */}
          {isProjectSelected && (
            <div className="flex flex-col md:flex-row justify-between items-center gap-2 pt-3">
              <div className="flex flex-col md:flex-row gap-1.5 w-full md:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="px-3 w-full md:w-auto h-8 text-sm"
                  onClick={onCancel}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
              <Button
                className="bg-black text-white hover:bg-gray-900 px-3 md:px-4 w-full md:w-auto h-8 md:h-9 text-sm"
                onClick={() => setShowSummaryModal(true)}
                disabled={logs.length === 0 || submitting}
              >
                {submitting ? 'Submitting...' : `Submit and Checkout${logs.length > 0 ? ` (${logs.length})` : ''}`}
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default SingleDayForm