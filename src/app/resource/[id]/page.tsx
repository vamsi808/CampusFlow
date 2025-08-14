import { allResources } from '@/lib/data';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, MapPin, Info } from 'lucide-react';
import { ScheduleViewer } from '@/components/schedule-viewer';

interface ResourcePageProps {
  params: {
    id: string;
  };
}

export default function ResourcePage({ params }: ResourcePageProps) {
  const resource = allResources.find((r) => r.id === params.id);

  if (!resource) {
    notFound();
  }

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-1 space-y-6">
        <Card className="overflow-hidden">
          <div className="relative h-64 w-full">
            <Image
              src={resource.imageUrl}
              alt={resource.name}
              fill
              className="object-cover"
              data-ai-hint="modern library"
            />
          </div>
          <CardHeader>
            <Badge variant="outline" className="w-fit mb-2">{resource.type}</Badge>
            <CardTitle className="text-2xl">{resource.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary" />
              <span>{resource.location}</span>
            </div>
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <span>Up to {resource.capacity} people</span>
            </div>
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-primary mt-1" />
              <p>{resource.description}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Book a Time Slot</CardTitle>
            <CardDescription>Select a date and an available time to make a reservation.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScheduleViewer resource={resource} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
