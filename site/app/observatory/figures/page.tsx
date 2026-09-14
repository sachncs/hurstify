import type {Metadata} from 'next';
import FiguresClient from './figures-client';

export const metadata: Metadata = {
  title: 'Figures / Diagnostics',
  description: 'Replicated figures with configurable parameters and PNG export.',
};

export default function FiguresPage() {
  return <FiguresClient />;
}
