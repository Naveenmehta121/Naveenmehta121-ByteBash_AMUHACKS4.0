import { db } from '@/config/firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Memory, ReminderItem } from '@/models/Memory';
import { toast } from 'sonner';

export const saveMemory = async (memory: Memory) => {
  try {
    const docRef = await addDoc(collection(db, 'memories'), memory);
    toast.success('Memory saved successfully');
    return docRef.id;
  } catch (error) {
    console.error('Error saving memory:', error);
    toast.error('Failed to save memory');
    throw error;
  }
};

export const getMemories = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'memories'));
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Memory[];
  } catch (error) {
    console.error('Error getting memories:', error);
    toast.error('Failed to load memories');
    throw error;
  }
};

export const deleteMemory = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'memories', id));
    toast.success('Memory deleted successfully');
  } catch (error) {
    console.error('Error deleting memory:', error);
    toast.error('Failed to delete memory');
    throw error;
  }
};

export const saveReminder = async (reminder: ReminderItem) => {
  try {
    const docRef = await addDoc(collection(db, 'reminders'), reminder);
    toast.success('Reminder saved successfully');
    return docRef.id;
  } catch (error) {
    console.error('Error saving reminder:', error);
    toast.error('Failed to save reminder');
    throw error;
  }
};

export const getReminders = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'reminders'));
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as ReminderItem[];
  } catch (error) {
    console.error('Error getting reminders:', error);
    toast.error('Failed to load reminders');
    throw error;
  }
};

export const updateReminder = async (id: string, data: Partial<ReminderItem>) => {
  try {
    await updateDoc(doc(db, 'reminders', id), data);
    toast.success('Reminder updated successfully');
  } catch (error) {
    console.error('Error updating reminder:', error);
    toast.error('Failed to update reminder');
    throw error;
  }
};

export const deleteReminder = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'reminders', id));
    toast.success('Reminder deleted successfully');
  } catch (error) {
    console.error('Error deleting reminder:', error);
    toast.error('Failed to delete reminder');
    throw error;
  }
}; 