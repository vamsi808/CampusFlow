"use client";

import * as React from 'react';
import {
  addHours,
  eachHourOfInterval,
  endOfDay,
  format,
  isBefore,
  isSameHour,
  startOfDay,
  isWithinInterval,
} from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, Clock } from 'lucide-react';
import type { Resource } from '@/lib/types';
import { AlternativeResourcesModal } from './alternative-resources-modal';

interface ScheduleViewerProps {
  resource: Resource;
}

export function ScheduleViewer({ resource }: ScheduleViewerProps) {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = React.useState<Date | null>(null);
  const [isBookingConfirmOpen, setBookingConfirmOpen] = React.useState(false);
  const [isAlternativesModalOpen, setAlternativesModalOpen] = React.useState(false);
  
  const { toast } = useToast();

  const today = startOfDay(new Date());
  const selectedDate = date ? startOfDay(date) : today;

  const timeSlots = eachHourOfInterval({
    start: addHours(selectedDate, 8),
    end: addHours(selectedDate, 19),
  });

  const bookingsForDay = resource.schedule?.filter(
    (booking) => format(booking.startTime, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
  ) || [];

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
    toast({
      title: "Booking Successful!",
      description: `You have booked ${resource.name} for ${format(selectedSlot!, 'MMM d, h:mm a')}.`,
    });
    setBookingConfirmOpen(false);
    setSelectedSlot(null);
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
          {timeSlots.map((slot, i) => {
            const isPast = isBefore(slot, new Date());
            const isBooked = bookingsForDay.some(b => isSameHour(b.startTime, slot) || isWithinInterval(slot, { start: b.startTime, end: b.endTime }));

            return (
              <Button
                key={i}
                variant={isBooked ? "destructive" : "outline"}
                disabled={isPast}
                onClick={() => handleSlotClick(slot)}
                className="transition-all duration-200"
              >
                {format(slot, 'h:mm a')}
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
            <Button onClick={handleBookingConfirm}>Confirm Booking</Button>
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
