import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Bell, Calendar, Clock, ArrowLeft, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { speak } from '@/services/speechService';
import { toast } from 'sonner';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { Reminder } from '@/components/ReminderItem';

// Create a mock user for testing if no user is authenticated
const mockUser = { uid: 'test-user-id' };

const AddReminderPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [reminderId, setReminderId] = useState<string | null>(null);
  
  // Get current user or use mock for testing
  const currentUser = auth.currentUser || mockUser;

  // Check if we're editing an existing reminder
  useEffect(() => {
    if (location.state && location.state.reminder) {
      const reminder = location.state.reminder as Reminder;
      setTitle(reminder.title);
      setDescription(reminder.description);
      setDate(reminder.date);
      setTime(reminder.time);
      setPriority(reminder.priority);
      setReminderId(reminder.id);
      setIsEditMode(true);
    } else {
      // Default to today's date for new reminders
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      setDate(`${yyyy}-${mm}-${dd}`);
      
      // Default time to the next hour
      const hours = String(today.getHours() + 1).padStart(2, '0');
      setTime(`${hours}:00`);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !date || !time) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const reminderData = {
        title,
        description,
        date,
        time,
        priority,
        isCompleted: false,
        userId: currentUser.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      if (isEditMode && reminderId) {
        // Update existing reminder
        const reminderRef = doc(db, 'reminders', reminderId);
        await updateDoc(reminderRef, {
          ...reminderData,
          updatedAt: new Date().toISOString()
        });
        toast.success('Reminder updated successfully!');
        speak('Reminder updated successfully');
      } else {
        // Add new reminder
        await addDoc(collection(db, 'reminders'), reminderData);
        toast.success('Reminder added successfully!');
        speak('Reminder added successfully');
      }
      
      navigate('/reminders');
    } catch (error) {
      console.error('Error saving reminder:', error);
      toast.error('Failed to save reminder');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Button 
        variant="ghost" 
        className="mb-6" 
        onClick={() => navigate('/reminders')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Reminders
      </Button>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Bell className="h-6 w-6 text-[#F13A30]" />
            {isEditMode ? 'Edit Reminder' : 'Add New Reminder'}
          </CardTitle>
          <CardDescription>
            {isEditMode ? 'Update your reminder details' : 'Create a new reminder to help you remember important events'}
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-md">
                Reminder Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="What do you need to remember?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="text-md">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Add more details about this reminder..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-md flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="time" className="text-md flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Time <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <Label className="text-md flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                Priority
              </Label>
              <RadioGroup 
                value={priority} 
                onValueChange={(value) => setPriority(value as 'low' | 'medium' | 'high')}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="high" />
                  <Label htmlFor="high" className="text-red-500 font-medium cursor-pointer">High</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium" className="text-amber-500 font-medium cursor-pointer">Medium</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="low" />
                  <Label htmlFor="low" className="text-green-500 font-medium cursor-pointer">Low</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between border-t p-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/reminders')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="min-w-[120px] bg-[#F13A30] hover:bg-[#d62618]"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : isEditMode ? 'Update Reminder' : 'Add Reminder'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AddReminderPage;
