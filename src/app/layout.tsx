import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { Sidebar, SidebarProvider, SidebarInset, SidebarTrigger, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Home, Calendar, Camera, Settings } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Fototeca',
  description: 'Catálogo visual de productos y planificación de contenido social.',
  keywords: ['fotos', 'galería', 'organización', 'gestión de medios'],
  authors: [{ name: 'Juan Ulises' }],
  creator: 'Juan Ulises',
  publisher: 'Fototeca',
  metadataBase: new URL('https://fototeca.vercel.app'),
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    title: 'Fototeca',
    description: 'Catálogo visual de productos y planificación de contenido social.',
    siteName: 'Fototeca',
    images: [
      {
        url: '/web-app-manifest-512x512.png',
        width: 512,
        height: 512,
        alt: 'Fototeca - Catálogo visual',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fototeca',
    description: 'Catálogo visual de productos y planificación de contenido social.',
    images: ['/web-app-manifest-512x512.png'],
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
                        </SidebarMenu>
                    </div>
                    
                    {/* Bottom Section - Solo Ajustes */}
                    <div className="border-t pt-2">
                        <SidebarMenu>
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
