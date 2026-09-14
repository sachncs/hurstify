import type {Metadata} from 'next';
import ObservatoryClient from './observatory-client';

export const metadata: Metadata = {
  title: 'Observatory · Overview',
  description:
    'Real-time estimation, parameter sweeps, and diagnostic figures for the Hurst parameter.',
};

export default function ObservatoryOverviewPage() {
  return <ObservatoryClient />;
}
