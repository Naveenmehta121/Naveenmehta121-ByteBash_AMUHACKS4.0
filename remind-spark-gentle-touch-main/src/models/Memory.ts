
export type MemoryCategory = 'people' | 'places' | 'events';

export interface Memory {
  id: string;
  title: string;
  description: string;
  category: MemoryCategory;
  imageUrl: string;
  date: string;
  tags: string[];
  audioNote?: string;
  createdAt: string;
}

export interface ReminderItem {
  id: string;
  title: string;
  description: string;
  time: string;
  days: string[];
  active: boolean;
  createdAt: string;
}
