
"use client";

import Link from 'next/link';
import {
  Bell,
  Building,
  CalendarDays,
  Home,
  Menu,
  Settings,
  User,
  Shield,
  LogOut,
  UserPlus
} from 'lucide-react';

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { userNotifications } from '@/lib/data';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';

const navLinks = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/reservations', label: 'My Reservations', icon: CalendarDays },
];

const adminLinks = [
    { href: '/admin', label: 'Admin', icon: Shield },
];

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="container mx-auto flex h-16 items-center px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Building className="h-6 w-6 text-primary" />
            <span>CampusFlow</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 ml-10">
          {user && navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
          {user?.role === 'admin' && adminLinks.map(link => (
             <Link
             key={link.href}
             href={link.href}
             className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
           >
             {link.label}
           </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-4">
          {user ? (
            <>
            <Popover>
                <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary/90"></span>
                    </span>
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                <div className="grid gap-4">
                    <div className="space-y-2">
                    <h4 className="font-medium leading-none">Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                        You have {userNotifications.length} new messages.
                    </p>
                    </div>
                    <div className="grid gap-2">
                    {userNotifications.map((notification) => (
                        <div
                        key={notification.id}
                        className="grid grid-cols-[25px_1fr] items-start pb-4 last:pb-0"
                        >
                        <span className="flex h-2 w-2 translate-y-1 rounded-full bg-primary" />
                        <div className="grid gap-1">
                            <p className="text-sm font-medium">{notification.title}</p>
                            <p className="text-sm text-muted-foreground">{notification.description}</p>
                            <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(notification.date, { addSuffix: true })}
                            </p>
                        </div>
                        </div>
                    ))}
                    </div>
                </div>
                </PopoverContent>
            </Popover>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatarUrl || `https://i.pravatar.cc/150?u=${user.id}`} alt="User avatar" />
                    <AvatarFallback>{user ? user.username.substring(0,2).toUpperCase() : 'G'}</AvatarFallback>
                    </Avatar>
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.fullName || user.username}</p>
                        <p className="text-xs leading-none text-muted-foreground capitalize">
                            {user.role}
                        </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href="/profile">
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            </>
          ) : (
            <div className='hidden md:flex items-center gap-2'>
                <Button variant="outline" asChild>
                    <Link href="/login">
                        <User className="mr-2 h-4 w-4" />
                        Login
                    </Link>
                </Button>
                <Button asChild>
                    <Link href="/signup">
                         <UserPlus className="mr-2 h-4 w-4" />
                        Sign Up
                    </Link>
                </Button>
            </div>
          )}


          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
                <nav className="grid gap-6 text-lg font-medium mt-8">
                {user ? (
                    <>
                    {navLinks.map(link => (
                        <SheetClose asChild key={link.href}>
                            <Link
                            href={link.href}
                            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                            >
                                <link.icon className="h-5 w-5" />
                                {link.label}
                            </Link>
                        </SheetClose>
                    ))}
                    {user.role === 'admin' && adminLinks.map(link => (
                        <SheetClose asChild key={link.href}>
                            <Link
                                href={link.href}
                                className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                            >
                                <link.icon className="h-5 w-5" />
                                {link.label}
                            </Link>
                        </SheetClose>
                    ))}
                    </>
                ): (
                    <>
                    <SheetClose asChild>
                         <Link href="/login" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                            <User className="h-5 w-5" />
                            Login
                        </Link>
                    </SheetClose>
                    <SheetClose asChild>
                        <Link href="/signup" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                            <UserPlus className="h-5 w-5" />
                            Sign Up
                        </Link>
                    </SheetClose>
                    </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
