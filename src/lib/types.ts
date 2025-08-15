
export interface Resource {
  id: string;
  name: string;
  type: 'Study Room' | 'Lab Equipment' | 'Auditorium' | 'Sports Facility' | 'Court' | string;
  location: string;
  capacity: number;
  imageUrl: string;
  description: string;
  schedule?: Booking[];
}

export interface Booking {
  id: string;
  resourceId: string;
  userId: string;
  userName: string;
  startTime: Date;
  endTime: Date;
  title: string;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  date: Date;
}

export interface User {
  id: string;
  username: string;
  role: 'student' | 'faculty' | 'admin';
}
