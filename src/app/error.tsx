'use client';
import Link from 'next/link';
import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-white px-4">
      <div className="max-w-md text-center">
        <h1 className="text-6xl font-bold text-rose-600">500</h1>
        <p className="mt-4 text-xl text-gray-700">Something went wrong</p>
        <p className="mt-2 text-gray-500 text-sm">Error: {error.message || 'Unknown error'}{error.digest ? ` (ref: ${error.digest})` : ''}</p>
        <div className="mt-6 flex gap-3 justify-center">
          <button onClick={reset} className="px-6 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700">Try again</button>
          <Link href="/" className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Go home</Link>
        </div>
        <a href="mailto:support@talkytools.com?subject=Error%20Report" className="mt-4 inline-block text-sm text-indigo-600 underline">Report this issue</a>
      </div>
    </div>
  );
}
