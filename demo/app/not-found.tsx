import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-12 text-center">
      <h2 className="font-serif text-4xl">Not found</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        That page is not part of the observatory. Return to the dashboard.
      </p>
      <Link
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        href="/dashboard"
      >
        Go to dashboard
      </Link>
    </div>
  );
}
