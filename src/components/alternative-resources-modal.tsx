"use client"

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { getAlternativeResources } from "@/app/actions";
import type { Resource } from "@/lib/types";
import { format } from "date-fns";
import { Lightbulb, ArrowRight, CornerDownRight } from 'lucide-react';
import { Button } from './ui/button';
import Link from 'next/link';
import { Skeleton } from './ui/skeleton';

interface AlternativeResourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: Resource;
  timeSlot: Date;
}

export function AlternativeResourcesModal({ isOpen, onClose, resource, timeSlot }: AlternativeResourcesModalProps) {
  const [recommendations, setRecommendations] = React.useState<{alternativeResources: string[], reasoning: string} | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setRecommendations(null);
      
      const fetchRecommendations = async () => {
        const result = await getAlternativeResources({
          unavailableResource: resource.name,
          preferredCapacity: resource.capacity,
          locationPreferences: resource.location,
          availableTimeSlot: format(timeSlot, "MMMM d, yyyy 'at' h:mm a"),
          purpose: 'Study or work session',
        });
        setRecommendations(result);
        setIsLoading(false);
      };
      
      fetchRecommendations();
    }
  }, [isOpen, resource, timeSlot]);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mx-auto mb-4">
              <Lightbulb className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">Resource Unavailable</DialogTitle>
          <DialogDescription className="text-center">
            {resource.name} is booked at this time. Here are some AI-powered suggestions for alternatives.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
            {isLoading && (
                <div className="space-y-4">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-8 w-1/2 mt-2" />
                </div>
            )}
            {recommendations && (
                <div>
                    <h4 className="font-semibold mb-2">Recommended Alternatives:</h4>
                    <ul className="space-y-2 list-none">
                        {recommendations.alternativeResources.map((alt, index) => (
                           <li key={index} className="font-medium text-primary">- {alt}</li>
                        ))}
                    </ul>
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground"><strong className="text-foreground">Reasoning:</strong> {recommendations.reasoning}</p>
                    </div>
                </div>
            )}
        </div>
        <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Close</Button>
            <Button asChild>
                <Link href="/">
                    Browse All Resources <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
