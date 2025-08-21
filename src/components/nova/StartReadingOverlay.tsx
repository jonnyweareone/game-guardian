export default function StartReadingOverlay({ onStart }: { onStart: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70">
      <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl border">
        <h2 className="text-xl font-semibold mb-2">Ready to read?</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Click <b>Start reading</b> to begin. We'll enable listening and highlights after you start.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onStart}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Start reading
          </button>
        </div>
      </div>
    </div>
  );
}