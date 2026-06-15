import Link from 'next/link';

export default function NavBar() {
  return (
    <nav className="mb-8 rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm shadow-slate-200/80 backdrop-blur-md">
      <div className="mx-auto flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">QuantumPath</p>
          <p className="text-xs text-slate-400">Research intelligence for quantum computing</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-700">
          <Link href="/" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 transition hover:bg-slate-100">
            Home
          </Link>
          <Link href="/papers" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 transition hover:bg-slate-100">
            Papers
          </Link>
          <Link href="/routes" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 transition hover:bg-slate-100">
            Routes
          </Link>
        </div>
      </div>
    </nav>
  );
}
