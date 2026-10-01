import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface Machine {
  id: string;
  name: string;
  type: 'avion' | 'helicoptere';
}

export interface Professor {
  id: string;
  name: string;
}

export interface Class {
  id: string;
  name: string;
}

export interface Reservation {
  id: string;
  machineId: string;
  professorId: string;
  classId: string;
  day: string;
  dateStr: string; // YYYY-MM-DD
  timeSlot: string;
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'text';
  url?: string;
  content?: string;
  duration?: number;
}

interface AppContextType {
  machines: Machine[];
  professors: Professor[];
  classes: Class[];
  reservations: Reservation[];
  mediaItems: MediaItem[];
  isAuthenticated: boolean;
  isAdmin: boolean;
  addReservation: (reservation: Omit<Reservation, 'id'>) => void;
  removeReservation: (id: string) => void;
  addProfessor: (name: string) => void;
  addMachine: (machine: Omit<Machine, 'id'>) => void;
  addMediaItem: (item: Omit<MediaItem, 'id'>) => void;
  removeMediaItem: (id: string) => void;
  login: (accessKey: string) => boolean;
  loginAdmin: (password: string) => boolean;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const ADMIN_PASSWORD = 'admin123';
const USER_ACCESS_KEY = 'btsaero2026';

const initialMachines: Machine[] = [
  { id: '1', name: 'Cessna 172', type: 'avion' },
  { id: '2', name: 'Airbus A320', type: 'avion' },
  { id: '3', name: 'Boeing 737', type: 'avion' },
  { id: '4', name: 'Eurocopter EC135', type: 'helicoptere' },
  { id: '5', name: 'Bell 206', type: 'helicoptere' },
];

const initialProfessors: Professor[] = [
  { id: '1', name: 'M. Dupont' },
  { id: '2', name: 'Mme Martin' },
  { id: '3', name: 'M. Bernard' },
];

const initialClasses: Class[] = [
  { id: '1', name: 'BTS Aéro 1A' },
  { id: '2', name: 'BTS Aéro 2A' },
  { id: '3', name: 'Bac Pro Aéro 1A' },
  { id: '4', name: 'Bac Pro Aéro 2A' },
  { id: '5', name: 'Bac Pro Aéro 3A' },
];

const initialMediaItems: MediaItem[] = [
  { id: '1', type: 'text', content: 'Bienvenue au BTS Aéronautique', duration: 5000 },
  { id: '2', type: 'text', content: 'Consignes de sécurité : Port obligatoire des EPI', duration: 5000 },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [machines, setMachines] = useState<Machine[]>(() => {
    const saved = localStorage.getItem('machines');
    return saved ? JSON.parse(saved) : initialMachines;
  });
  const [professors, setProfessors] = useState<Professor[]>(() => {
    const saved = localStorage.getItem('professors');
    return saved ? JSON.parse(saved) : initialProfessors;
  });
  const [classes, setClasses] = useState<Class[]>(() => {
    const saved = localStorage.getItem('classes');
    return saved ? JSON.parse(saved) : initialClasses;
  });
  const [reservations, setReservations] = useState<Reservation[]>(() => {
    const saved = localStorage.getItem('reservations');
    return saved ? JSON.parse(saved) : [];
  });
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(() => {
    const saved = localStorage.getItem('mediaItems');
    return saved ? JSON.parse(saved) : initialMediaItems;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('isAdmin') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('machines', JSON.stringify(machines));
  }, [machines]);

  useEffect(() => {
    localStorage.setItem('professors', JSON.stringify(professors));
  }, [professors]);

  useEffect(() => {
    localStorage.setItem('classes', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('reservations', JSON.stringify(reservations));
  }, [reservations]);

  useEffect(() => {
    localStorage.setItem('mediaItems', JSON.stringify(mediaItems));
  }, [mediaItems]);

  useEffect(() => {
    localStorage.setItem('isAuthenticated', String(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('isAdmin', String(isAdmin));
  }, [isAdmin]);

  const addReservation = (reservation: Omit<Reservation, 'id'>) => {
    const newReservation = {
      ...reservation,
      id: Date.now().toString(),
    };
    setReservations(prev => [...prev, newReservation]);
  };

  const removeReservation = (id: string) => {
    setReservations(prev => prev.filter(r => r.id !== id));
  };

  const addProfessor = (name: string) => {
    const newProfessor = {
      id: Date.now().toString(),
      name,
    };
    setProfessors(prev => [...prev, newProfessor]);
  };

  const addMachine = (machine: Omit<Machine, 'id'>) => {
    const newMachine = {
      ...machine,
      id: Date.now().toString(),
    };
    setMachines(prev => [...prev, newMachine]);
  };

  const addMediaItem = (item: Omit<MediaItem, 'id'>) => {
    const newItem = {
      ...item,
      id: Date.now().toString(),
    };
    setMediaItems(prev => [...prev, newItem]);
  };

  const removeMediaItem = (id: string) => {
    setMediaItems(prev => prev.filter(m => m.id !== id));
  };

  const login = (accessKey: string) => {
    if (accessKey === USER_ACCESS_KEY) {
      setIsAuthenticated(true);
      setIsAdmin(false);
      return true;
    }
    return false;
  };

  const loginAdmin = (password: string) => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  return (
    <AppContext.Provider
      value={{
        machines,
        professors,
        classes,
        reservations,
        mediaItems,
        isAuthenticated,
        isAdmin,
        addReservation,
        removeReservation,
        addProfessor,
        addMachine,
        addMediaItem,
        removeMediaItem,
        login,
        loginAdmin,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
