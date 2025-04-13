import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Plus, Search, Trash2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import ReminderItem, { Reminder } from '@/components/ReminderItem';
import { speak } from '@/services/speechService';
import { toast } from 'sonner';
import { db, auth } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, where } from 'firebase/firestore';

// Create a mock user for testing if no user is authenticated
const mockUser = { uid: 'test-user-id' };

const RemindersPage = () => {
  const navigate = useNavigate();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [sortOrder, setSortOrder] = useState<'date' | 'priority'>('date');
  
  // Get current user or use mock for testing
  const currentUser = auth.currentUser || mockUser;

  useEffect(() => {
    // Create a query against the reminders collection
    const q = query(
      collection(db, 'reminders'), 
      where('userId', '==', currentUser.uid),
      orderBy('date', 'asc')
    );

    // Real-time updates - onSnapshot listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reminderData: Reminder[] = [];
      snapshot.forEach((doc) => {
        reminderData.push({ 
          id: doc.id, 
          ...doc.data() 
        } as Reminder);
      });
      setReminders(reminderData);
    }, (error) => {
      console.error("Error fetching reminders:", error);
      toast.error("Failed to load reminders");
    });

    // Clean up the listener when component unmounts
    return () => unsubscribe();
  }, [currentUser.uid]);

  const handleAddReminder = () => {
    navigate('/add-reminder');
  };

  const handleCompleteReminder = async (id: string) => {
    try {
      const reminder = reminders.find(r => r.id === id);
      if (reminder) {
        const reminderRef = doc(db, 'reminders', id);
        await updateDoc(reminderRef, {
          isCompleted: !reminder.isCompleted
        });
        toast.success(`Reminder ${reminder.isCompleted ? 'marked as active' : 'completed'}`);
        speak(`Reminder ${reminder.isCompleted ? 'marked as active' : 'completed'}`);
      }
    } catch (error) {
      console.error("Error updating reminder:", error);
      toast.error("Failed to update reminder");
    }
  };

  const handleDeleteReminder = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'reminders', id));
      toast.success('Reminder deleted successfully');
      speak('Reminder deleted');
    } catch (error) {
      console.error("Error deleting reminder:", error);
      toast.error("Failed to delete reminder");
    }
  };

  const handleEditReminder = (reminder: Reminder) => {
    navigate('/add-reminder', { state: { reminder } });
  };

  const filteredReminders = reminders
    .filter(reminder => {
      // Filter by search query
      if (searchQuery && !reminder.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !reminder.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Filter by tab
      if (activeTab === 'active' && reminder.isCompleted) return false;
      if (activeTab === 'completed' && !reminder.isCompleted) return false;
      
      return true;
    })
    .sort((a, b) => {
      // Sort by selected order
      if (sortOrder === 'date') {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA.getTime() - dateB.getTime();
      } else if (sortOrder === 'priority') {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return 0;
    });

  const handleClearCompleted = async () => {
    try {
      const completedReminders = reminders.filter(reminder => reminder.isCompleted);
      
      // Create a batch of delete operations
      const deletePromises = completedReminders.map(reminder => 
        deleteDoc(doc(db, 'reminders', reminder.id))
      );
      
      await Promise.all(deletePromises);
      
      toast.success('Completed reminders cleared');
      speak('Completed reminders have been cleared');
    } catch (error) {
      console.error("Error clearing completed reminders:", error);
      toast.error("Failed to clear completed reminders");
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-8 w-8" />
            Reminders
          </h1>
          <Button onClick={handleAddReminder} className="gap-1">
            <Plus size={16} />
            Add Reminder
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search reminders..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-1 whitespace-nowrap">
                <Filter size={16} />
                Sort & Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Sort by</h4>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input 
                        type="radio" 
                        checked={sortOrder === 'date'} 
                        onChange={() => setSortOrder('date')}
                      />
                      Date
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input 
                        type="radio" 
                        checked={sortOrder === 'priority'} 
                        onChange={() => setSortOrder('priority')}
                      />
                      Priority
                    </label>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </header>

      <Tabs 
        defaultValue="all" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all" className="rounded-lg">All</TabsTrigger>
            <TabsTrigger value="active" className="rounded-lg">Active</TabsTrigger>
            <TabsTrigger value="completed" className="rounded-lg">Completed</TabsTrigger>
          </TabsList>
          
          {activeTab === 'completed' && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleClearCompleted}
              className="gap-1"
            >
              <Trash2 size={14} />
              Clear completed
            </Button>
          )}
        </div>

        <TabsContent value="all" className="mt-4">
          <div className="space-y-3">
            {filteredReminders.length > 0 ? (
              filteredReminders.map(reminder => (
                <ReminderItem
                  key={reminder.id}
                  reminder={reminder}
                  onComplete={handleCompleteReminder}
                  onDelete={handleDeleteReminder}
                  onEdit={handleEditReminder}
                />
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                {searchQuery ? 'No reminders match your search' : 'No reminders yet'}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="active" className="mt-4">
          <div className="space-y-3">
            {filteredReminders.length > 0 ? (
              filteredReminders.map(reminder => (
                <ReminderItem
                  key={reminder.id}
                  reminder={reminder}
                  onComplete={handleCompleteReminder}
                  onDelete={handleDeleteReminder}
                  onEdit={handleEditReminder}
                />
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                {searchQuery ? 'No active reminders match your search' : 'No active reminders'}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="completed" className="mt-4">
          <div className="space-y-3">
            {filteredReminders.length > 0 ? (
              filteredReminders.map(reminder => (
                <ReminderItem
                  key={reminder.id}
                  reminder={reminder}
                  onComplete={handleCompleteReminder}
                  onDelete={handleDeleteReminder}
                  onEdit={handleEditReminder}
                />
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                {searchQuery ? 'No completed reminders match your search' : 'No completed reminders'}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RemindersPage;
