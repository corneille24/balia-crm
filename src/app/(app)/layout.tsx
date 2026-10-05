import { AppShell } from './_components/app-shell';

export default function ApplicationLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AppShell>{children}</AppShell>;
}
