
import { Card } from '@/components/ui/card';
import { Memory } from '@/models/Memory';
import { CalendarIcon, TagIcon } from 'lucide-react';
import { Button } from './ui/button';
import { speak } from '@/services/speechService';

interface MemoryCardProps {
  memory: Memory;
  onDelete: (id: string) => void;
}

const MemoryCard = ({ memory, onDelete }: MemoryCardProps) => {
  const { id, title, description, category, imageUrl, date, tags } = memory;
  
  const handlePlayMemory = () => {
    speak(`${title}. ${description}`);
  };
  
  const getCategoryIcon = () => {
    switch (category) {
      case 'people':
        return '👤';
      case 'places':
        return '🏠';
      case 'events':
        return '🎉';
      default:
        return '📝';
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card className="card-memory overflow-hidden hover:shadow-xl mb-6">
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/3 h-64 md:h-auto">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={title} 
              className="w-full h-full object-cover rounded-t-xl md:rounded-l-xl md:rounded-t-none"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-6xl">{getCategoryIcon()}</span>
            </div>
          )}
        </div>
        
        <div className="p-6 flex-1">
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-block px-3 py-1 text-sm rounded-full bg-accent text-accent-foreground mb-2">
                {getCategoryIcon()} {category.charAt(0).toUpperCase() + category.slice(1)}
              </span>
              <h3 className="text-2xl font-bold mb-2">{title}</h3>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon"
              className="ml-2 h-10 w-10 rounded-full" 
              onClick={handlePlayMemory}
            >
              <span className="text-2xl">🔊</span>
            </Button>
          </div>
          
          <p className="text-lg mb-4">{description}</p>
          
          <div className="flex flex-wrap gap-2 mt-4">
            {tags.map((tag, index) => (
              <span 
                key={index}
                className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm"
              >
                #{tag}
              </span>
            ))}
          </div>
          
          <div className="mt-6 flex justify-between items-center">
            <div className="flex items-center text-muted-foreground">
              <CalendarIcon size={16} className="mr-1" />
              <span className="text-sm">{formatDate(date)}</span>
            </div>
            
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => onDelete(id)}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MemoryCard;
