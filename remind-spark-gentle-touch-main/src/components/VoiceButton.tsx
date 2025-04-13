
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { toast } from 'sonner';
import { SpeechRecognitionService, processVoiceCommand } from '@/services/speechService';

interface VoiceButtonProps {
  onSpeechResult: (text: string) => void;
  className?: string;
  label?: string;
  purpose?: 'title' | 'description' | 'general'; // Purpose of the voice input
}

const speechService = new SpeechRecognitionService();

const VoiceButton = ({ 
  onSpeechResult, 
  className = '', 
  label = 'Record',
  purpose = 'general'
}: VoiceButtonProps) => {
  const [isListening, setIsListening] = useState(false);
  
  const toggleListening = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      return;
    }
    
    setIsListening(true);
    let listeningMessage = 'Listening...';
    
    if (purpose === 'title') {
      listeningMessage = 'Listening for title...';
    } else if (purpose === 'description') {
      listeningMessage = 'Listening for description...';
    }
    
    toast.info(listeningMessage);
    
    speechService.startListening(
      (text) => {
        console.log(`Voice captured for ${purpose}:`, text);
        
        // For title/description buttons, process differently
        if (purpose === 'title' || purpose === 'description') {
          onSpeechResult(text);
          toast.success(`${purpose === 'title' ? 'Title' : 'Description'} captured!`);
        } else {
          // For general purpose, process as command first
          const { command, target } = processVoiceCommand(text);
          
          if (command === 'set-title' && purpose === 'title') {
            onSpeechResult(target || text);
          } else if (command === 'set-description' && purpose === 'description') {
            onSpeechResult(target || text);
          } else {
            // Just pass the text if no specific command
            onSpeechResult(text);
          }
          
          toast.success('Voice captured!');
        }
      },
      () => {
        setIsListening(false);
      }
    );
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (isListening) {
        speechService.stopListening();
      }
    };
  }, [isListening]);

  return (
    <Button
      type="button"
      onClick={toggleListening}
      variant={isListening ? "destructive" : "secondary"}
      className={`text-lg px-5 py-6 ${className}`}
    >
      {isListening ? <MicOff className="mr-2" /> : <Mic className="mr-2" />}
      {isListening ? 'Stop Recording' : label}
    </Button>
  );
};

export default VoiceButton;
