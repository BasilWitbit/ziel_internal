import React, { 
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
//import { ChevronLeft, ChevronRight } from 'lucide-react';

// Button component (simplified for demo)
const Button = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'icon';
}>(({ className, variant = 'default', size = 'default', ...props }, ref) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50';
  const variantClasses = {
    default: 'bg-black text-white hover:bg-gray-800',
    outline: 'border border-gray-300 bg-transparent hover:bg-gray-100',
    ghost: 'hover:bg-gray-100'
  };
  const sizeClasses = {
    default: 'h-10 px-4 py-2',
    sm: 'h-8 px-3 text-sm',
    icon: 'h-10 w-10'
  };
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className || ''}`}
      ref={ref}
      {...props}
    />
  );
});

// Utility function
const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

// Date utility functions (simplified versions)
const format = (date: Date, formatStr: string) => {
  const options: Intl.DateTimeFormatOptions = {};
  if (formatStr === 'MMMM yyyy') {
    options.month = 'long';
    options.year = 'numeric';
  } else if (formatStr === 'dd MMMM yyyy') {
    options.day = '2-digit';
    options.month = 'long';
    options.year = 'numeric';
  } else if (formatStr === 'd') {
    options.day = 'numeric';
  } else if (formatStr === 'E') {
    options.weekday = 'short';
  } else if (formatStr === 'EEEEEE') {
    options.weekday = 'narrow';
  } else if (formatStr === 'HH:mm') {
    options.hour = '2-digit';
    options.minute = '2-digit';
    options.hour12 = false;
  }
  return new Intl.DateTimeFormat('en-US', options).format(date);
};

const addDays = (date: Date, amount: number) => new Date(date.getTime() + amount * 24 * 60 * 60 * 1000);
const addMonths = (date: Date, amount: number) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + amount);
  return result;
};
const addWeeks = (date: Date, amount: number) => addDays(date, amount * 7);
const addYears = (date: Date, amount: number) => {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + amount);
  return result;
};
const subDays = (date: Date, amount: number) => addDays(date, -amount);
const subMonths = (date: Date, amount: number) => addMonths(date, -amount);
const subWeeks = (date: Date, amount: number) => addWeeks(date, -amount);
const subYears = (date: Date, amount: number) => addYears(date, -amount);
const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
const startOfWeek = (date: Date) => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day;
  return new Date(result.setDate(diff));
};
const isSameDay = (date1: Date, date2: Date) => 
  date1.getDate() === date2.getDate() && 
  date1.getMonth() === date2.getMonth() && 
  date1.getFullYear() === date2.getFullYear();
const isSameMonth = (date1: Date, date2: Date) =>
  date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
const isToday = (date: Date) => isSameDay(date, new Date());
{/*const getMonth = (date: Date) => date.getMonth();
const setMonth = (date: Date, month: number) => {
  const result = new Date(date);
  result.setMonth(month);
  return result;
};
*/}
type View = 'day' | 'week' | 'month' | 'year';

export type CalendarEvent = {
  id: string;
  start: Date;
  end: Date;
  title: string;
  color?: 'default' | 'blue' | 'green' | 'pink' | 'purple';
};

type ContextType = {
  view: View;
  setView: (view: View) => void;
  date: Date;
  setDate: (date: Date) => void;
  events: CalendarEvent[];
  setEvents: (events: CalendarEvent[]) => void;
  onChangeView?: (view: View) => void;
  onEventClick?: (event: CalendarEvent) => void;
  enableHotkeys?: boolean;
  today: Date;
};

const Context = createContext<ContextType>({} as ContextType);

const Calendar = ({
  children,
  defaultDate = new Date(),
  enableHotkeys = true,
  view: _defaultMode = 'month',
  onEventClick,
  events: defaultEvents = [],
  onChangeView,
}: {
  children: ReactNode;
  defaultDate?: Date;
  events?: CalendarEvent[];
  view?: View;
  enableHotkeys?: boolean;
  onChangeView?: (view: View) => void;
  onEventClick?: (event: CalendarEvent) => void;
}) => {
  const [view, setView] = useState<View>(_defaultMode);
  const [date, setDate] = useState(defaultDate);
  const [events, setEvents] = useState<CalendarEvent[]>(defaultEvents);

  return (
    <Context.Provider
      value={{
        view,
        setView,
        date,
        setDate,
        events,
        setEvents,
        enableHotkeys,
        onEventClick,
        onChangeView,
        today: new Date(),
      }}
    >
      {children}
    </Context.Provider>
  );
};

const useCalendar = () => useContext(Context);

const CalendarViewTrigger = forwardRef<
  HTMLButtonElement,
  React.HTMLAttributes<HTMLButtonElement> & {
    view: View;
  }
>(({ children, view, ...props }, ref) => {
  const { view: currentView, setView, onChangeView } = useCalendar();

  return (
    <Button
      size="sm"
      variant={currentView === view ? 'default' : 'ghost'}
  ref={ref}
      {...props}
      onClick={() => {
        setView(view);
        onChangeView?.(view);
      }}
    >
      {children}
    </Button>
  );
});

const CalendarCurrentDate = () => {
  const { date, view } = useCalendar();

  return (
    <time dateTime={date.toISOString()} className="tabular-nums">
      {format(date, view === 'day' ? 'dd MMMM yyyy' : 'MMMM yyyy')}
    </time>
  );
};

const CalendarNextTrigger = forwardRef<
  HTMLButtonElement,
  React.HTMLAttributes<HTMLButtonElement>
>(({ children, onClick, ...props }, ref) => {
  const { date, setDate, view } = useCalendar();

  const next = useCallback(() => {
    if (view === 'day') {
      setDate(addDays(date, 1));
    } else if (view === 'week') {
      setDate(addWeeks(date, 1));
    } else if (view === 'month') {
      setDate(addMonths(date, 1));
    } else if (view === 'year') {
      setDate(addYears(date, 1));
    }
  }, [date, view, setDate]);

  return (
    <Button
      size="icon"
      variant="outline"
      ref={ref}
      {...props}
      onClick={(e) => {
        next();
        onClick?.(e);
      }}
    >
      {children}
    </Button>
  );
});

const CalendarPrevTrigger = forwardRef<
  HTMLButtonElement,
  React.HTMLAttributes<HTMLButtonElement>
>(({ children, onClick, ...props }, ref) => {
  const { date, setDate, view } = useCalendar();

  const prev = useCallback(() => {
    if (view === 'day') {
      setDate(subDays(date, 1));
    } else if (view === 'week') {
      setDate(subWeeks(date, 1));
    } else if (view === 'month') {
      setDate(subMonths(date, 1));
    } else if (view === 'year') {
      setDate(subYears(date, 1));
    }
  }, [date, view, setDate]);

  return (
    <Button
      size="icon"
      variant="outline"
      ref={ref}
      {...props}
      onClick={(e) => {
        prev();
        onClick?.(e);
      }}
    >
      {children}
    </Button>
  );
});

const CalendarTodayTrigger = forwardRef<
  HTMLButtonElement,
  React.HTMLAttributes<HTMLButtonElement>
>(({ children, onClick, ...props }, ref) => {
  const { setDate, today } = useCalendar();

  const jumpToToday = useCallback(() => {
    setDate(today);
  }, [today, setDate]);

  return (
    <Button
      variant="outline"
      ref={ref}
      {...props}
      onClick={(e) => {
        jumpToToday();
        onClick?.(e);
      }}
    >
      {children}
    </Button>
  );
});

const getDaysInMonth = (date: Date) => {
  const startOfMonthDate = startOfMonth(date);
  const startOfWeekForMonth = startOfWeek(startOfMonthDate);

  let currentDate = startOfWeekForMonth;
  const calendar = [];

  while (calendar.length < 42) {
    calendar.push(new Date(currentDate));
    currentDate = addDays(currentDate, 1);
  }

  return calendar;
};

const generateWeekdays = () => {
  const daysOfWeek = [];
  for (let i = 0; i < 7; i++) {
    const date = addDays(startOfWeek(new Date()), i);
    daysOfWeek.push(format(date, 'EEEEEE'));
  }
  return daysOfWeek;
};

const CalendarMonthView = () => {
  const { date, view, events } = useCalendar();

  const monthDates = useMemo(() => getDaysInMonth(date), [date]);
  const weekDays = useMemo(() => generateWeekdays(), []);

  if (view !== 'month') return null;

  return (
    <div className="h-full flex flex-col">
      <div className="grid grid-cols-7 gap-px sticky top-0 bg-white border-b border-gray-200">
        {weekDays.map((day, i) => (
          <div
            key={`${day}-${i}`}
            className={cn(
              'mb-2 text-center text-sm text-gray-600 py-2',
              [0, 6].includes(i) ? 'text-gray-400' : ''
            )}
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid overflow-hidden -mt-px flex-1 auto-rows-fr grid-cols-7 gap-px bg-gray-200">
        {monthDates.map((_date) => {
          const currentEvents = events.filter((event) =>
            isSameDay(event.start, _date)
          );

          return (
            <div
              className={cn(
                'bg-white p-2 text-sm text-gray-600 overflow-auto border border-gray-200',
                !isSameMonth(date, _date) ? 'text-gray-300 bg-gray-50' : ''
              )}
              key={_date.toString()}
            >
              <span
                className={cn(
                  'w-6 h-6 flex items-center justify-center rounded-full mb-1',
                  isToday(_date) ? 'bg-black text-white font-bold' : ''
                )}
              >
                {format(_date, 'd')}
              </span>

              {currentEvents.map((event) => {
                const colorClasses = {
                  default: 'bg-gray-500',
                  blue: 'bg-blue-500',
                  green: 'bg-green-500',
                  pink: 'bg-pink-500',
                  purple: 'bg-purple-500'
                };

                return (
                  <div
                    key={event.id}
                    className="px-1 rounded text-xs flex items-center gap-1 mb-1 cursor-pointer hover:opacity-80"
                    onClick={() => useCalendar().onEventClick?.(event)}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${colorClasses[event.color || 'default']}`}
                    />
                    <span className="flex-1 truncate text-black">{event.title}</span>
                    <time className="tabular-nums text-gray-400 text-xs">
                      {format(event.start, 'HH:mm')}
                    </time>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Other view placeholders removed — calendar is month-only in this build.

// Sample events data
// The FullPageCalendar wrapper has been moved to its own file
// Export calendar primitives so external wrappers can compose the full page UI
export {
  Calendar,
  CalendarViewTrigger,
  CalendarPrevTrigger,
  CalendarNextTrigger,
  CalendarTodayTrigger,
  CalendarCurrentDate,
  CalendarMonthView,
};

// Default export for backward compatibility: export the Calendar provider/component
export default Calendar;