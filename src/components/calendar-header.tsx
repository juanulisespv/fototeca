
"use client"

import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from './ui/button';

type View = 'month' | 'week';

type CalendarHeaderProps = {
  currentDate: Date;
  view: View;
  setView: (view: View) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onNewPost: () => void;
};

export default function CalendarHeader({ currentDate, view, setView, onPrev, onNext, onToday, onNewPost }: CalendarHeaderProps) {
  
  const getHeaderText = () => {
    if (view === 'month') return format(currentDate, 'MMMM yyyy');
    if (view === 'week') {
      const start = format(currentDate, 'MMM d');
      const end = format(new Date(currentDate).setDate(currentDate.getDate() + 6), 'MMM d, yyyy');
      return `${start} - ${end}`;
    }
    return format(currentDate, 'MMMM d, yyyy');
  };

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={onPrev}><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" onClick={onNext}><ChevronRight className="h-4 w-4" /></Button>
        </div>
        <Button variant="outline" onClick={onToday}>Today</Button>
      </div>

      <h2 className="text-xl font-semibold">{getHeaderText()}</h2>
      
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onNewPost}>
            <Plus className="mr-2 h-4 w-4" />
            New Post
        </Button>
        <div className="flex items-center gap-2">
            <Button variant={view === 'month' ? 'default' : 'outline'} onClick={() => setView('month')}>Month</Button>
            <Button variant={view === 'week' ? 'default' : 'outline'} onClick={() => setView('week')}>Week</Button>
        </div>
      </div>
    </div>
  );
}
