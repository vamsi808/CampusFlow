
import type { Resource, Booking, Notification, User } from './types';
import { addHours, set, subDays, formatDistanceToNow, parseISO } from 'date-fns';

const RESOURCES_STORAGE_KEY = 'campus-flow-resources';
const BOOKINGS_STORAGE_KEY = 'campus-flow-bookings';
const USERS_STORAGE_KEY = 'campus-flow-users';

// Helper to safely access localStorage
const getFromStorage = <T>(key: string, defaultValue: T[]): T[] => {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  try {
    const item = window.localStorage.getItem(key);
    if (!item) return defaultValue;
    
    const parsed = JSON.parse(item);

    // Date objects are stored as strings, so we need to parse them back
    if (key === BOOKINGS_STORAGE_KEY) {
        return parsed.map((booking: any) => ({
            ...booking,
            startTime: parseISO(booking.startTime),
            endTime: parseISO(booking.endTime)
        }));
    }
    
    return parsed;
  } catch (error) {
    console.error(`Error reading from localStorage key “${key}”:`, error);
    return defaultValue;
  }
};

const setInStorage = <T>(key: string, value: T[]) => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage key “${key}”:`, error);
  }
};

const initialBookings: Booking[] = [
  {
    id: 'booking1',
    resourceId: 'lib-sr-1',
    userId: 'user1',
    userName: 'Alex Johnson',
    title: 'Group Study Session',
    startTime: set(new Date(), { hours: 10, minutes: 0, seconds: 0, milliseconds: 0 }),
    endTime: set(new Date(), { hours: 12, minutes: 0, seconds: 0, milliseconds: 0 }),
  },
  {
    id: 'booking2',
    resourceId: 'lib-sr-1',
    userId: 'user2',
    userName: 'Maria Garcia',
    title: 'Project Meeting',
    startTime: set(new Date(), { hours: 14, minutes: 0, seconds: 0, milliseconds: 0 }),
    endTime: set(new Date(), { hours: 15, minutes: 0, seconds: 0, milliseconds: 0 }),
  },
  {
    id: 'booking3',
    resourceId: 'sci-lab-2',
    userId: 'user3',
    userName: 'Sam Lee',
    title: 'Chemistry Experiment',
    startTime: set(new Date(), { hours: 9, minutes: 0, seconds: 0, milliseconds: 0 }),
    endTime: set(new Date(), { hours: 13, minutes: 0, seconds: 0, milliseconds: 0 }),
  },
    {
    id: 'user-res-1',
    resourceId: 'lib-sr-2',
    userId: 'currentUser',
    userName: 'Jane Doe',
    title: 'My Upcoming Presentation Prep',
    startTime: addHours(new Date(), 2),
    endTime: addHours(new Date(), 4),
  },
  {
    id: 'user-res-2',
    resourceId: 'art-studio-1',
    userId: 'currentUser',
    userName: 'Jane Doe',
    title: 'Ceramics Time',
    startTime: subDays(new Date(), 1),
    endTime: subDays(new Date(), 1),
  },
  {
    id: 'user-res-3',
    resourceId: 'rec-tennis-1',
    userId: 'currentUser',
    userName: 'Jane Doe',
    title: 'Tennis practice',
    startTime: addHours(new Date(), 20),
    endTime: addHours(new Date(), 21),
  }
];

const initialResources: Resource[] = [
  {
    id: 'lib-sr-1',
    name: 'Quiet Study Room 101',
    type: 'Study Room',
    location: 'Library Floor 1',
    capacity: 4,
    imageUrl: 'https://placehold.co/600x400.png',
    description: 'A quiet, enclosed space perfect for individual or small group study.',
  },
  {
    id: 'lib-sr-2',
    name: 'Collaborative Space 204',
    type: 'Study Room',
    location: 'Library Floor 2',
    capacity: 8,
    imageUrl: 'https://placehold.co/600x400.png',
    description: 'A large room with a whiteboard, ideal for group projects and discussions.',
  },
  {
    id: 'sci-lab-2',
    name: 'Advanced Microscope',
    type: 'Lab Equipment',
    location: 'Science Wing B',
    capacity: 1,
    imageUrl: 'https://placehold.co/600x400.png',
    description: 'High-powered electron microscope for advanced biological research.',
  },
  {
    id: 'mus-aud-1',
    name: 'Main Auditorium',
    type: 'Auditorium',
    location: 'Music Building',
    capacity: 200,
    imageUrl: 'https://placehold.co/600x400.png',
    description: 'Large auditorium for performances, lectures, and major events.',
  },
  {
    id: 'lib-sr-3',
    name: 'Media Viewing Room 310',
    type: 'Study Room',
    location: 'Library Floor 3',
    capacity: 6,
    imageUrl: 'https://placehold.co/600x400.png',
    description: 'Equipped with a large screen and comfortable seating for media viewing.',
  },
  {
    id: 'art-studio-1',
    name: 'Pottery Wheel A',
    type: 'Lab Equipment',
    location: 'Art Department',
    capacity: 1,
    imageUrl: 'https://placehold.co/600x400.png',
    description: 'Professional-grade pottery wheel for ceramic projects.',
  },
  {
    id: 'rec-gym-1',
    name: 'Main Gymnasium',
    type: 'Sports Facility',
    location: 'Recreation Center',
    capacity: 100,
    imageUrl: 'https://placehold.co/600x400.png',
    description: 'Full-size gymnasium for basketball, volleyball, and other indoor sports.',
  },
  {
    id: 'rec-tennis-1',
    name: 'Tennis Court 1',
    type: 'Court',
    location: 'Outdoor Sports Complex',
    capacity: 4,
    imageUrl: 'https://placehold.co/600x400.png',
    description: 'Outdoor tennis court with high-quality surface.',
  }
].map(r => ({ ...r, schedule: [] }));


// Initialize with default data if nothing is in localStorage
if (typeof window !== 'undefined' && !localStorage.getItem(RESOURCES_STORAGE_KEY)) {
  setInStorage(RESOURCES_STORAGE_KEY, initialResources);
}
if (typeof window !== 'undefined' && !localStorage.getItem(BOOKINGS_STORAGE_KEY)) {
  setInStorage(BOOKINGS_STORAGE_KEY, initialBookings);
}

// Now, all functions will read from and write to localStorage via these getters
export const allResources = ((): Resource[] => {
    const resources = getFromStorage(RESOURCES_STORAGE_KEY, []);
    const bookings = getFromStorage(BOOKINGS_STORAGE_KEY, []);
    
    // Attach schedules to resources
    return resources.map(resource => ({
        ...resource,
        schedule: bookings.filter(b => b.resourceId === resource.id),
    }));
})();


export const allBookings = getFromStorage(BOOKINGS_STORAGE_KEY, []);

export const resourceTypes = [...new Set(allResources.map(r => r.type))];
export const locations = [...new Set(allResources.map(r => r.location))];

export const userReservations = (userId: string): Booking[] => {
  const bookings = getFromStorage(BOOKINGS_STORAGE_KEY, []);
  return bookings.filter(b => b.userId === userId);
}

export const userNotifications = (userId: string): Notification[] => {
    const reservations = userReservations(userId);
    const resources = getFromStorage(RESOURCES_STORAGE_KEY, []);
    return reservations
        .filter(res => res.startTime > new Date())
        .map((res, index) => {
            const resource = resources.find(r => r.id === res.resourceId);
            return {
                id: `notif-${res.id}`,
                title: 'Upcoming Booking',
                description: `Your booking for ${resource?.name || 'a resource'} is in ${formatDistanceToNow(res.startTime)}.`,
                date: new Date(),
            };
    });
};

export const deleteResource = (id: string) => {
  let resources = getFromStorage(RESOURCES_STORAGE_KEY, []);
  resources = resources.filter(r => r.id !== id);
  setInStorage(RESOURCES_STORAGE_KEY, resources);
}

export const addResource = (resource: Omit<Resource, 'schedule' | 'id'>) => {
  let resources = getFromStorage(RESOURCES_STORAGE_KEY, []);
  const newResource: Resource = {
    ...resource,
    id: `new-${Math.random().toString(36).substr(2, 9)}`,
    schedule: [],
  };
  resources.unshift(newResource);
  setInStorage(RESOURCES_STORAGE_KEY, resources);
}

export const addBooking = (booking: Omit<Booking, 'id'>) => {
  const bookings = getFromStorage(BOOKINGS_STORAGE_KEY, []);
  const newBooking: Booking = {
    ...booking,
    id: `booking-${Date.now()}`
  };
  bookings.push(newBooking);
  setInStorage(BOOKINGS_STORAGE_KEY, bookings);
}


// --- User Approval Functions ---

export const getPendingUsers = (): User[] => {
  const users = getFromStorage<User>(USERS_STORAGE_KEY, []);
  return users.filter(user => user.status === 'pending');
}

export const updateUserStatus = (userId: string, status: 'approved' | 'rejected') => {
  let users = getFromStorage<User>(USERS_STORAGE_KEY, []);
  const userIndex = users.findIndex(user => user.id === userId);

  if (userIndex !== -1) {
    users[userIndex].status = status;
    setInStorage(USERS_STORAGE_KEY, users);
  }
}
