
"use client";

import * as React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getSectionTimetable, allUsers, allResources, allSections } from '@/lib/data';
import type { TimetableEntry, User } from '@/lib/types';
import { addDays, eachDayOfInterval, format, isSameDay, startOfWeek, isWithinInterval, isPast, isFuture } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Clock, User as UserIcon, MapPin, Phone, Mail, Video } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';

export function SectionTimetable() {
    const { user, isLoading } = useAuth();
    const [timetable, setTimetable] = React.useState<TimetableEntry[]>([]);
    const [week, setWeek] = React.useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
    const [now, setNow] = React.useState(new Date());

    React.useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000); // Update every minute
        return () => clearInterval(timer);
    }, []);

    React.useEffect(() => {
        if (user?.role === 'student' && user.sectionId) {
            const userTimetable = getSectionTimetable(user.sectionId);
            setTimetable(userTimetable);
        }
        // TODO: Add logic for faculty and admin roles
    }, [user]);

    if (isLoading) {
        return <TimetableSkeleton />;
    }

    if (!user) {
        return <div className="text-center text-muted-foreground">Please log in to view your timetable.</div>;
    }

    // This is the student view, as requested.
    return <StudentTimetableView timetable={timetable} now={now} />;
}

const StudentTimetableView = ({ timetable, now }: { timetable: TimetableEntry[], now: Date }) => {
    const weekDays = eachDayOfInterval({
        start: startOfWeek(new Date(), { weekStartsOn: 1 }),
        end: addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 4), // Mon-Fri
    });

    const faculties = allUsers.filter(u => u.role === 'faculty');
    const rooms = allResources;

    const findNextClass = (entries: TimetableEntry[]) => {
        return entries
            .filter(entry => isFuture(entry.startTime))
            .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())[0];
    };

    const nextClass = findNextClass(timetable);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {weekDays.map(day => {
                const dayEntries = timetable
                    .filter(entry => isSameDay(entry.startTime, day))
                    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

                return (
                    <div key={day.toString()} className="space-y-4">
                        <h3 className="font-semibold text-center text-lg">{format(day, 'EEEE')}</h3>
                        <div className="space-y-3 min-h-[200px]">
                            {dayEntries.length > 0 ? dayEntries.map(entry => {
                                const faculty = faculties.find(f => f.id === entry.facultyId);
                                const room = rooms.find(r => r.id === entry.roomId);
                                const isOngoing = isWithinInterval(now, { start: entry.startTime, end: entry.endTime });
                                const isCompleted = isPast(entry.endTime);
                                const isNext = nextClass?.id === entry.id;

                                const getStatus = () => {
                                    if (isOngoing) return { text: 'Ongoing', color: 'bg-green-500' };
                                    if (isCompleted) return { text: 'Completed', color: 'bg-muted-foreground' };
                                    return { text: 'Upcoming', color: 'bg-primary' };
                                }
                                
                                const status = getStatus();

                                return (
                                    <Card key={entry.id} className={cn(
                                        "transition-all",
                                        isNext && "ring-2 ring-primary shadow-lg",
                                        isOngoing && "border-green-500",
                                    )}>
                                        <CardContent className="p-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="font-bold text-base">{entry.subjectName}</p>
                                                <Badge variant={isCompleted ? "outline" : "default"} className={cn(isOngoing && 'bg-green-600')}>{status.text}</Badge>
                                            </div>
                                            <div className="text-sm text-muted-foreground space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{format(entry.startTime, 'h:mm a')} - {format(entry.endTime, 'h:mm a')}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4" />
                                                    <span>{room?.name || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center gap-2 pt-2">
                                                    <Avatar className="w-6 h-6">
                                                        <AvatarImage src={faculty?.avatarUrl} alt={faculty?.fullName} />
                                                        <AvatarFallback>{faculty?.fullName?.[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <span>{faculty?.fullName || 'N/A'}</span>
                                                </div>
                                            </div>
                                             <div className="flex gap-2 mt-3">
                                                <Button variant="outline" size="sm" className="h-7 text-xs" disabled>Office Hours</Button>
                                                <Button variant="outline" size="sm" className="h-7 text-xs" disabled>Message</Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            }) : (
                                <div className="text-center text-muted-foreground pt-10">No classes scheduled.</div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const TimetableSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-4">
                <Skeleton className="h-6 w-32 mx-auto" />
                <div className="space-y-3">
                    <Skeleton className="h-36 w-full" />
                    <Skeleton className="h-36 w-full" />
                </div>
            </div>
        ))}
    </div>
)
