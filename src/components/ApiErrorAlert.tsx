import { ApiError } from '@/api/client';

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong';
}

export function ApiErrorAlert({ error }: { error: unknown }) {
  if (!error) return null;

  const message = getErrorMessage(error);
  const details =
    error instanceof ApiError && error.details
      ? JSON.stringify(error.details, null, 2)
      : null;

  return (
    <div className="space-y-2">
      <p>{message}</p>
      {details && (
        <pre className="overflow-x-auto rounded bg-black/5 p-2 text-xs">{details}</pre>
      )}
    </div>
  );
}
