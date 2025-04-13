
import { Memory, ReminderItem } from '@/models/Memory';

// Memory Storage Service
export const getMemories = (): Memory[] => {
  const memories = localStorage.getItem('memories');
  return memories ? JSON.parse(memories) : [];
};

export const saveMemory = (memory: Memory): void => {
  const memories = getMemories();
  memories.push(memory);
  localStorage.setItem('memories', JSON.stringify(memories));
};

export const updateMemory = (updatedMemory: Memory): void => {
  const memories = getMemories();
  const index = memories.findIndex(m => m.id === updatedMemory.id);
  if (index !== -1) {
    memories[index] = updatedMemory;
    localStorage.setItem('memories', JSON.stringify(memories));
  }
};

export const deleteMemory = (id: string): void => {
  const memories = getMemories();
  const filteredMemories = memories.filter(memory => memory.id !== id);
  localStorage.setItem('memories', JSON.stringify(filteredMemories));
};

export const getMemoryById = (id: string): Memory | undefined => {
  const memories = getMemories();
  return memories.find(memory => memory.id === id);
};

// Reminder Storage Service
export const getReminders = (): ReminderItem[] => {
  const reminders = localStorage.getItem('reminders');
  return reminders ? JSON.parse(reminders) : [];
};

export const saveReminder = (reminder: ReminderItem): void => {
  const reminders = getReminders();
  reminders.push(reminder);
  localStorage.setItem('reminders', JSON.stringify(reminders));
};

export const updateReminder = (updatedReminder: ReminderItem): void => {
  const reminders = getReminders();
  const index = reminders.findIndex(r => r.id === updatedReminder.id);
  if (index !== -1) {
    reminders[index] = updatedReminder;
    localStorage.setItem('reminders', JSON.stringify(reminders));
  }
};

export const deleteReminder = (id: string): void => {
  const reminders = getReminders();
  const filteredReminders = reminders.filter(reminder => reminder.id !== id);
  localStorage.setItem('reminders', JSON.stringify(filteredReminders));
};

export const getReminderById = (id: string): ReminderItem | undefined => {
  const reminders = getReminders();
  return reminders.find(reminder => reminder.id === id);
};
