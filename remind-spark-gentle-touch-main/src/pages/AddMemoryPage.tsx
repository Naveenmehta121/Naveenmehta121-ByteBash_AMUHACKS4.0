import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { CalendarIcon, X, UserIcon, MapPinIcon, CalendarHeartIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { saveMemory } from '@/services/storage';
import { Memory, MemoryCategory } from '@/models/Memory';
import { speak } from '@/services/speechService';
import VoiceButton from '@/components/VoiceButton';

const AddMemoryPage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<MemoryCategory>('people');
  const [imageUrl, setImageUrl] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title) {
      toast.error('Please enter a title');
      speak('Please enter a title for this memory');
      return;
    }
    
    const newMemory: Memory = {
      id: uuidv4(),
      title,
      description,
      category,
      imageUrl,
      date: date.toISOString(),
      tags,
      createdAt: new Date().toISOString()
    };
    
    saveMemory(newMemory);
    toast.success('Memory saved successfully!');
    speak('Memory saved successfully');
    navigate('/memories');
  };
  
  const handleAddTag = () => {
    if (currentTag && !tags.includes(currentTag)) {
      setTags([...tags, currentTag]);
      setCurrentTag('');
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleVoiceDescriptionResult = (text: string) => {
    console.log('Setting description via voice:', text);
    setDescription(text);
    toast.success('Description added via voice');
  };
  
  const handleVoiceTitleResult = (text: string) => {
    console.log('Setting title via voice:', text);
    setTitle(text);
    toast.success('Title added via voice');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Add New Memory</h2>
        <p className="text-lg text-muted-foreground">
          Preserve an important memory with details and images
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-lg">
            Memory Title
          </Label>
          <div className="flex gap-2">
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for this memory"
              className="text-lg py-6"
            />
            <VoiceButton 
              onSpeechResult={handleVoiceTitleResult}
              label="Speak Title"
              purpose="title"
              className="whitespace-nowrap"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category" className="text-lg">
            Category
          </Label>
          <RadioGroup 
            value={category} 
            onValueChange={(value) => setCategory(value as MemoryCategory)}
            className="flex flex-wrap gap-6 pt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="people" id="people" className="h-5 w-5" />
              <Label htmlFor="people" className="text-lg flex items-center">
                <UserIcon className="mr-1 h-5 w-5" /> People
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="places" id="places" className="h-5 w-5" />
              <Label htmlFor="places" className="text-lg flex items-center">
                <MapPinIcon className="mr-1 h-5 w-5" /> Places
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="events" id="events" className="h-5 w-5" />
              <Label htmlFor="events" className="text-lg flex items-center">
                <CalendarHeartIcon className="mr-1 h-5 w-5" /> Events
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-lg">
            Memory Description
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe this memory..."
            className="text-lg min-h-[120px]"
          />
          <div className="pt-2">
            <VoiceButton 
              onSpeechResult={handleVoiceDescriptionResult}
              label="Speak Description"
              purpose="description"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="image" className="text-lg">
            Image URL (Optional)
          </Label>
          <Input
            id="image"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Enter an image URL"
            className="text-lg py-6"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-lg">When did this happen?</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left text-lg py-6",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-5 w-5" />
                {date ? format(date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => date && setDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags" className="text-lg">
            Tags
          </Label>
          <div className="flex gap-2">
            <Input
              id="tags"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              placeholder="Add tags (e.g., family, vacation)"
              className="text-lg py-6 flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
            <Button
              type="button"
              onClick={handleAddTag}
              className="whitespace-nowrap text-lg py-6"
            >
              Add Tag
            </Button>
          </div>
          
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {tags.map((tag) => (
                <div
                  key={tag}
                  className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-lg flex items-center gap-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="rounded-full hover:bg-secondary-foreground/20 p-1"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove {tag} tag</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 flex gap-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1 text-lg py-6"
            onClick={() => navigate('/memories')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 text-lg py-6"
          >
            Save Memory
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddMemoryPage;
