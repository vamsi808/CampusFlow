
"use client";

import * as React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { 
  allResources, 
  allBookings, 
  allUsers, 
  getPendingUsers, 
  getSectionTimetable, 
  userReservations 
} from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  GraduationCap, 
  LayoutDashboard, 
  Plus, 
  Search, 
  Settings, 
  ShieldCheck, 
  TrendingUp, 
  Users 
} from 'lucide-react';
import Link from 'next/link';
import { format, isFuture, isPast } from 'date-fns';
import { ChartRoot, ChartBarRoot, ChartGrid, ChartXAxis, ChartYAxis, ChartTooltip, ChartTooltipContent, ChartBar } from '@/components/ui/chart';
import { AssistantPanel } from '@/components/assistant-panel';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading dashboard...</div>;
  }

  if (!user) {
    return <LandingHero />;
  }

  switch (user.role) {
    case 'admin':
      return <AdminDashboard user={user} />;
    case 'faculty':
      return <FacultyDashboard user={user} />;
    default:
      return <StudentDashboard user={user} />;
  }
}

function LandingHero() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8">
      <div className="space-y-4">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl bg-gradient-to-r from-primary to-purple-600 text-transparent bg-clip-text">
          CampusFlow
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          The all-in-one platform for campus resource management, scheduling, and AI-powered recommendations.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-4">
        <Button size="lg" asChild>
          <Link href="/login">Get Started</Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/signup">Create Account</Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 text-left max-w-5xl">
        <FeatureCard 
          icon={<Calendar className="text-primary" />} 
          title="Easy Booking" 
          description="Reserve study rooms, labs, and equipment in seconds with real-time availability."
        />
        <FeatureCard 
          icon={<LayoutDashboard className="text-primary" />} 
          title="Personalized View" 
          description="Get a dashboard tailored to your role, whether you're a student, faculty, or admin."
        />
        <FeatureCard 
          icon={<ShieldCheck className="text-primary" />} 
          title="AI Recommendations" 
          description="Our AI assistant helps you find alternative resources when your first choice is busy."
        />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card>
      <CardHeader>
        <div className="w-10 h-10 mb-2">{icon}</div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}

function StudentDashboard({ user }: { user: any }) {
  const reservations = userReservations(user.id);
  const upcoming = reservations.filter(r => isFuture(new Date(r.startTime)));
  const nextClass = user.sectionId ? getSectionTimetable(user.sectionId).find(e => isFuture(new Date(e.startTime))) : null;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Welcome back, {user.fullName}!</h1>
        <p className="text-muted-foreground">Here's a look at your campus life today.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5 text-primary" /> Up Next</CardTitle>
          </CardHeader>
          <CardContent>
            {nextClass ? (
              <div className="flex items-center justify-between p-4 border rounded-lg bg-primary/5 border-primary/20">
                <div>
                  <p className="font-semibold text-lg">{nextClass.subjectName}</p>
                  <p className="text-sm text-muted-foreground">{format(new Date(nextClass.startTime), 'EEEE, h:mm a')} • Room {nextClass.roomId}</p>
                </div>
                <Button variant="ghost" asChild>
                  <Link href="/timetable">View Timetable <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground">No more classes scheduled for today.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span>Upcoming Bookings</span>
              <Badge>{upcoming.length}</Badge>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>Section</span>
              <Badge variant="outline">{user.section || 'N/A'}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcoming.length > 0 ? upcoming.slice(0, 3).map(r => (
                <div key={r.id} className="flex justify-between items-center text-sm p-3 border rounded-md">
                  <div>
                    <p className="font-medium">{r.title}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(r.startTime), 'MMM d, h:mm a')}</p>
                  </div>
                  <Button variant="outline" size="sm" asChild><Link href="/reservations">Details</Link></Button>
                </div>
              )) : <p className="text-sm text-muted-foreground">You have no upcoming reservations.</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Button variant="secondary" className="h-20 flex flex-col gap-2" asChild>
              <Link href="/resources">
                <Search className="w-5 h-5" />
                <span>Book a Room</span>
              </Link>
            </Button>
            <Button variant="secondary" className="h-20 flex flex-col gap-2" asChild>
              <Link href="/timetable">
                <CalendarIcon className="w-5 h-5" />
                <span>View Schedule</span>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      <AssistantPanel />
    </div>
  );
}

function FacultyDashboard({ user }: { user: any }) {
  const allB = allBookings;
  const facultyBookings = allB.filter(b => b.userId === user.id);
  
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Faculty Portal: {user.fullName}</h1>
        <p className="text-muted-foreground">Manage your classes and resources.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Resource Utilization</CardTitle>
            <CardDescription>Track your booked lab and auditorium hours.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ChartRoot config={{ total: { label: 'Hours', color: 'hsl(var(--primary))' } }}>
                <ChartBarRoot data={[
                  { name: 'Mon', total: 4 },
                  { name: 'Tue', total: 6 },
                  { name: 'Wed', total: 2 },
                  { name: 'Thu', total: 8 },
                  { name: 'Fri', total: 5 },
                ]}>
                  <ChartGrid vertical={false} />
                  <ChartXAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                  <ChartYAxis hide />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartBar dataKey="total" radius={4} fill="var(--color-total)" />
                </ChartBarRoot>
              </ChartRoot>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">My Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{facultyBookings.length}</div>
              <p className="text-xs text-muted-foreground">Active reservations</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Department</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-semibold">{user.department}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>My Reserved Equipment/Spaces</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {facultyBookings.length > 0 ? facultyBookings.map(b => (
                <div key={b.id} className="flex items-center gap-4 p-3 border rounded-md">
                  <div className="p-2 bg-primary/10 rounded-full"><ShieldCheck className="w-4 h-4 text-primary" /></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{b.title}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(b.startTime), 'PPp')}</p>
                  </div>
                </div>
              )) : <p className="text-sm text-muted-foreground text-center py-4">No active reservations.</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Faculty Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/resources">
                <Plus className="mr-2 h-4 w-4" /> Book Research Lab
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/resources">
                <Plus className="mr-2 h-4 w-4" /> Reserve Auditorium
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/timetable">
                <CalendarIcon className="mr-2 h-4 w-4" /> My Teaching Schedule
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AdminDashboard({ user }: { user: any }) {
  const pendingUsers = getPendingUsers();
  const totalResources = allResources.length;
  const totalBookings = allBookings.length;
  const totalUsers = allUsers.length;

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">Admin Command Center</h1>
          <p className="text-muted-foreground">System overview and administrative controls.</p>
        </div>
        <Button asChild>
          <Link href="/admin/settings"><Settings className="mr-2 h-4 w-4" /> System Settings</Link>
        </Button>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Users" value={totalUsers} icon={<Users className="w-4 h-4" />} color="text-blue-600" />
        <StatsCard title="Total Resources" value={totalResources} icon={<LayoutDashboard className="w-4 h-4" />} color="text-green-600" />
        <StatsCard title="Total Bookings" value={totalBookings} icon={<CheckCircle2 className="w-4 h-4" />} color="text-purple-600" />
        <StatsCard title="Pending Approvals" value={pendingUsers.length} icon={<UserPlus className="w-4 h-4" />} color="text-orange-600" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Overview of the latest system interactions.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ChartRoot config={{ bookings: { label: 'Bookings', color: 'hsl(var(--chart-2))' } }}>
                <ChartBarRoot data={[
                  { name: '01/05', bookings: 12 },
                  { name: '02/05', bookings: 18 },
                  { name: '03/05', bookings: 15 },
                  { name: '04/05', bookings: 22 },
                  { name: '05/05', bookings: 30 },
                ]}>
                  <ChartGrid vertical={false} />
                  <ChartXAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                  <ChartYAxis hide />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartBar dataKey="bookings" radius={4} fill="var(--color-bookings)" />
                </ChartBarRoot>
              </ChartRoot>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Pending Approvals</CardTitle>
              <Button variant="link" asChild><Link href="/admin/approvals">View All</Link></Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingUsers.length > 0 ? pendingUsers.slice(0, 4).map(u => (
                <div key={u.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">{u.fullName?.[0]}</div>
                    <div>
                      <p className="text-sm font-medium">{u.fullName}</p>
                      <p className="text-xs text-muted-foreground capitalize">{u.role} • {u.department}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" asChild><Link href="/admin/approvals"><ArrowRight className="w-4 h-4" /></Link></Button>
                </div>
              )) : <div className="text-center py-8">
                    <CheckCircle2 className="w-12 h-12 text-muted/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">All caught up! No pending requests.</p>
                  </div>}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover:bg-muted/50 transition-colors">
          <Link href="/admin">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><ShieldCheck className="w-5 h-5" /> Manage Resources</CardTitle>
              <CardDescription>Add, edit, or delete campus facilities.</CardDescription>
            </CardHeader>
          </Link>
        </Card>
        <Card className="hover:bg-muted/50 transition-colors">
          <Link href="/admin/sections">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><GraduationCap className="w-5 h-5" /> Academic Sections</CardTitle>
              <CardDescription>Configure departments, years, and class sections.</CardDescription>
            </CardHeader>
          </Link>
        </Card>
        <Card className="hover:bg-muted/50 transition-colors">
          <Link href="/admin/settings">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Settings className="w-5 h-5" /> Global Settings</CardTitle>
              <CardDescription>System maintenance and global policies.</CardDescription>
            </CardHeader>
          </Link>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={color}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
