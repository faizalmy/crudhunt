'use client';

import React, { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Activity, MoveLeft, UserPen } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Toolbar,
  ToolbarActions,
  ToolbarHeading,
  ToolbarTitle,
} from '@/app/components/toolbar';
import { UserProvider } from './components/user-context';
import UserHero from './components/user-hero';

type NavRoutes = Record<
  string,
  {
    title: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    path: string;
  }
>;

export default function UserLayout({
  params,
  children,
}: {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}) {
  // 1) Unwrap the params Promise
  const { id } = use(params);
  const pathname = usePathname();
  const router = useRouter();

  // Use local state to control active tab
  const [activeTab, setActiveTab] = useState<string>('');

  // Define your nav routes
  const navRoutes = useMemo<NavRoutes>(
    () => ({
      general: {
        title: 'Profile',
        icon: UserPen,
        path: `/cruds/user/users/${id}`,
      },
      logs: {
        title: 'Activity Logs',
        icon: Activity,
        path: `/cruds/user/users/${id}/logs`,
      },
    }),
    [id],
  );

  // Set initial active tab based on the pathname
  useEffect(() => {
    const found = Object.keys(navRoutes).find(
      (key) => pathname === navRoutes[key].path,
    );
    if (found) {
      setActiveTab(found);
    } else {
      setActiveTab('general');
    }
  }, [navRoutes, pathname]);

  const { data: user, isLoading } = useQuery({
    queryKey: ['user-user', id],
    queryFn: async () => {
      const response = await fetch(`/api/cruds/user/users/${id}`);

      if (response.status == 404) {
        router.push('/cruds/user/users');
      }

      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message);
      }

      return response.json();
    },
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60, // 60 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: 1,
  });

  // Handler for tab click: instantly update active tab then navigate.
  const handleTabClick = (key: string, path: string) => {
    setActiveTab(key);
    // Optionally, you can prefetch or delay navigation slightly if needed
    router.push(path);
  };

  return (
    <UserProvider user={user} isLoading={isLoading}>
      <Toolbar>
        <ToolbarHeading>
          <ToolbarTitle>User</ToolbarTitle>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>User Management</BreadcrumbPage>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/user/users">Users</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </ToolbarHeading>
        <ToolbarActions>
          <Button asChild variant="outline" size="sm">
            <Link href="/cruds/user/users">
              <MoveLeft /> Back to users
            </Link>
          </Button>
        </ToolbarActions>
      </Toolbar>
      <UserHero user={user} isLoading={isLoading} />
      <Tabs defaultValue={activeTab} value={activeTab}>
        <TabsList variant="line" className="mb-5">
          {Object.entries(navRoutes).map(
            ([key, { title, icon: Icon, path }]) => (
              <TabsTrigger
                key={key}
                value={key}
                disabled={isLoading}
                onClick={() => handleTabClick(key, path)}
              >
                <Icon />
                <span>{title}</span>
              </TabsTrigger>
            ),
          )}
        </TabsList>
      </Tabs>
      {children}
    </UserProvider>
  );
}
