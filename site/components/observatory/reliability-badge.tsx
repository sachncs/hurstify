import {cn} from '@/lib/utils';
import {StatusBadge} from './status-badge';

type Reliability = 'reliable' | 'marginal' | 'unreliable';

const label: Record<Reliability, string> = {
  reliable: 'Reliable',
  marginal: 'Marginal',
  unreliable: 'Unreliable',
};

const tone: Record<Reliability, 'success' | 'warning' | 'destructive'> = {
  reliable: 'success',
  marginal: 'warning',
  unreliable: 'destructive',
};

/**
 * Derives a coarse reliability signal from the diagnostics a single-window
 * estimator already computes.
 *
 *   reliable   — KS test rejects (p<0.05) AND |bias| < 0.05
 *   marginal   — KS test rejects AND |bias| < 0.10
 *   unreliable — KS test fails to reject, OR |bias| ≥ 0.10
 */
export function deriveReliability(opts: {
  significant?: boolean | null;
  bias?: number | null;
}): Reliability {
  const {significant, bias} = opts;
  if (
    significant === false ||
    (typeof bias === 'number' && Math.abs(bias) >= 0.1)
  ) {
    return 'unreliable';
  }
  if (
    significant === true &&
    typeof bias === 'number' &&
    Math.abs(bias) < 0.05
  ) {
    return 'reliable';
  }
  return 'marginal';
}

export function ReliabilityBadge({
  reliability,
  className,
}: {
  reliability: Reliability;
  className?: string;
}) {
  return (
    <StatusBadge
      label={label[reliability]}
      tone={tone[reliability]}
      className={className}
    />
  );
}
