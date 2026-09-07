import {Skeleton} from '@/components/ui/skeleton';
import {cn} from '@/lib/utils';

export function ChartSkeleton({
  height = 320,
  className,
}: {
  height?: number;
  className?: string;
}) {
  return (
    <div
      className={cn('flex w-full flex-col gap-3', className)}
      style={{height}}
      aria-hidden="true"
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-12" />
      </div>
      <Skeleton className="h-full w-full rounded-md" />
      <div className="flex justify-between">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}
