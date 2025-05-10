import React, { createContext, useContext, useState } from 'react';

export type Event = { id: string; title: string; date: string };

type EventsContextType = {
  events: Event[];
  addEvent: (event: Event) => void;
  updateEvent: (event: Event) => void;
  deleteEvent: (id: string) => void;
};

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export const EventsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const addEvent = (event: Event) => setEvents((prev) => [...prev, event]);
  const updateEvent = (event: Event) => setEvents((prev) => prev.map(e => e.id === event.id ? event : e));
  const deleteEvent = (id: string) => setEvents((prev) => prev.filter(e => e.id !== id));
  return (
    <EventsContext.Provider value={{ events, addEvent, updateEvent, deleteEvent }}>
      {children}
    </EventsContext.Provider>
  );
};

export const useEvents = (): EventsContextType => {
  const context = useContext(EventsContext);
  if (!context) {
    throw new Error('useEvents must be used within EventsProvider');
  }
  return context;
}; 