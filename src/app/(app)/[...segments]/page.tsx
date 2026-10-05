import { ModuleView } from '../_components/module-view';
import { moduleFromPathname } from '@/lib/routes';

type PageProps = { params: Promise<{ segments: string[] }> };

export default async function ModulePage({ params }: PageProps) {
  const { segments } = await params;
  const module = moduleFromPathname(`/${segments.join('/')}`);
  return <ModuleView module={module} />;
}
