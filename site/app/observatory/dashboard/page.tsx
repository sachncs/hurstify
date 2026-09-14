import type {Metadata} from 'next';
import DashboardClient from './dashboard-client';

export const metadata: Metadata = {
  title: 'Real-Time Estimation',
  description:
    'Generate a synthetic path, run a sliding-window estimate, and inspect diagnostics.',
};

export default function DashboardPage() {
  return <DashboardClient />;
}
