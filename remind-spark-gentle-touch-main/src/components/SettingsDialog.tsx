import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings, Moon, Sun, Volume2, VolumeX, HelpCircle, Phone, Mail, User, Upload, Mic } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { speak } from '@/services/speechService';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { db, storage } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'sonner';
import { auth } from '@/lib/firebase';

// Create a mock user for testing if no user is authenticated
const mockUser = { uid: 'test-user-id' };

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [voiceOutput, setVoiceOutput] = useState<boolean>(true);
  
  // Get current user or use mock for testing
  const currentUser = auth.currentUser || mockUser;

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const savedVoiceOutput = localStorage.getItem('voiceOutput') !== 'false';

    setDarkMode(savedDarkMode);
    setVoiceOutput(savedVoiceOutput);

    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'sos_contacts', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || '');
          setPhone(data.phone || '');
          setEmail(data.email || '');
          setNotes(data.notes || '');
          setAudioUrl(data.voiceNoteUrl || null);
        }
      } catch (error) {
        console.error("Error fetching emergency contact settings:", error);
      }
    };

    fetchSettings();
  }, [currentUser]);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());

    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      if (voiceOutput) speak('Dark mode enabled');
    } else {
      document.documentElement.classList.remove('dark');
      if (voiceOutput) speak('Dark mode disabled');
    }
  };

  const toggleVoiceOutput = () => {
    const newVoiceOutput = !voiceOutput;
    setVoiceOutput(newVoiceOutput);
    localStorage.setItem('voiceOutput', newVoiceOutput.toString());

    if (newVoiceOutput) {
      speak('Voice output enabled');
    } else {
      speak('Voice output disabled. Goodbye!');
      window.originalSpeak = window.originalSpeak || window.speechSynthesis.speak;
      window.speechSynthesis.speak = function(utterance) {
        if (localStorage.getItem('voiceOutput') !== 'false') {
          window.originalSpeak.call(window.speechSynthesis, utterance);
        }
      };
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      toast.error('Failed to start recording');
      console.error('Recording error:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handleSave = async () => {
    try {
      let imageUrl = '';
      let voiceNoteUrl = '';

      if (currentUser) {
        try {
          // Upload image if selected
          if (imageFile) {
            const imageRef = ref(storage, `sos/${currentUser.uid}/profile.jpg`);
            await uploadBytes(imageRef, imageFile);
            imageUrl = await getDownloadURL(imageRef);
          }

          // Upload voice note if recorded
          if (audioUrl) {
            const response = await fetch(audioUrl);
            const blob = await response.blob();
            const voiceRef = ref(storage, `sos/${currentUser.uid}/voice_note.wav`);
            await uploadBytes(voiceRef, blob);
            voiceNoteUrl = await getDownloadURL(voiceRef);
          }

          // Save contact details to Firestore
          await setDoc(doc(db, 'sos_contacts', currentUser.uid), {
            name,
            phone,
            email,
            notes,
            imageUrl,
            voiceNoteUrl,
            updatedAt: new Date().toISOString(),
          });
        } catch (error) {
          console.error("Error saving to Firebase:", error);
          throw error;
        }

        // Save dark mode preference
        localStorage.setItem('darkMode', darkMode.toString());
        document.documentElement.classList.toggle('dark', darkMode);

        toast.success('Settings saved successfully');
        speak('Settings have been saved');
        onOpenChange(false);
      }
    } catch (error) {
      toast.error('Failed to save settings');
      console.error('Save error:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl">
            <Settings className="mr-2" size={24} /> Settings
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-8">
          <div className="space-y-4">
            <h3 className="font-semibold text-xl">Appearance</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {darkMode ? <Moon size={20} /> : <Sun size={20} />}
                <Label htmlFor="dark-mode" className="text-lg">Dark Mode</Label>
              </div>
              <Switch 
                id="dark-mode" 
                checked={darkMode} 
                onCheckedChange={toggleDarkMode}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold text-xl">Accessibility</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {voiceOutput ? <Volume2 size={20} /> : <VolumeX size={20} />}
                <Label htmlFor="voice-output" className="text-lg">Voice Output</Label>
              </div>
              <Switch 
                id="voice-output" 
                checked={voiceOutput} 
                onCheckedChange={toggleVoiceOutput}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-xl">Emergency Contact</h3>
            <div className="grid gap-2">
              <Label htmlFor="name">Emergency Contact Name</Label>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter contact name"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Emergency Phone Number</Label>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Emergency Email</Label>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter any additional information"
              />
            </div>
            <div className="grid gap-2">
              <Label>Profile Image</Label>
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="cursor-pointer"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Voice Note</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant={isRecording ? "destructive" : "outline"}
                  onClick={isRecording ? stopRecording : startRecording}
                  className="w-full"
                >
                  <Mic className="h-4 w-4 mr-2" />
                  {isRecording ? 'Stop Recording' : 'Record Voice Note'}
                </Button>
              </div>
              {audioUrl && (
                <audio controls src={audioUrl} className="w-full mt-2" />
              )}
            </div>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="help">
              <AccordionTrigger>
                <div className="flex items-center space-x-2">
                  <HelpCircle size={20} />
                  <span className="text-lg font-semibold">Help & Information</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 p-2">
                  <h4 className="font-semibold">Voice Commands</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>"Show memories"</strong> - Navigate to memories page</li>
                    <li><strong>"Show reminders"</strong> - Navigate to reminders page</li>
                    <li><strong>"Go home"</strong> - Navigate to home page</li>
                    <li><strong>"Add memory"</strong> - Create a new memory</li>
                    <li><strong>"Add reminder"</strong> - Create a new reminder</li>
                    <li><strong>"Help"</strong> - Get a list of commands</li>
                  </ul>
                  
                  <h4 className="font-semibold mt-4">About ReMind AI</h4>
                  <p>ReMind AI is designed to help users with memory challenges maintain their independence and quality of life through accessible memory and reminder tools.</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        <Button onClick={handleSave} className="w-full">
          Save Settings
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
