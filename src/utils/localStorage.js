// src/utils/localStorage.js
import { mockRooms, mockBookings } from '../data/mockData';

export const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const getFromLocalStorage = (key, defaultValue = []) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
};

// Initialize with mock data if empty
export const initializeLocalStorage = () => {
  const existingRooms = getFromLocalStorage('rooms');
  const existingBookings = getFromLocalStorage('bookings');
  
  if (existingRooms.length === 0) {
    saveToLocalStorage('rooms', mockRooms);
  }
  
  if (existingBookings.length === 0) {
    saveToLocalStorage('bookings', mockBookings);
  }
};