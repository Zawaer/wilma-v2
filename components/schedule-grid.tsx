"use client";

import { ScheduleEvent } from "@/lib/schedule-types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ScheduleGridProps {
  events: ScheduleEvent[];
  dayStarts: number; // minutes from midnight
  dayEnds: number; // minutes from midnight
  dayCount: number;
}

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export function ScheduleGrid({ events, dayStarts, dayEnds, dayCount }: ScheduleGridProps) {
  // Calculate the total duration in minutes
  const totalMinutes = dayEnds - dayStarts;
  
  // Convert minutes to time string (HH:MM)
  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  // Generate time labels (every hour)
  const generateTimeLabels = () => {
    const labels = [];
    for (let time = dayStarts; time <= dayEnds; time += 60) {
      labels.push(time);
    }
    return labels;
  };

  const timeLabels = generateTimeLabels();

  // Group events by day (X1 position determines the day)
  // X1 ranges: 0-10000 (Mon), 10000-20000 (Tue), 20000-30000 (Wed), etc.
  const getEventDay = (event: ScheduleEvent): number => {
    return Math.floor(event.X1 / 10000);
  };

  // Calculate event position and size
  const getEventStyle = (event: ScheduleEvent) => {
    const day = getEventDay(event);
    
    // Calculate vertical position (top) as percentage
    const topPercent = ((event.Start - dayStarts) / totalMinutes) * 100;
    
    // Calculate height as percentage
    const heightPercent = ((event.End - event.Start) / totalMinutes) * 100;
    
    // Calculate horizontal position within the day column
    const dayWidth = 100 / dayCount;
    const leftPercent = day * dayWidth;
    
    return {
      top: `${topPercent}%`,
      left: `${leftPercent}%`,
      height: `${heightPercent}%`,
      width: `${dayWidth}%`,
    };
  };

  // Extract lesson info from event
  const getLessonInfo = (event: ScheduleEvent) => {
    const courseCode = event.Text?.["0"] || "";
    const courseName = event.LongText?.["0"] || "";
    const teacher = event.Opet?.["0"] || "";
    const room = event.Huoneet?.["0"] || "";
    const startTime = minutesToTime(event.Start);
    const endTime = minutesToTime(event.End);

    return { courseCode, courseName, teacher, room, startTime, endTime };
  };

  return (
    <div className="flex flex-col h-full">
      {/* Weekday headers */}
      <div className="grid grid-cols-[80px_1fr] border-b">
        <div className="p-2"></div>
        <div className="grid" style={{ gridTemplateColumns: `repeat(${dayCount}, 1fr)` }}>
          {WEEKDAYS.slice(0, dayCount).map((day, index) => (
            <div key={index} className="p-2 text-center font-semibold border-l">
              {day}
            </div>
          ))}
        </div>
      </div>

      {/* Schedule grid */}
      <div className="flex-1 grid grid-cols-[80px_1fr] overflow-auto">
        {/* Time labels */}
        <div className="relative border-r">
          {timeLabels.map((time, index) => {
            const topPercent = ((time - dayStarts) / totalMinutes) * 100;
            return (
              <div
                key={index}
                className="absolute right-2 text-xs text-muted-foreground -translate-y-1/2"
                style={{ top: `${topPercent}%` }}
              >
                {minutesToTime(time)}
              </div>
            );
          })}
        </div>

        {/* Grid with events */}
        <div className="relative">
          {/* Day columns */}
          <div className="absolute inset-0 grid z-0" style={{ gridTemplateColumns: `repeat(${dayCount}, 1fr)` }}>
            {Array.from({ length: dayCount }).map((_, index) => (
              <div key={index} className="border-l"></div>
            ))}
          </div>

          {/* Hour lines */}
          {timeLabels.map((time, index) => {
            const topPercent = ((time - dayStarts) / totalMinutes) * 100;
            return (
              <div
                key={index}
                className="absolute left-0 right-0 border-t border-gray-200 z-0"
                style={{ top: `${topPercent}%` }}
              ></div>
            );
          })}

          {/* Events */}
          {events.map((event, index) => {
            const style = getEventStyle(event);
            const info = getLessonInfo(event);
            
            return (
              <Popover key={`${event.Id}-${event.Start}-${event.X1}-${index}`}>
                <PopoverTrigger asChild>
                  <div
                    className="absolute px-2 py-1 bg-primary/10 border border-primary/20 rounded overflow-hidden cursor-pointer hover:bg-primary/20 transition-colors flex flex-col items-center justify-center z-10"
                    style={style}
                  >
                    <div className="text-xs font-semibold truncate w-full text-center">{info.courseCode}</div>
                    <div className="text-xs truncate text-muted-foreground w-full text-center">{info.room}</div>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-64" align="center" side="top">
                  <div className="space-y-2">
                    <div>
                      <div className="font-semibold text-sm">{info.courseCode}</div>
                      <div className="text-sm text-muted-foreground">{info.courseName}</div>
                    </div>
                    <div className="border-t pt-2 space-y-1">
                      {info.teacher && (
                        <div className="text-xs">
                          <span className="font-medium">Teacher:</span> {info.teacher}
                        </div>
                      )}
                      {info.room && (
                        <div className="text-xs">
                          <span className="font-medium">Room:</span> {info.room}
                        </div>
                      )}
                      <div className="text-xs">
                        <span className="font-medium">Time:</span> {info.startTime} - {info.endTime}
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            );
          })}
        </div>
      </div>
    </div>
  );
}
