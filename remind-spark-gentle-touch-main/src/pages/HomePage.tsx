import { useNavigate } from 'react-router-dom';
import { Bell, Brain, Calendar, ChevronRight, Book, Lightbulb, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { speak } from '@/services/speechService';

const HomePage = () => {
  const navigate = useNavigate();

  const handleNavigation = (path: string, text: string) => {
    speak(text);
    navigate(path);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center text-center pb-4">
        <img 
          src="/remind-ai-full-logo.svg" 
          alt="ReMind AI Logo" 
          className="h-64 mb-4" 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/40 dark:to-red-900/40 rounded-t-lg pb-2 border-b">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Brain className="h-5 w-5 text-[#F13A30]" />
              Memory Vault
            </CardTitle>
            <CardDescription>
              Store and retrieve your important memories
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-muted-foreground">
              Save photos, notes, and important information that you want to remember.
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button 
              variant="default" 
              className="w-full justify-between bg-[#F13A30] hover:bg-[#d62618]"
              onClick={() => handleNavigation('/memories', 'Opening your memory vault')}
            >
              View Memories
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/40 dark:to-red-900/40 rounded-t-lg pb-2 border-b">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Bell className="h-5 w-5 text-[#F13A30]" />
              Reminders
            </CardTitle>
            <CardDescription>
              Never forget important tasks or events
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-muted-foreground">
              Set reminders for medications, appointments, and daily activities.
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button 
              variant="default" 
              className="w-full justify-between bg-[#F13A30] hover:bg-[#d62618]"
              onClick={() => handleNavigation('/reminders', 'Opening your reminders')}
            >
              View Reminders
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="pt-4">
        <h2 className="text-2xl font-bold mb-4">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-red-100 p-3 mb-3">
                  <Zap className="h-6 w-6 text-[#F13A30]" />
                </div>
                <h3 className="font-medium text-lg mb-2">Voice Commands</h3>
                <p className="text-sm text-muted-foreground">
                  Control the app with your voice for a hands-free experience
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-red-100 p-3 mb-3">
                  <Lightbulb className="h-6 w-6 text-[#F13A30]" />
                </div>
                <h3 className="font-medium text-lg mb-2">Smart Reminders</h3>
                <p className="text-sm text-muted-foreground">
                  Prioritized reminders with visual and audio notifications
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-red-100 p-3 mb-3">
                  <Book className="h-6 w-6 text-[#F13A30]" />
                </div>
                <h3 className="font-medium text-lg mb-2">Memory Journal</h3>
                <p className="text-sm text-muted-foreground">
                  Save important memories with photos and details
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="pt-4 flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4 text-center">Quick Action</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg w-full">
          <Button 
            variant="outline" 
            size="lg" 
            className="flex items-center gap-2 h-auto py-3 border-[#F13A30] text-[#F13A30] hover:bg-red-50"
            onClick={() => handleNavigation('/add-memory', "Let's add a new memory")}
          >
            <Brain className="h-5 w-5" />
            Add Memory
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="flex items-center gap-2 h-auto py-3 border-[#F13A30] text-[#F13A30] hover:bg-red-50"
            onClick={() => handleNavigation('/add-reminder', "Let's add a new reminder")}
          >
            <Calendar className="h-5 w-5" />
            Add Reminder
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
