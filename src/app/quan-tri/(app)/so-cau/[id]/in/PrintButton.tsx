'use client';

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="no-print px-4 py-2 bg-ink text-white text-sm mb-6"
    >
      In sớ
    </button>
  );
}
