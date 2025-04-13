import { ReactNode, useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Brain, Bell, Mic, MicOff, HelpCircle, Settings, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { speak, SpeechRecognitionService, processVoiceCommand } from '@/services/speechService';
import SettingsDialog from '@/components/SettingsDialog';
import { auth } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Create a mock user for testing if no user is authenticated
const mockUser = { uid: 'test-user-id' };

const speechService = new SpeechRecognitionService();

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isListening, setIsListening] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [emergencyContact, setEmergencyContact] = useState<any>(null);
  const pageTitleRef = useRef<HTMLHeadingElement>(null);
  
  // Get current user or use mock for testing
  const currentUser = auth.currentUser || mockUser;

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    if (isFirstLoad) {
      const timer = setTimeout(() => {
        speak("Welcome to ReMind AI. Your memory assistant.");
        setIsFirstLoad(false);
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [isFirstLoad]);

  useEffect(() => {
    const fetchEmergencyContact = async () => {
      if (currentUser) {
        try {
          const docRef = doc(db, 'sos_contacts', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setEmergencyContact(docSnap.data());
          }
        } catch (error) {
          console.error("Error fetching emergency contact:", error);
        }
      }
    };

    fetchEmergencyContact();
  }, [currentUser]);

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const getCurrentPageName = () => {
    switch (location.pathname) {
      case '/':
        return 'Home';
      case '/memories':
        return 'Memory Vault';
      case '/reminders':
        return 'Reminders';
      case '/add-memory':
        return 'Add Memory';
      case '/add-reminder':
        return 'Add Reminder';
      default:
        return '';
    }
  };

  const handleSos = async () => {
    if (emergencyContact) {
      speak(`Calling ${emergencyContact.name} at ${emergencyContact.phone}`);
      toast.error(`Emergency alert! Calling ${emergencyContact.name}...`, {
        duration: 5000,
        icon: "🚨",
      });
      console.log("Emergency contact called:", emergencyContact);
    } else {
      speak("No emergency contact set. Please set up your emergency contact in settings.");
      toast.error("No emergency contact set", {
        duration: 5000,
        icon: "⚠️",
      });
    }
  };

  const handleVoiceCommand = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      return;
    }

    setIsListening(true);
    speak('Listening. How can I help you?');
    
    speechService.startListening(
      (text) => {
        toast.info(`I heard: ${text}`, {
          icon: "🎤",
          duration: 3000,
        });
        
        const { command, target } = processVoiceCommand(text);
        
        if (command === 'sos') {
          handleSos();
        } else if (command === 'navigate' && target) {
          switch (target) {
            case 'home':
              navigate('/');
              speak('Going to home screen');
              break;
            case 'memories':
              navigate('/memories');
              speak('Opening your memory vault');
              break;
            case 'reminders':
              navigate('/reminders');
              speak('Opening your reminders');
              break;
            case 'add-memory':
              navigate('/add-memory');
              speak('Let\'s add a new memory');
              break;
            case 'add-reminder':
              navigate('/add-reminder');
              speak('Let\'s add a new reminder');
              break;
            default:
              speak('I didn\'t understand that command');
          }
        } else if (command === 'delete-memory') {
          speak('Please select a memory to delete');
        } else if (command === 'search-memories') {
          speak('What would you like to search for?');
        } else if (command === 'clear-search') {
          speak('Search cleared');
        } else if (command === 'text-input') {
          speak('I\'ll use that as text input.');
        } else {
          speak('I didn\'t understand that command. Try saying: "Show memories", "Add memory", or "Go home"');
        }
      },
      () => {
        setIsListening(false);
      }
    );
  };

  useEffect(() => {
    const pageName = getCurrentPageName();
    const timer = setTimeout(() => {
      speak(`${pageName} page`);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/80">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => navigate('/')} 
              variant="ghost"
              size="lg"
              className="rounded-full p-3"
            >
              <Home size={24} />
              <span className="sr-only">Home</span>
            </Button>
            
            <Button 
              onClick={() => navigate('/memories')} 
              variant="ghost"
              size="lg"
              className="rounded-full p-3"
            >
              <Brain size={24} />
              <span className="sr-only">Memories</span>
            </Button>
            
            <Button 
              onClick={handleVoiceCommand} 
              variant={isListening ? "destructive" : "outline"}
              size="lg"
              className={`rounded-full p-3 ${isListening ? 'voice-active' : ''}`}
            >
              {isListening ? (
                <MicOff size={24} />
              ) : (
                <Mic size={24} />
              )}
              <span className="sr-only">{isListening ? 'Stop Listening' : 'Start Voice Command'}</span>
            </Button>
            
            <Button 
              onClick={() => navigate('/reminders')} 
              variant="ghost"
              size="lg"
              className="rounded-full p-3"
            >
              <Bell size={24} />
              <span className="sr-only">Reminders</span>
            </Button>
            
            <Button 
              onClick={() => setIsSettingsOpen(true)} 
              variant="outline"
              size="lg"
              className="rounded-full p-3"
            >
              <Settings size={24} />
              <span className="sr-only">Settings</span>
            </Button>
          </div>
        </div>
        <div className="container mt-2">
          <h2 className="text-xl opacity-90 flex items-center">
            {location.pathname === '/' && <Home size={18} className="mr-2" />}
            {location.pathname === '/memories' && <Brain size={18} className="mr-2" />}
            {location.pathname === '/reminders' && <Bell size={18} className="mr-2" />}
            {getCurrentPageName()}
          </h2>
        </div>
      </header>

      <main className="flex-grow container py-6 px-4 max-w-4xl mx-auto">
        {children}
      </main>

      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={handleSos}
          variant="destructive"
          size="lg"
          className="rounded-full p-8 shadow-lg hover:shadow-[#F13A30]/50 transition-all text-2xl bg-[#F13A30] hover:bg-[#d62618]"
        >
          <AlertCircle className="h-12 w-12" />
          <span className="sr-only">SOS</span>
        </Button>
      </div>

      <nav className="bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] p-4 dark:bg-secondary">
        <div className="container flex justify-around items-center">
          <Button
            variant={location.pathname === '/' ? "default" : "ghost"}
            className="accessible-btn flex-col"
            onClick={() => handleNavigation('/')}
          >
            <Home size={32} className="mb-1" />
            <span className="text-base">Home</span>
          </Button>
          
          <Button
            variant={location.pathname === '/memories' ? "default" : "ghost"}
            className="accessible-btn flex-col"
            onClick={() => handleNavigation('/memories')}
          >
            <Brain size={32} className="mb-1" />
            <span className="text-base">Memories</span>
          </Button>
          
          <Button
            variant={location.pathname === '/reminders' ? "default" : "ghost"}
            className="accessible-btn flex-col"
            onClick={() => handleNavigation('/reminders')}
          >
            <Bell size={32} className="mb-1" />
            <span className="text-base">Reminders</span>
          </Button>
          
          <Button
            variant="ghost"
            className="accessible-btn flex-col"
            onClick={() => {
              speak('Available voice commands: Show memories, Show reminders, Go home, Add memory, or Add reminder');
              toast.info('Voice commands: "Show memories", "Show reminders", "Go home", "Add memory", "Add reminder"', {
                duration: 6000,
              });
            }}
          >
            <HelpCircle size={32} className="mb-1" />
            <span className="text-base">Help</span>
          </Button>
        </div>
      </nav>
      
      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </div>
  );
};

export default Layout;
