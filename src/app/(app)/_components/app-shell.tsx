'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar, Topbar, Toasts } from '@/components/shell';
import { AppProvider, useApp } from '@/store';
import { moduleFromPathname, routeForModule } from '@/lib/routes';
import { cn } from '@/lib/utils';

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const activeModule = moduleFromPathname(pathname);

  return (
    <AppProvider key={activeModule} initialModule={activeModule}>
      <RouteSynchronizer pathname={pathname} />
      <Workspace>{children}</Workspace>
    </AppProvider>
  );
}

function RouteSynchronizer({ pathname }: Readonly<{ pathname: string | null }>) {
  const router = useRouter();
  const { module, focusId } = useApp();

  useEffect(() => {
    const moduleRoute = routeForModule(module);
    if (pathname !== moduleRoute) router.push(routeForModule(module, focusId ?? undefined));
  }, [focusId, module, pathname, router]);

  return null;
}

function Workspace({ children }: Readonly<{ children: React.ReactNode }>) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className={cn('transition-[padding] duration-200', collapsed ? 'lg:pl-[60px]' : 'lg:pl-[232px]')}>
        <Topbar onOpenMobile={() => setMobileOpen(true)} />
        <main className="mx-auto max-w-[1440px] px-4 py-5 md:px-6 md:py-6">{children}</main>
      </div>
      <Toasts />
    </div>
  );
}
