
"use client";

import * as React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getSectionTimetable, allUsers, allResources } from '@/lib/data';
import type { TimetableEntry } from '@/lib/types';
import { addDays, eachDayOfInterval, format, isSameDay, startOfWeek, isWithinInterval, isPast, isFuture, startOfDay, getHours, differenceInMinutes, set } from 'date-fns';
import { Skeleton } from './ui/skeleton';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';

export function SectionTimetable() {
    const { user, isLoading } = useAuth();
    const [timetable, setTimetable] = React.useState<TimetableEntry[]>([]);
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

    // For now, all roles will see the student timetable view in a tabular format.
    return <StudentTimetableView timetable={timetable} now={now} />;
}

const StudentTimetableView = ({ timetable, now }: { timetable: TimetableEntry[], now: Date }) => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({
        start: weekStart,
        end: addDays(weekStart, 4), // Mon-Fri
    });

    const faculties = allUsers.filter(u => u.role === 'faculty');
    const rooms = allResources;

    const findNextClass = (entries: TimetableEntry[]) => {
        return entries
            .filter(entry => isFuture(entry.startTime))
            .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())[0];
    };
    const nextClass = findNextClass(timetable);

    const timeSlots = Array.from({ length: 11 }, (_, i) => { // 8 AM to 6 PM
        const time = set(startOfDay(new Date()), { hours: 8 + i, minutes: 0 });
        return format(time, 'h:mm a');
    });

    const getEntryForSlot = (day: Date, time: string) => {
        const [hourStr, minutePeriod] = time.split(':');
        let hour = parseInt(hourStr);
        if (minutePeriod.includes('PM') && hour !== 12) hour += 12;
        if (minutePeriod.includes('AM') && hour === 12) hour = 0;
        
        const slotTime = set(day, { hours: hour, minutes: 0 });

        return timetable.find(entry => 
            isSameDay(entry.startTime, day) && 
            getHours(entry.startTime) === getHours(slotTime)
        );
    };
    
    const getRowSpan = (entry: TimetableEntry) => {
        const durationInMinutes = differenceInMinutes(entry.endTime, entry.startTime);
        return Math.ceil(durationInMinutes / 60);
    }
    
    const processedSlots: { [key: string]: string[] } = {};

    return (
        <ScrollArea className="w-full">
        <div className="border rounded-lg">
            <Table className="min-w-[800px]">
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Time</TableHead>
                        {weekDays.map(day => (
                            <TableHead key={day.toString()} className="text-center">{format(day, 'EEE, MMM d')}</TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {timeSlots.map((time, index) => (
                        <TableRow key={time} className="h-24">
                            <TableCell className="font-semibold align-top">{time}</TableCell>
                            {weekDays.map(day => {
                                const dayKey = format(day, 'yyyy-MM-dd');
                                if (processedSlots[dayKey]?.includes(time)) {
                                    return null; // This slot is covered by a rowspan
                                }
                                
                                const entry = getEntryForSlot(day, time);
                                
                                if (entry) {
                                    const rowSpan = getRowSpan(entry);
                                    if (rowSpan > 1) {
                                        if (!processedSlots[dayKey]) processedSlots[dayKey] = [];
                                        for (let i = 1; i < rowSpan; i++) {
                                            processedSlots[dayKey].push(timeSlots[index + i]);
                                        }
                                    }
                                    
                                    const faculty = faculties.find(f => f.id === entry.facultyId);
                                    const room = rooms.find(r => r.id === entry.roomId);
                                    const isOngoing = isWithinInterval(now, { start: entry.startTime, end: entry.endTime });
                                    const isCompleted = isPast(entry.endTime);
                                    const isNext = nextClass?.id === entry.id;

                                    return (
                                        <TableCell 
                                            key={day.toString()} 
                                            className={cn(
                                                "p-2 align-top transition-all",
                                                isNext && "ring-2 ring-primary ring-inset",
                                                isOngoing && "bg-green-100 dark:bg-green-900/50",
                                                isCompleted && "bg-muted/50"
                                            )}
                                            rowSpan={rowSpan}
                                        >
                                            <div className="flex flex-col h-full">
                                                <div className="flex items-start justify-between mb-1">
                                                    <p className="font-bold text-sm">{entry.subjectName}</p>
                                                     <Badge variant={isCompleted ? "outline" : "default"} className={cn("text-xs", isOngoing && 'bg-green-600')}>{isOngoing ? "Ongoing" : isCompleted ? "Done" : "Upcoming"}</Badge>
                                                </div>
                                                <div className="text-xs text-muted-foreground space-y-1.5 flex-grow">
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="w-5 h-5">
                                                            <AvatarImage src={faculty?.avatarUrl} alt={faculty?.fullName} />
                                                            <AvatarFallback className="text-xs">{faculty?.fullName?.[0]}</AvatarFallback>
                                                        </Avatar>
                                                        <span>{faculty?.fullName || 'N/A'}</span>
                                                    </div>
                                                     <div className="flex items-center gap-2">
                                                        <span className="w-5 h-5 flex items-center justify-center">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                                                        </span>
                                                        <span>{room?.name || 'N/A'}</span>
                                                    </div>
                                                </div>
                                                <div className="text-xs text-muted-foreground pt-1">{format(entry.startTime, 'h:mm a')} - {format(entry.endTime, 'h:mm a')}</div>
                                            </div>
                                        </TableCell>
                                    );
                                }
                                return <TableCell key={day.toString()}></TableCell>;
                            })}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
        </ScrollArea>
    );
};

const TimetableSkeleton = () => (
     <div className="border rounded-lg p-4">
        <div className="grid grid-cols-6 gap-4">
             {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
             ))}
        </div>
        <div className="mt-4 space-y-2">
            {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="grid grid-cols-6 gap-4">
                    <Skeleton className="h-20 w-full" />
                     {Array.from({ length: 5 }).map((_, j) => (
                        <Skeleton key={j} className="h-20 w-full" />
                     ))}
                </div>
             ))}
        </div>
    </div>
);
