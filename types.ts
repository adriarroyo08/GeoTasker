export interface GeoLocation {
  lat: number;
  lng: number;
  address?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate?: string; // ISO String
  location?: GeoLocation;
  radius: number; // meters
  isCompleted: boolean;
  createdAt: number;
}

export enum AppView {
  LIST = 'LIST',
  MAP = 'MAP',
  ADD = 'ADD',
  CALENDAR = 'CALENDAR'
}

export interface GeofenceEvent {
  taskId: string;
  distance: number;
  timestamp: number;
}