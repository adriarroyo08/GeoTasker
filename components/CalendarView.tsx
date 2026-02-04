import React, { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, Circle } from 'lucide-react';
import { Task } from '../types';

interface CalendarViewProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onToggleTask }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  // Filter tasks for the selected date
  const tasksForSelectedDate = tasks.filter(task => {
    // If task has a specific due date, use it
    if (task.dueDate) {
      return isSameDay(new Date(task.dueDate), selectedDate);
    }
    // Fallback: use createdAt just to show something (optional, maybe we only want due dates)
    // For this initial implementation, let's assume we want to visualize tasks created on that day OR due that day.
    // However, the interface says dueDate is optional. If it's missing, maybe it's "anytime".
    // Let's rely on createdAt if dueDate is missing for now to give context.
    return isSameDay(new Date(task.createdAt), selectedDate);
  });

  const hasTaskOnDate = (date: Date) => {
    return tasks.some(task => {
        const d = task.dueDate ? new Date(task.dueDate) : new Date(task.createdAt);
        return isSameDay(d, date);
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-600 dark:text-gray-300">
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-lg font-bold text-gray-800 dark:text-white capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </h2>
        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-600 dark:text-gray-300">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
            {/* Week Days Header */}
            <div className="grid grid-cols-7 mb-2">
                {weekDays.map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-400 dark:text-gray-500 py-1">
                    {day}
                </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-6">
                {calendarDays.map((day, idx) => {
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isSelected = isSameDay(day, selectedDate);
                const isTodayDate = isToday(day);
                const hasTask = hasTaskOnDate(day);

                return (
                    <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`
                        aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all duration-200
                        ${!isCurrentMonth ? 'text-gray-300 dark:text-gray-700 bg-transparent' : 'bg-white dark:bg-gray-800'}
                        ${isSelected ? 'ring-2 ring-blue-500 shadow-md z-10' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}
                        ${isTodayDate && !isSelected ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold' : ''}
                    `}
                    >
                    <span className={`text-sm ${isSelected ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                        {format(day, 'd')}
                    </span>
                    {hasTask && (
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1"></div>
                    )}
                    </button>
                );
                })}
            </div>

            {/* Selected Date Tasks */}
            <div className="mt-4">
                <h3 className="text-md font-semibold text-gray-800 dark:text-white mb-3 capitalize flex items-center gap-2">
                    <CalendarIcon size={18} className="text-blue-500" />
                    {format(selectedDate, 'EEEE, d MMMM', { locale: es })}
                </h3>

                <div className="space-y-3">
                    {tasksForSelectedDate.length === 0 ? (
                        <p className="text-sm text-gray-400 dark:text-gray-500 italic text-center py-4 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
                            No hay tareas para este día.
                        </p>
                    ) : (
                        tasksForSelectedDate.map(task => (
                            <div
                                key={task.id}
                                className={`
                                    p-3 rounded-lg border flex items-center gap-3 bg-white dark:bg-gray-800 transition-colors
                                    ${task.isCompleted
                                        ? 'border-gray-100 dark:border-gray-700 opacity-60'
                                        : 'border-gray-200 dark:border-gray-700 shadow-sm'}
                                `}
                            >
                                <button
                                    onClick={() => onToggleTask(task.id)}
                                    className={`
                                        flex-shrink-0 transition-colors
                                        ${task.isCompleted ? 'text-green-500' : 'text-gray-300 dark:text-gray-600 hover:text-blue-500'}
                                    `}
                                >
                                    {task.isCompleted ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                                </button>
                                <div className="flex-1 min-w-0">
                                    <h4 className={`text-sm font-medium truncate ${task.isCompleted ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>
                                        {task.title}
                                    </h4>
                                    {task.description && (
                                        <p className="text-xs text-gray-400 truncate">{task.description}</p>
                                    )}
                                </div>
                                {task.dueDate && (
                                    <div className="text-xs text-blue-500 font-medium bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                                        {format(new Date(task.dueDate), 'HH:mm')}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
