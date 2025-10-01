import { useEffect, useRef, useState } from 'react'
import {
  Calendar,
  CalendarPrevTrigger,
  CalendarNextTrigger,
  CalendarTodayTrigger,
  CalendarCurrentDate,
  CalendarMonthView,
  type CalendarEvent,
} from '../CalanderComponent/Calander'
import { ChevronLeft, ChevronRight, Check, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { getMyProjects } from '@/apis/services'
import { cn } from '@/lib/utils'

// Sample events data (kept here with the full-page wrapper)
const sampleEvents: CalendarEvent[] = [
  {
    id: '1',
    start: new Date(2024, 8, 8, 12, 0),
    end: new Date(2024, 8, 8, 13, 0),
    title: 'event A',
    color: 'pink'
  },
  {
    id: '2',
    start: new Date(2024, 8, 8, 13, 30),
    end: new Date(2024, 8, 8, 14, 30),
    title: 'event B',
    color: 'blue'
  },
  {
    id: '3',
    start: new Date(2024, 8, 15, 10, 0),
    end: new Date(2024, 8, 15, 11, 30),
    title: 'Meeting',
    color: 'green'
  },
  {
    id: '4',
    start: new Date(2024, 8, 22, 14, 0),
    end: new Date(2024, 8, 22, 15, 0),
    title: 'Workshop',
    color: 'purple'
  }
]

const FullPageCalendar = () => {
  const handleEventClick = (event: CalendarEvent) => {
    console.log('Event clicked:', event)
  }

  const handleViewChange = (view: string) => {
    console.log('View changed to:', view)
  }

  // Projects dropdown state (mirrors SingleDayForm behaviour)
  type Option = { label: string; value: string }
  const [projectOptions, setProjectOptions] = useState<Option[]>([])
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [openProject, setOpenProject] = useState(false)
  const [commandKey, setCommandKey] = useState(0)
  const [selectedProject, setSelectedProject] = useState<Option | null>(null)
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    const fetchProjects = async () => {
      try {
        setLoadingProjects(true)
        const res = await getMyProjects()
        const payload = res?.data ?? []

        if (Array.isArray(payload) && payload.length > 0) {
          const opts = payload.map((p: any) => ({
            label: p.name || p.projectName || p.title || `Project ${p.id || p._id}`,
            value: p.id || p._id || p.projectId,
          }))
          setProjectOptions(opts)
        } else {
          setProjectOptions([])
        }
      } catch (err) {
        setProjectOptions([])
      } finally {
        setLoadingProjects(false)
      }
    }

    fetchProjects()
  }, [])

  useEffect(() => {
    setCommandKey((k) => k + 1)
  }, [projectOptions.length])

  return (
    <div className="h-screen w-full bg-white text-black flex flex-col">
      <Calendar
        defaultDate={new Date(2024, 8, 1)}
        events={sampleEvents}
        view="month"
        enableHotkeys={true}
        onEventClick={handleEventClick}
        onChangeView={handleViewChange}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-1">
            {/* Project dropdown (replaces 'Month' label) */}
            <Popover open={openProject} onOpenChange={setOpenProject}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  aria-expanded={openProject}
                  className="justify-between h-8 md:h-9"
                  disabled={loadingProjects}
                >
                  {selectedProject ? selectedProject.label : loadingProjects ? 'Loading projects...' : projectOptions.length > 0 ? 'Select Project' : 'No projects'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-72 z-[10000]">
                <Command key={`cmd-project-${commandKey}`}>
                  <CommandInput placeholder="Search project..." />
                  <CommandList>
                    <CommandEmpty>{loadingProjects ? 'Loading projects...' : 'No projects found.'}</CommandEmpty>
                    <CommandGroup>
                      {projectOptions.map((option) => (
                        <CommandItem
                          key={option.value}
                          value={option.label}
                          onSelect={(selectedLabel) => {
                            const selected = projectOptions.find((p) => p.label === selectedLabel)
                            if (selected) setSelectedProject(selected)
                            setOpenProject(false)
                          }}
                        >
                          <Check className={cn('mr-2 h-4 w-4', selectedProject?.value === option.value ? 'opacity-100' : 'opacity-0')} />
                          {option.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center space-x-4">
            <CalendarPrevTrigger>
              <ChevronLeft className="h-4 w-4" />
            </CalendarPrevTrigger>

            <CalendarTodayTrigger>Today</CalendarTodayTrigger>

            <CalendarNextTrigger>
              <ChevronRight className="h-4 w-4" />
            </CalendarNextTrigger>
          </div>

          <div className="text-lg font-semibold">
            <CalendarCurrentDate />
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <CalendarMonthView />
        </div>

        <div className="px-6 py-2 text-xs text-gray-500 border-t border-gray-200">
          Shortcuts: T (Today) | ←/→ (Navigate)
        </div>
      </Calendar>
    </div>
  )
}

export default FullPageCalendar
