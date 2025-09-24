
"use client";

import * as React from 'react';
import {
  addHours,
  eachHourOfInterval,
  isBefore,
  isSameHour,
  format,
  startOfDay,
  isWithinInterval,
} from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Clock } from 'lucide-react';
import type { Resource } from '@/lib/types';
import { AlternativeResourcesModal } from './alternative-resources-modal';
import { useAuth } from '@/hooks/use-auth';
import { addBooking } from '@/lib/data';
import { useRouter } from 'next/navigation';
import { Skeleton } from './ui/skeleton';

interface ScheduleViewerProps {
  resource: Resource;
}

export function ScheduleViewer({ resource }: ScheduleViewerProps) {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = React.useState<Date | null>(null);
  const [isBookingConfirmOpen, setBookingConfirmOpen] = React.useState(false);
  const [isAlternativesModalOpen, setAlternativesModalOpen] = React.useState(false);
  const [isClient, setIsClient] = React.useState(false);

  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();

  const today = startOfDay(new Date());
  const selectedDate = date ? startOfDay(date) : today;

  const timeSlots = React.useMemo(() => {
    const slots = eachHourOfInterval({
      start: addHours(selectedDate, 8),
      end: addHours(selectedDate, 19),
    });
    return slots;
  }, [selectedDate]);

  const bookingsForDay = React.useMemo(() => resource.schedule?.filter(
    (booking) => format(booking.startTime, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
  ) || [], [resource.schedule, selectedDate]);
  
  React.useEffect(() => {
    setIsClient(true);
  }, []);


  const handleSlotClick = (slot: Date) => {
    setSelectedSlot(slot);
    const isBooked = bookingsForDay.some(b =>
        isSameHour(b.startTime, slot) ||
        isWithinInterval(slot, { start: b.startTime, end: b.endTime })
    );

    if (isBooked) {
      setAlternativesModalOpen(true);
    } else {
      setBookingConfirmOpen(true);
    }
  };

  const handleBookingConfirm = () => {
    if (!user || !selectedSlot) return;

    addBooking({
      resourceId: resource.id,
      userId: user.id,
      userName: user.fullName || user.username,
      startTime: selectedSlot,
      endTime: addHours(selectedSlot, 1),
      title: `Booking for ${user.fullName || user.username}`,
    });

    toast({
      title: "Booking Successful!",
      description: `You have booked ${resource.name} for ${format(selectedSlot!, 'MMM d, h:mm a')}.`,
    });
    setBookingConfirmOpen(false);
    setSelectedSlot(null);
    router.refresh();
  };


  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          disabled={(day) => isBefore(day, today)}
          className="rounded-md border w-fit"
        />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-4 text-lg font-medium">
          <Clock className="w-5 h-5" />
          Available Slots for {format(selectedDate, 'MMMM d, yyyy')}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {!isClient && Array.from({ length: 12 }).map((_, i) => (
             <Skeleton key={i} className="h-9 w-full" />
          ))}
          {isClient && timeSlots.map((time, i) => {
            const isPast = isBefore(time, new Date());
            const isBooked = bookingsForDay.some(b => isSameHour(b.startTime, time) || isWithinInterval(time, { start: b.startTime, end: b.endTime }));
            return (
              <Button
                key={i}
                variant={isBooked ? "destructive" : "outline"}
                disabled={isPast || isBooked}
                onClick={() => handleSlotClick(time)}
                className="transition-all duration-200"
              >
                {format(time, 'h:mm a')}
              </Button>
            );
          })}
        </div>
        <div className="mt-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-primary/20 border border-primary"></span> Available</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-destructive/80"></span> Booked</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-muted"></span> Past</div>
        </div>
      </div>

      {/* Booking Confirmation Dialog */}
      <Dialog open={isBookingConfirmOpen} onOpenChange={setBookingConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Your Booking</DialogTitle>
            <DialogDescription>
              You are about to book the following resource. Please review the details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <p><strong>Resource:</strong> {resource.name}</p>
            <p><strong>Date:</strong> {selectedSlot && format(selectedSlot, 'MMMM d, yyyy')}</p>
            <p><strong>Time:</strong> {selectedSlot && `${format(selectedSlot, 'h:mm a')} - ${format(addHours(selectedSlot, 1), 'h:mm a')}`}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBookingConfirmOpen(false)}>Cancel</Button>
            <Button onClick={handleBookingConfirm} disabled={!user}>
                {!user ? "Please log in to book" : "Confirm Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Alternatives Modal */}
      {selectedSlot && (
        <AlternativeResourcesModal
            isOpen={isAlternativesModalOpen}
            onClose={() => setAlternativesModalOpen(false)}
            resource={resource}
            timeSlot={selectedSlot}
        />
      )}
    </div>
  );
}


