
"use client";

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { allResources, resourceTypes, locations } from '@/lib/data';
import type { Resource } from '@/lib/types';
import { ResourceCard } from '@/components/resource-card';
import { motion, AnimatePresence } from 'framer-motion';

export default function ResourceBrowserPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState('all');
  const [locationFilter, setLocationFilter] = React.useState('all');
  const [capacityFilter, setCapacityFilter] = React.useState(0);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const filteredResources = React.useMemo(() => {
    return allResources.filter(resource => {
      const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || resource.type === typeFilter;
      const matchesLocation = locationFilter === 'all' || resource.location === locationFilter;
      const matchesCapacity = capacityFilter === 0 || resource.capacity >= capacityFilter;
      return matchesSearch && matchesType && matchesLocation && matchesCapacity;
    });
  }, [searchTerm, typeFilter, locationFilter, capacityFilter]);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Find Your Space</h1>
        <p className="mt-4 text-lg text-muted-foreground">Browse and book campus resources with ease.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 p-6 bg-card rounded-lg shadow-sm border">
        <Input
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="lg:col-span-2"
        />
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {resourceTypes.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {locations.map(location => (
              <SelectItem key={location} value={location}>{location}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isClient && (
            <AnimatePresence>
              {filteredResources.map((resource, i) => (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                >
                  <ResourceCard resource={resource} />
                </motion.div>
              ))}
            </AnimatePresence>
        )}
      </div>
      {isClient && filteredResources.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg font-medium">No resources found</p>
          <p>Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
}
