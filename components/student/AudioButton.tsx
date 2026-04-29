"use client";

import { useState, useRef } from "react";
import { Play, Pause } from "lucide-react";

export function AudioButton({
  url,
  label,
  variant = "primary",
}: {
  url: string;
  label: string;
  variant?: "primary" | "ghost";
}) {
  const [playing, setPlaying] = useState(false);
  const ref = useRef<HTMLAudioElement>(null);

  function toggle() {
    if (!ref.current) return;
    playing ? ref.current.pause() : ref.current.play();
    setPlaying(!playing);
  }

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 min-h-[44px] text-sm font-semibold transition-all active:scale-[0.96] ${
          variant === "primary"
            ? "bg-sky-500 text-white active:bg-sky-700 shadow-md shadow-sky-200/50"
            : "text-sky-600 bg-sky-50 border border-sky-200 active:bg-sky-100"
        }`}
      >
        {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        {label}
      </button>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={ref} src={url} onEnded={() => setPlaying(false)} className="hidden" />
    </>
  );
}
