// Type declarations for Web Speech API
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  start(): void;
  stop(): void;
  abort(): void;
}

// Add to window interface for typecasting
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
    originalSpeak?: (utterance: SpeechSynthesisUtterance) => void;
  }
}

// Speech Synthesis (Text-to-Speech)
export const speak = (text: string): void => {
  if ('speechSynthesis' in window) {
    // Check if voice output is disabled in settings
    if (localStorage.getItem('voiceOutput') === 'false') {
      console.log('Voice output disabled, not speaking:', text);
      return;
    }
    
    // Cancel any ongoing speech before starting a new one
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower speech rate for clarity
    utterance.pitch = 1;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  } else {
    console.error('Speech synthesis not supported');
  }
};

// Speech Recognition (Speech-to-Text)
export class SpeechRecognitionService {
  recognition: SpeechRecognition | null = null;
  isListening: boolean = false;
  
  constructor() {
    // Check for browser support with both standard and webkit prefixes
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      // Use the browser's SpeechRecognition API
      const SpeechRecognitionAPI = window.webkitSpeechRecognition || window.SpeechRecognition;
      this.recognition = new SpeechRecognitionAPI();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
      this.recognition.maxAlternatives = 3; // Get multiple recognition alternatives
      
      // Add error handling
      this.recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
      };
    } else {
      console.error('Speech recognition not supported');
    }
  }
  
  startListening(onResult: (text: string) => void, onEnd: () => void): void {
    if (!this.recognition) {
      console.error('Speech recognition not supported');
      onEnd(); // Call onEnd to ensure UI is updated even if recognition fails
      return;
    }
    
    if (this.isListening) {
      this.stopListening();
    }
    
    this.isListening = true;
    
    this.recognition.onresult = (event) => {
      if (event.results && event.results.length > 0) {
        const transcript = event.results[0][0].transcript;
        console.log('Speech recognized:', transcript);
        onResult(transcript);
      }
    };
    
    this.recognition.onend = () => {
      console.log('Speech recognition ended');
      this.isListening = false;
      onEnd();
    };
    
    try {
      this.recognition.start();
      console.log('Speech recognition started');
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      this.isListening = false;
      onEnd();
    }
  }
  
  stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
        console.log('Speech recognition stopped');
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
      this.isListening = false;
    }
  }
}

export const processVoiceCommand = (text: string): {
  command: string;
  action?: string;
  target?: string;
} => {
  const cleanedText = text.toLowerCase().trim();
  console.log('Processing voice command:', cleanedText);
  
  // SOS Commands
  if (cleanedText.includes('help me') || 
      cleanedText.includes('emergency') || 
      cleanedText.includes('call for help') ||
      cleanedText.includes('i need help') ||
      cleanedText.includes('sos')) {
    return { command: 'sos' };
  }
  
  // Existing navigation commands
  if (cleanedText.includes('show memories') || 
      cleanedText.includes('open memories') || 
      cleanedText.includes('go to memories') ||
      cleanedText.includes('view memories')) {
    return { command: 'navigate', target: 'memories' };
  }
  
  if (cleanedText.includes('show reminders') || 
      cleanedText.includes('open reminders') || 
      cleanedText.includes('go to reminders') ||
      cleanedText.includes('view reminders')) {
    return { command: 'navigate', target: 'reminders' };
  }
  
  if (cleanedText.includes('go home') || 
      cleanedText.includes('go to home') ||
      cleanedText.includes('back to home') ||
      cleanedText.includes('main screen')) {
    return { command: 'navigate', target: 'home' };
  }
  
  if (cleanedText.includes('add memory') || 
      cleanedText.includes('create memory') ||
      cleanedText.includes('new memory') ||
      cleanedText.includes('record memory') ||
      cleanedText.includes('save memory')) {
    return { command: 'navigate', target: 'add-memory' };
  }
  
  if (cleanedText.includes('add reminder') || 
      cleanedText.includes('create reminder') ||
      cleanedText.includes('new reminder') ||
      cleanedText.includes('add a reminder') ||
      cleanedText.includes('set reminder')) {
    return { command: 'navigate', target: 'add-reminder' };
  }

  // Title capture command with improved pattern matching
  if (cleanedText.includes('title') || 
      cleanedText.includes('set title') || 
      cleanedText.includes('name this') ||
      cleanedText.includes('call this') ||
      cleanedText.includes('title is') ||
      cleanedText.includes('title should be')) {
    // Extract the title after the keyword
    const titleKeywords = ['title', 'set title', 'name this', 'call this', 'title is', 'title should be'];
    let title = cleanedText;
    
    for (const keyword of titleKeywords) {
      if (cleanedText.includes(keyword)) {
        title = cleanedText.substring(cleanedText.indexOf(keyword) + keyword.length).trim();
        break;
      }
    }
    
    return { command: 'set-title', target: title };
  }
  
  // Description capture command with improved pattern matching
  if (cleanedText.includes('description') || 
      cleanedText.includes('describe') || 
      cleanedText.includes('write that') ||
      cleanedText.includes('note that') ||
      cleanedText.includes('add note') ||
      cleanedText.includes('details are') ||
      cleanedText.includes('description is')) {
    // Extract the description after the keyword
    const descKeywords = ['description', 'describe', 'write that', 'note that', 'add note', 'details are', 'description is'];
    let description = cleanedText;
    
    for (const keyword of descKeywords) {
      if (cleanedText.includes(keyword)) {
        description = cleanedText.substring(cleanedText.indexOf(keyword) + keyword.length).trim();
        break;
      }
    }
    
    return { command: 'set-description', target: description };
  }

  // New commands for memory management
  if (cleanedText.includes('delete memory') || 
      cleanedText.includes('remove memory') ||
      cleanedText.includes('erase memory')) {
    return { command: 'delete-memory' };
  }

  if (cleanedText.includes('search memories') || 
      cleanedText.includes('find memories') ||
      cleanedText.includes('look for memories')) {
    return { command: 'search-memories' };
  }

  if (cleanedText.includes('clear search') || 
      cleanedText.includes('reset search') ||
      cleanedText.includes('cancel search')) {
    return { command: 'clear-search' };
  }

  // Help command
  if (cleanedText.includes('help') || 
      cleanedText.includes('what can you do') || 
      cleanedText.includes('how to use')) {
    return { command: 'help' };
  }
  
  // Default - use as text input if no specific command
  return { command: 'text-input', target: cleanedText };
};
