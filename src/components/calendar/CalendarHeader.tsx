import React from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { CalendarView } from '@/utils/calendarUtils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CalendarHeaderProps {
  currentDate: Date;
  view: CalendarView;
  onDateChange: (date: Date) => void;
  onViewChange: (view: CalendarView) => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  view,
  onDateChange,
  onViewChange,
}) => {
  const handlePrevious = () => {
    if (view === 'day') {
      onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1));
    } else if (view === 'week') {
      onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7));
    } else {
      onDateChange(subMonths(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (view === 'day') {
      onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1));
    } else if (view === 'week') {
      onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 7));
    } else {
      onDateChange(addMonths(currentDate, 1));
    }
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const getHeaderText = () => {
    if (view === 'day') {
      return format(currentDate, 'EEEE, MMMM d, yyyy');
    } else if (view === 'week') {
      return `Week of ${format(currentDate, 'MMMM d, yyyy')}`;
    } else {
      return format(currentDate, 'MMMM yyyy');
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center py-4 px-2 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center space-x-2 mb-3 sm:mb-0">
        <CalendarIcon className="h-5 w-5 text-calendar-primary dark:text-blue-400" />
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{getHeaderText()}</h1>
      </div>
      
      <div className="flex flex-wrap justify-center items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleToday}
          className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Today
        </Button>
        
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handlePrevious}
            className="dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleNext}
            className="dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <Select
          value={view}
          onValueChange={(value) => onViewChange(value as CalendarView)}
        >
          <SelectTrigger className="w-[120px] dark:border-gray-700 dark:text-gray-300 dark:bg-gray-900">
            <SelectValue placeholder="View" />
          </SelectTrigger>
          <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
            <SelectItem value="day" className="dark:text-gray-300 dark:focus:bg-gray-800">Day</SelectItem>
            <SelectItem value="week" className="dark:text-gray-300 dark:focus:bg-gray-800">Week</SelectItem>
            <SelectItem value="month" className="dark:text-gray-300 dark:focus:bg-gray-800">Month</SelectItem>
            <SelectItem value="agenda" className="dark:text-gray-300 dark:focus:bg-gray-800">Agenda</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default CalendarHeader;
