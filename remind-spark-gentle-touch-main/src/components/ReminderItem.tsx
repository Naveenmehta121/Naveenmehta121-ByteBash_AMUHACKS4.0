import { useState } from 'react';
import { format } from 'date-fns';
import { Bell, Check, Clock, Calendar, Trash2, Edit2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { speak } from '@/services/speechService';

export interface Reminder {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  priority: 'low' | 'medium' | 'high';
  isCompleted: boolean;
}

interface ReminderItemProps {
  reminder: Reminder;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (reminder: Reminder) => void;
}

const ReminderItem = ({ reminder, onComplete, onDelete, onEdit }: ReminderItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleComplete = () => {
    onComplete(reminder.id);
    toast.success('Reminder completed!');
    speak('Reminder marked as complete');
  };

  const handleDelete = () => {
    onDelete(reminder.id);
    toast.info('Reminder deleted');
    speak('Reminder deleted');
  };

  const handleEdit = () => {
    onEdit(reminder);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500 hover:bg-red-600';
      case 'medium':
        return 'bg-amber-500 hover:bg-amber-600';
      case 'low':
        return 'bg-green-500 hover:bg-green-600';
      default:
        return 'bg-slate-500 hover:bg-slate-600';
    }
  };

  const getFormattedDate = () => {
    try {
      const [year, month, day] = reminder.date.split('-').map(Number);
      return format(new Date(year, month - 1, day), 'MMMM d, yyyy');
    } catch (e) {
      return reminder.date;
    }
  };

  return (
    <Card className={`mb-4 transition-all duration-300 ${
      reminder.isCompleted ? 'opacity-60' : 'shadow-md hover:shadow-lg'
    } ${isExpanded ? 'scale-105' : 'scale-100'}`}>
      <CardContent className="p-0">
        <div className="flex flex-col">
          <div 
            className={`p-4 rounded-t-lg flex justify-between items-center cursor-pointer ${
              getPriorityColor(reminder.priority).replace('hover:bg-', 'hover:bg-opacity-90 bg-')
            } text-white`}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center gap-2">
              <Bell size={20} />
              <span className="font-semibold text-lg">{reminder.title}</span>
            </div>
            <Badge variant="outline" className="text-white border-white">
              {reminder.priority.charAt(0).toUpperCase() + reminder.priority.slice(1)}
            </Badge>
          </div>
          
          <div className={`p-4 transition-all duration-300 ${isExpanded ? 'max-h-96' : 'max-h-24 overflow-hidden'}`}>
            <div className="text-gray-600 dark:text-gray-300 mb-3">{reminder.description}</div>
            
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                <Calendar size={16} />
                <span>{getFormattedDate()}</span>
              </div>
              
              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                <Clock size={16} />
                <span>{reminder.time}</span>
              </div>
              
              <div className="flex items-center gap-1 text-sm">
                <AlertCircle size={16} className={
                  reminder.priority === 'high' ? 'text-red-500' : 
                  reminder.priority === 'medium' ? 'text-amber-500' : 'text-green-500'
                } />
                <span className={
                  reminder.priority === 'high' ? 'text-red-500' : 
                  reminder.priority === 'medium' ? 'text-amber-500' : 'text-green-500'
                }>
                  {reminder.priority.charAt(0).toUpperCase() + reminder.priority.slice(1)} Priority
                </span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant={reminder.isCompleted ? "outline" : "default"}
                size="sm"
                className={reminder.isCompleted ? "border-green-500 text-green-500" : ""}
                onClick={handleComplete}
              >
                <Check size={16} className="mr-1" />
                {reminder.isCompleted ? 'Completed' : 'Mark Complete'}
              </Button>
              
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Edit2 size={16} className="mr-1" />
                Edit
              </Button>
              
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 size={16} className="mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReminderItem;
