import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings2, Phone, Mail, User, Upload, Mic } from 'lucide-react';
import { db, storage } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'sonner';
import { speak } from '@/services/speechService';

interface SosSettingsDialogProps {
  userId: string;
}

const SosSettingsDialog = ({ userId }: SosSettingsDialogProps) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

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

      // Upload image if selected
      if (imageFile) {
        const imageRef = ref(storage, `sos/${userId}/profile.jpg`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }

      // Upload voice note if recorded
      if (audioUrl) {
        const response = await fetch(audioUrl);
        const blob = await response.blob();
        const voiceRef = ref(storage, `sos/${userId}/voice_note.wav`);
        await uploadBytes(voiceRef, blob);
        voiceNoteUrl = await getDownloadURL(voiceRef);
      }

      // Save contact details to Firestore
      await setDoc(doc(db, 'sos_contacts', userId), {
        name,
        phone,
        email,
        notes,
        imageUrl,
        voiceNoteUrl,
        updatedAt: new Date().toISOString(),
      });

      toast.success('SOS settings saved successfully');
      speak('SOS settings have been saved');
    } catch (error) {
      toast.error('Failed to save SOS settings');
      console.error('Save error:', error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <Settings2 className="h-4 w-4" />
          <span className="sr-only">SOS Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Emergency Contact Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Contact Name</Label>
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
            <Label htmlFor="phone">Phone Number</Label>
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
            <Label htmlFor="email">Email</Label>
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
        <Button onClick={handleSave} className="w-full">
          Save Settings
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default SosSettingsDialog; 