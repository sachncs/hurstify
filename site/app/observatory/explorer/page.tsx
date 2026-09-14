import type {Metadata} from 'next';
import ExplorerClient from './explorer-client';

export const metadata: Metadata = {
  title: 'Parameter Explorer',
  description: 'Grid search across Hurst values, window sizes, and optimizers.',
};

export default function ExplorerPage() {
  return <ExplorerClient />;
}
