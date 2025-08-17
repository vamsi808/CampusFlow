
"use client";

import * as React from 'react';
import { SectionTimetable } from "@/components/section-timetable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/hooks/use-auth';
import { allSections, getSectionTimetable } from '@/lib/data';
import type { TimetableEntry } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function TimetablePage() {
    const { user } = useAuth();
    const [selectedYear, setSelectedYear] = React.useState<string>('all');
    const [selectedDepartment, setSelectedDepartment] = React.useState<string>('all');
    const [selectedSection, setSelectedSection] = React.useState<string>('');
    const [viewingTimetable, setViewingTimetable] = React.useState<TimetableEntry[] | null>(null);

    const departments = React.useMemo(() => [...new Set(allSections.map(s => s.department))], []);
    const years = React.useMemo(() => [...new Set(allSections.map(s => s.year))].sort(), []);
    
    const filteredSections = React.useMemo(() => {
        return allSections.filter(section => {
            const yearMatch = selectedYear === 'all' || section.year === selectedYear;
            const departmentMatch = selectedDepartment === 'all' || section.department === selectedDepartment;
            return yearMatch && departmentMatch;
        });
    }, [selectedYear, selectedDepartment]);
    
     React.useEffect(() => {
        if (user?.role === 'student' && user.sectionId) {
             const studentTimetable = getSectionTimetable(user.sectionId);
             setViewingTimetable(studentTimetable);
        } else if (user?.role === 'admin' && selectedSection) {
            const adminTimetable = getSectionTimetable(selectedSection);
            setViewingTimetable(adminTimetable);
        } else {
            setViewingTimetable(null);
        }
    }, [user, selectedSection]);

    React.useEffect(() => {
        // Reset section when department or year changes
        setSelectedSection('');
    }, [selectedYear, selectedDepartment]);


    const AdminControls = () => (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 p-4 border rounded-lg bg-muted/50">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>Year: <SelectValue placeholder="Select Year" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {years.map(year => <SelectItem key={year} value={year}>{year}</SelectItem>)}
                </SelectContent>
            </Select>

            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>Department: <SelectValue placeholder="Select Department" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map(dep => <SelectItem key={dep} value={dep}>{dep}</SelectItem>)}
                </SelectContent>
            </Select>

            <Select value={selectedSection} onValueChange={setSelectedSection} disabled={filteredSections.length === 0}>
                <SelectTrigger>Section: <SelectValue placeholder="Select Section" /></SelectTrigger>
                <SelectContent>
                    {filteredSections.map(sec => <SelectItem key={sec.id} value={sec.id}>{sec.name}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>Section Timetable</CardTitle>
                <CardDescription>
                    {user?.role === 'admin' 
                        ? 'Select a year, department, and section to view its timetable.'
                        : 'Your weekly schedule of classes, labs, and events.'
                    }
                </CardDescription>
            </CardHeader>
            <CardContent>
                {user?.role === 'admin' && <AdminControls />}

                {viewingTimetable ? (
                    <SectionTimetable timetable={viewingTimetable} />
                ) : (
                    <div className="text-center text-muted-foreground py-12">
                         {user?.role === 'admin' ? "Please select a section to view its timetable." : "Loading your timetable..."}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
