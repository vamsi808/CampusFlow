import type { Resource, Booking, Notification } from './types';
import { addHours, set, subDays, formatDistanceToNow } from 'date-fns';

const today = new Date();

export const allBookings: Booking[] = [
  {
    id: 'booking1',
    resourceId: 'lib-sr-1',
    userId: 'user1',
    userName: 'Alex Johnson',
    title: 'Group Study Session',
    startTime: set(today, { hours: 10, minutes: 0, seconds: 0, milliseconds: 0 }),
    endTime: set(today, { hours: 12, minutes: 0, seconds: 0, milliseconds: 0 }),
  },
  {
    id: 'booking2',
    resourceId: 'lib-sr-1',
    userId: 'user2',
    userName: 'Maria Garcia',
    title: 'Project Meeting',
    startTime: set(today, { hours: 14, minutes: 0, seconds: 0, milliseconds: 0 }),
    endTime: set(today, { hours: 15, minutes: 0, seconds: 0, milliseconds: 0 }),
  },
  {
    id: 'booking3',
    resourceId: 'sci-lab-2',
    userId: 'user3',
    userName: 'Sam Lee',
    title: 'Chemistry Experiment',
    startTime: set(today, { hours: 9, minutes: 0, seconds: 0, milliseconds: 0 }),
    endTime: set(today, { hours: 13, minutes: 0, seconds: 0, milliseconds: 0 }),
  },
];

export let allResources: Resource[] = [
  {
    id: 'lib-sr-1',
    name: 'Quiet Study Room 101',
    type: 'Study Room',
    location: 'Library Floor 1',
    capacity: 4,
    imageUrl: 'https://placehold.co/600x400.png',
    description: 'A quiet, enclosed space perfect for individual or small group study.',
    schedule: allBookings.filter(b => b.resourceId === 'lib-sr-1'),
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
    schedule: allBookings.filter(b => b.resourceId === 'sci-lab-2'),
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
];

export const resourceTypes = [...new Set(allResources.map(r => r.type))];
export const locations = [...new Set(allResources.map(r => r.location))];


export const userReservations: Booking[] = [
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

// Dynamically generate notifications from user's upcoming reservations
export const userNotifications: Notification[] = userReservations
  .filter(res => res.startTime > new Date())
  .map((res, index) => {
    const resource = allResources.find(r => r.id === res.resourceId);
    return {
      id: `notif-${index}`,
      title: 'Upcoming Booking',
      description: `Your booking for ${resource?.name || 'a resource'} is in ${formatDistanceToNow(res.startTime)}.`,
      date: new Date(),
    };
  });


export const deleteResource = (id: string) => {
  allResources = allResources.filter(r => r.id !== id);
}

export const addResource = (resource: Omit<Resource, 'schedule'>) => {
  const newResource: Resource = {
    ...resource,
    id: `new-${Math.random().toString(36).substr(2, 9)}`,
  };
  allResources.unshift(newResource);
}