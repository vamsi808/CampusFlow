
"use client";

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { allResources } from '@/lib/data';
import { ResourceCard } from '@/components/resource-card';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { Building, Filter, Search } from 'lucide-react';
import { AssistantPanel } from '@/components/assistant-panel';

export default function ResourceBrowserPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState('all');
  const [locationFilter, setLocationFilter] = React.useState('all');
  const [capacityFilter, setCapacityFilter] = React.useState(0);
  const [isClient, setIsClient] = React.useState(false);
  const { user } = useAuth();

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const availableResources = React.useMemo(() => {
    if (!isClient) return [];
    
    if (!user) {
      return allResources.filter(resource => resource.resourceFor === 'student');
    }
    return allResources.filter(resource => resource.resourceFor === user.role);
  }, [user, isClient]);

  const filteredResources = React.useMemo(() => {
    return availableResources.filter(resource => {
      const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || resource.type === typeFilter;
      const matchesLocation = locationFilter === 'all' || resource.location === locationFilter;
      const matchesCapacity = capacityFilter === 0 || resource.capacity >= capacityFilter;
      return matchesSearch && matchesType && matchesLocation && matchesCapacity;
    });
  }, [searchTerm, typeFilter, locationFilter, capacityFilter, availableResources]);

  const uniqueTypes = React.useMemo(() => [...new Set(availableResources.map(r => r.type))], [availableResources]);
  const uniqueLocations = React.useMemo(() => [...new Set(availableResources.map(r => r.location))], [availableResources]);

  return (
    <div className="space-y-8">
      <div className="text-center p-8 bg-card border rounded-lg shadow-sm">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl bg-gradient-to-r from-primary to-purple-500 text-transparent bg-clip-text">Find Your Perfect Space</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">Browse, discover, and book campus resources with ease. Your ideal study spot, lab, or practice room is just a few clicks away.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 p-4 bg-card rounded-lg shadow-sm border">
        <div className="relative lg:col-span-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by resource name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger>
            <div className="flex items-center gap-2"><Filter className="h-4 w-4" /> <SelectValue placeholder="Filter by type" /></div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {uniqueTypes.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger>
            <div className="flex items-center gap-2"><Building className="h-4 w-4" /> <SelectValue placeholder="Filter by location" /></div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {uniqueLocations.map(location => (
              <SelectItem key={location} value={location}>{location}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <AnimatePresence>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isClient && filteredResources.map((resource, i) => (
            <motion.div
              key={resource.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <ResourceCard resource={resource} />
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {isClient && filteredResources.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg font-medium">No resources found</p>
          <p>Try adjusting your search or filters.</p>
        </div>
      )}

      {isClient && user?.role === 'student' && <AssistantPanel />}
    </div>
  );
}
