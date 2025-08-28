import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { Sidebar, SidebarProvider, SidebarInset, SidebarTrigger, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Home, Calendar, Camera, Tags, Settings, Upload, Search } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Fototeca - Gestión Inteligente de Fotos',
  description: 'Una aplicación moderna para gestionar y organizar tu colección de fotos con inteligencia artificial.',
  keywords: ['fotos', 'galería', 'organización', 'IA', 'gestión de medios'],
  authors: [{ name: 'Juan Ulises' }],
  creator: 'Juan Ulises',
  publisher: 'Fototeca',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  metadataBase: new URL('https://fototeca.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://fototeca.vercel.app',
    title: 'Fototeca - Gestión Inteligente de Fotos',
    description: 'Una aplicación moderna para gestionar y organizar tu colección de fotos con inteligencia artificial.',
    siteName: 'Fototeca',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fototeca - Gestión Inteligente de Fotos',
    description: 'Una aplicación moderna para gestionar y organizar tu colección de fotos con inteligencia artificial.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
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
                    {/* Logo/Brand */}
                    <div className="flex items-center gap-2 p-2 mb-4">
                        <Camera className="h-6 w-6 text-primary" />
                        <span className="font-bold text-lg">Fototeca</span>
                    </div>
                    
                    {/* Main Navigation */}
                    <div className="flex-1">
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <Link href="/" className='w-full'>
                                    <SidebarMenuButton tooltip="Galería Principal" isActive={true}>
                                        <Home />
                                        <span>Galería</span>
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <Link href="/calendar" className='w-full'>
                                    <SidebarMenuButton tooltip="Vista Calendario">
                                        <Calendar />
                                        <span>Calendario</span>
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton tooltip="Buscar Fotos">
                                    <Search />
                                    <span>Buscar</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton tooltip="Gestionar Etiquetas">
                                    <Tags />
                                    <span>Etiquetas</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </div>
                    
                    {/* Bottom Section */}
                    <div className="border-t pt-2">
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton tooltip="Subir Fotos">
                                    <Upload />
                                    <span>Subir</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton tooltip="Configuración">
                                    <Settings />
                                    <span>Ajustes</span>
                                </SidebarMenuButton>
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
