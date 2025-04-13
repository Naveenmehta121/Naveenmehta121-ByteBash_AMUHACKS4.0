import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { speak } from '@/services/speechService';
import { toast } from 'sonner';

const SosButton = () => {
  const handleSos = () => {
    speak("Calling your emergency contact now");
    toast.error("Emergency alert! Calling emergency contact...", {
      duration: 5000,
      icon: "🚨",
    });
    // TODO: Implement actual emergency contact calling
    console.log("Emergency contact called");
  };

  return (
    <Button
      onClick={handleSos}
      variant="destructive"
      size="lg"
      className="w-full h-20 text-2xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-red-500/50 transition-all"
    >
      <AlertCircle className="h-8 w-8" />
      SOS
    </Button>
  );
};

export default SosButton; 