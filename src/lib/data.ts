
import type { Resource, Booking, Notification, User, Section, TimetableEntry } from './types';
import { addHours, set, subDays, formatDistanceToNow, parseISO, startOfToday, addMinutes, startOfWeek, addDays, setHours, setMinutes } from 'date-fns';

const RESOURCES_STORAGE_KEY = 'campus-flow-resources';
const BOOKINGS_STORAGE_KEY = 'campus-flow-bookings';
const USERS_STORAGE_KEY = 'campus-flow-users';
const SECTIONS_STORAGE_KEY = 'campus-flow-sections';
const TIMETABLE_STORAGE_KEY = 'campus-flow-timetable';


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
    if (key === BOOKINGS_STORAGE_KEY || key === TIMETABLE_STORAGE_KEY) {
        return parsed.map((entry: any) => ({
            ...entry,
            startTime: parseISO(entry.startTime),
            endTime: parseISO(entry.endTime)
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
    resourceFor: 'student',
  },
  {
    id: 'lib-sr-2',
    name: 'Collaborative Space 204',
    type: 'Study Room',
    location: 'Library Floor 2',
    capacity: 8,
    imageUrl: 'https://placehold.co/600x400.png',
    description: 'A large room with a whiteboard, ideal for group projects and discussions.',
    resourceFor: 'student',
  },
  {
    id: 'sci-lab-2',
    name: 'Advanced Microscope',
    type: 'Lab Equipment',
    location: 'Science Wing B',
    capacity: 1,
    imageUrl: 'https://placehold.co/600x400.png',
    description: 'High-powered electron microscope for advanced biological research.',
    resourceFor: 'faculty',
  },
  {
    id: 'mus-aud-1',
    name: 'Main Auditorium',
    type: 'Auditorium',
    location: 'Music Building',
    capacity: 200,
    imageUrl: 'https://placehold.co/600x400.png',
    description: 'Large auditorium for performances, lectures, and major events.',
    resourceFor: 'faculty',
  },
  {
    id: 'lib-sr-3',
    name: 'Media Viewing Room 310',
    type: 'Study Room',
    location: 'Library Floor 3',
    capacity: 6,
    imageUrl: 'https://placehold.co/600x400.png',
    description: 'Equipped with a large screen and comfortable seating for media viewing.',
    resourceFor: 'student',
  },
  {
    id: 'art-studio-1',
    name: 'Pottery Wheel A',
    type: 'Lab Equipment',
    location: 'Art Department',
    capacity: 1,
    imageUrl: 'https://placehold.co/600x400.png',
    description: 'Professional-grade pottery wheel for ceramic projects.',
    resourceFor: 'student',
  },
  {
    id: 'rec-gym-1',
    name: 'Main Gymnasium',
    type: 'Sports Facility',
    location: 'Recreation Center',
    capacity: 100,
    imageUrl: 'https://placehold.co/600x400.png',
    description: 'Full-size gymnasium for basketball, volleyball, and other indoor sports.',
    resourceFor: 'student',
  },
  {
    id: 'rec-tennis-1',
    name: 'Tennis Court 1',
    type: 'Court',
    location: 'Outdoor Sports Complex',
    capacity: 4,
    imageUrl: 'https://placehold.co/600x400.png',
    description: 'Outdoor tennis court with high-quality surface.',
    resourceFor: 'student',
  },
  {
    id: 'room-cb-301',
    name: 'Classroom CB-301',
    type: 'Classroom',
    location: 'Core Building, Floor 3',
    capacity: 60,
    imageUrl: 'https://placehold.co/600x400.png',
    description: 'Standard classroom with projector and whiteboard.',
    resourceFor: 'student',
  },
   {
    id: 'room-cb-302',
    name: 'Classroom CB-302',
    type: 'Classroom',
    location: 'Core Building, Floor 3',
    capacity: 60,
    imageUrl: 'https://placehold.co/600x400.png',
    description: 'Standard classroom with projector and whiteboard.',
    resourceFor: 'student',
  },
   {
    id: 'lab-it-505',
    name: 'Data Science Lab IT-505',
    type: 'Lab',
    location: 'IT Block, Floor 5',
    capacity: 40,
    imageUrl: 'https://placehold.co/600x400.png',
    description: 'Computer lab with high-end systems for data science.',
    resourceFor: 'student',
  },
].map(r => ({ ...r, schedule: [] }));

const initialSections: Section[] = [
    { id: 'sec-it-b-2', name: 'IT-B', department: 'Information Technology', year: '2' },
];

const generateWeeklyTimetable = (sectionId: string, weekStart: Date): TimetableEntry[] => {
    const timetable: TimetableEntry[] = [];
    const subjects = [
        { name: 'Data Structures', facultyId: 'faculty-ds', roomId: 'room-cb-301', duration: 50 },
        { name: 'Operating Systems', facultyId: 'faculty-os', roomId: 'room-cb-302', duration: 50 },
        { name: 'Web Technologies', facultyId: 'faculty-web', roomId: 'lab-it-505', duration: 100 },
        { name: 'Database Management', facultyId: 'faculty-db', roomId: 'room-cb-301', duration: 50 },
        { name: 'Computer Networks', facultyId: 'faculty-cn', roomId: 'room-cb-302', duration: 50 },
    ];

    const schedule = {
        1: [{ time: '09:00', subject: 0 }, { time: '10:00', subject: 1 }, { time: '11:00', subject: 2 }], // Monday
        2: [{ time: '09:00', subject: 3 }, { time: '10:00', subject: 4 }, { time: '13:00', subject: 0 }], // Tuesday
        3: [{ time: '10:00', subject: 1 }, { time: '11:00', subject: 2 }, { time: '14:00', subject: 3 }], // Wednesday
        4: [{ time: '09:00', subject: 4 }, { time: '11:00', subject: 0 }, { time: '13:00', subject: 1 }], // Thursday
        5: [{ time: '10:00', subject: 2 }, { time: '11:00', subject: 3 }, { time: '14:00', subject: 4 }], // Friday
    };

    Object.entries(schedule).forEach(([day, classes]) => {
        const currentDay = addDays(weekStart, parseInt(day) - 1);
        classes.forEach(c => {
            const subject = subjects[c.subject];
            const [hour, minute] = c.time.split(':');
            const startTime = setMinutes(setHours(currentDay, parseInt(hour)), parseInt(minute));
            const endTime = addMinutes(startTime, subject.duration);
            timetable.push({
                id: `tt-${sectionId}-${day}-${c.time}`,
                subjectName: subject.name,
                facultyId: subject.facultyId,
                roomId: subject.roomId,
                sectionId: sectionId,
                startTime: startTime,
                endTime: endTime,
                status: 'upcoming',
            });
        });
    });

    return timetable;
}

const initialTimetable = generateWeeklyTimetable('sec-it-b-2', startOfWeek(new Date(), { weekStartsOn: 1 }));


// Initialize with default data if nothing is in localStorage
if (typeof window !== 'undefined' && !localStorage.getItem(RESOURCES_STORAGE_KEY)) {
  setInStorage(RESOURCES_STORAGE_KEY, initialResources);
}
if (typeof window !== 'undefined' && !localStorage.getItem(BOOKINGS_STORAGE_KEY)) {
  setInStorage(BOOKINGS_STORAGE_KEY, initialBookings);
}
if (typeof window !== 'undefined' && !localStorage.getItem(SECTIONS_STORAGE_KEY)) {
  setInStorage(SECTIONS_STORAGE_KEY, initialSections);
}
if (typeof window !== 'undefined' && !localStorage.getItem(TIMETABLE_STORAGE_KEY)) {
  setInStorage(TIMETABLE_STORAGE_KEY, initialTimetable);
}


// Now, all functions will read from and write to localStorage via these getters
export const allResources = ((): Resource[] => {
    const resources = getFromStorage<Resource>(RESOURCES_STORAGE_KEY, []);
    const bookings = getFromStorage<Booking>(BOOKINGS_STORAGE_KEY, []);
    
    // Attach schedules to resources
    return resources.map(resource => ({
        ...resource,
        schedule: bookings.filter(b => b.resourceId === resource.id),
    }));
})();


export const allBookings = getFromStorage(BOOKINGS_STORAGE_KEY, []);
export const allSections = getFromStorage(SECTIONS_STORAGE_KEY, []);
export const allTimetableEntries = getFromStorage(TIMETABLE_STORAGE_KEY, []);


export const resourceTypes = [...new Set(allResources.map(r => r.type))];
export const locations = [...new Set(allResources.map(r => r.location))];

export const userReservations = (userId: string): Booking[] => {
  const bookings = getFromStorage(BOOKINGS_STORAGE_KEY, []);
  return bookings.filter(b => b.userId === userId);
}

export const getSectionTimetable = (sectionId: string): TimetableEntry[] => {
    const timetable = getFromStorage(TIMETABLE_STORAGE_KEY, []);
    return timetable.filter(entry => entry.sectionId === sectionId);
}

export const allUsers = getFromStorage(USERS_STORAGE_KEY, []);


export const userNotifications = (userId: string): Notification[] => {
    const reservations = userReservations(userId);
    const resources = getFromStorage<Resource>(RESOURCES_STORAGE_KEY, []);
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
  let resources = getFromStorage<Resource>(RESOURCES_STORAGE_KEY, []);
  resources = resources.filter(r => r.id !== id);
  setInStorage(RESOURCES_STORAGE_KEY, resources);
}

export const addResource = (resource: Omit<Resource, 'schedule' | 'id'>) => {
  let resources = getFromStorage<Resource>(RESOURCES_STORAGE_KEY, []);
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
