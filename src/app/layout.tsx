import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { Sidebar, SidebarProvider, SidebarInset, SidebarTrigger, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Home, Calendar } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'MediaFlow',
  description: 'Organize and manage your media files with ease.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider>
          <SidebarProvider>
            <Sidebar>
                <div className="flex flex-col h-full p-2">
                    <div className="flex-1">
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <Link href="/" className='w-full'>
                                    <SidebarMenuButton tooltip="Media Library" isActive={true}>
                                        <Home />
                                        <span>Media</span>
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                             <SidebarMenuItem>
                                <Link href="/calendar" className='w-full'>
                                    <SidebarMenuButton tooltip="Calendar">
                                        <Calendar />
                                        <span>Calendar</span>
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </div>
                </div>
            </Sidebar>
            <SidebarInset>
              <div className="p-4 md:p-6">
                {children}
              </div>
            </SidebarInset>
          </SidebarProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
