"use client";

import Link from "next/link";
import { useRef, useEffect, useState } from "react";

export function AddDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-green-600 text-white shadow-sm transition hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/60 focus:ring-offset-2 focus:ring-offset-gray-950"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Add plugin or version"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-48 origin-top-right rounded-xl border border-gray-800 bg-gray-900 shadow-xl">
          <div className="py-1">
            <Link
              href="/dashboard/plugins/new"
              className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-800 hover:text-gray-50"
              onClick={() => setOpen(false)}
            >
              New Plugin
            </Link>
            <Link
              href="/dashboard/plugins/new-version"
              className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-800 hover:text-gray-50"
              onClick={() => setOpen(false)}
            >
              New Version
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
