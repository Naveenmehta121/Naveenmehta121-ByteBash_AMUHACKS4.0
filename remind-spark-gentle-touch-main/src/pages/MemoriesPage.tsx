
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Search, User, MapPin, CalendarHeart } from 'lucide-react';
import MemoryCard from '@/components/MemoryCard';
import { Memory, MemoryCategory } from '@/models/Memory';
import { getMemories, deleteMemory } from '@/services/storage';
import { toast } from 'sonner';
import { speak } from '@/services/speechService';

const MemoriesPage = () => {
  const navigate = useNavigate();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [filteredMemories, setFilteredMemories] = useState<Memory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<MemoryCategory | 'all'>('all');

  useEffect(() => {
    loadMemories();
  }, []);

  useEffect(() => {
    filterMemories();
  }, [memories, searchTerm, activeTab]);

  const loadMemories = () => {
    const loadedMemories = getMemories();
    setMemories(loadedMemories);
    speak(`Memory vault loaded. You have ${loadedMemories.length} memories.`);
  };

  const filterMemories = () => {
    let filtered = memories;

    // Filter by category
    if (activeTab !== 'all') {
      filtered = filtered.filter(memory => memory.category === activeTab);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(memory => 
        memory.title.toLowerCase().includes(term) ||
        memory.description.toLowerCase().includes(term) ||
        memory.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    setFilteredMemories(filtered);
    
    if (searchTerm) {
      speak(`Found ${filtered.length} matching memories`);
    }
  };

  const handleDelete = (id: string) => {
    deleteMemory(id);
    toast.success('Memory deleted');
    speak('Memory deleted');
    loadMemories();
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as MemoryCategory | 'all');
    
    if (value === 'all') {
      speak('Showing all memories');
    } else {
      speak(`Showing ${value} memories`);
    }
  };

  const handleAddMemory = () => {
    navigate('/add-memory');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Memory Vault</h2>
        <Button 
          className="text-lg py-6 px-4" 
          onClick={handleAddMemory}
        >
          <PlusCircle className="mr-2" />
          Add Memory
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute top-3 left-3 h-5 w-5 text-muted-foreground" />
        <Input 
          placeholder="Search memories..." 
          value={searchTerm}
          onChange={handleSearch}
          className="pl-10 py-6 text-lg"
        />
      </div>

      <Tabs defaultValue="all" onValueChange={handleTabChange}>
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="all" className="text-lg py-3">
            All
          </TabsTrigger>
          <TabsTrigger value="people" className="text-lg py-3">
            <User className="mr-1 h-4 w-4" /> People
          </TabsTrigger>
          <TabsTrigger value="places" className="text-lg py-3">
            <MapPin className="mr-1 h-4 w-4" /> Places
          </TabsTrigger>
          <TabsTrigger value="events" className="text-lg py-3">
            <CalendarHeart className="mr-1 h-4 w-4" /> Events
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredMemories.length === 0 ? (
            <div className="text-center p-8 bg-muted rounded-lg">
              <h3 className="text-2xl font-medium mb-2">No memories found</h3>
              <p className="text-lg mb-4">
                {memories.length === 0 
                  ? "You haven't added any memories yet." 
                  : "No memories match your search."}
              </p>
              {memories.length === 0 && (
                <Button onClick={handleAddMemory} className="text-lg py-6">
                  <PlusCircle className="mr-2" />
                  Add Your First Memory
                </Button>
              )}
            </div>
          ) : (
            filteredMemories.map(memory => (
              <MemoryCard 
                key={memory.id} 
                memory={memory} 
                onDelete={handleDelete} 
              />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="people" className="space-y-4">
          {filteredMemories.length === 0 ? (
            <div className="text-center p-8 bg-muted rounded-lg">
              <h3 className="text-2xl font-medium">No people memories found</h3>
            </div>
          ) : (
            filteredMemories.map(memory => (
              <MemoryCard 
                key={memory.id} 
                memory={memory} 
                onDelete={handleDelete} 
              />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="places" className="space-y-4">
          {filteredMemories.length === 0 ? (
            <div className="text-center p-8 bg-muted rounded-lg">
              <h3 className="text-2xl font-medium">No place memories found</h3>
            </div>
          ) : (
            filteredMemories.map(memory => (
              <MemoryCard 
                key={memory.id} 
                memory={memory} 
                onDelete={handleDelete} 
              />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="events" className="space-y-4">
          {filteredMemories.length === 0 ? (
            <div className="text-center p-8 bg-muted rounded-lg">
              <h3 className="text-2xl font-medium">No event memories found</h3>
            </div>
          ) : (
            filteredMemories.map(memory => (
              <MemoryCard 
                key={memory.id} 
                memory={memory} 
                onDelete={handleDelete} 
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MemoriesPage;
