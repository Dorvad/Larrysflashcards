"use client";

import { useState, useRef } from "react";
import { Mic, Play, Pause, Upload, X, Square } from "lucide-react";

interface AudioUploaderProps {
  label: string;
  existingUrl?: string;
  onBlobChange: (blob: Blob | null) => void;
  onClear: () => void;
}

export function AudioUploader({
  label,
  existingUrl,
  onBlobChange,
  onClear,
}: AudioUploaderProps) {
  const [mode, setMode] = useState<"idle" | "recording">("idle");
  const [localBlob, setLocalBlob] = useState<Blob | null>(null);
  const [localUrl, setLocalUrl] = useState<string | null>(null);
  const [hasExisting, setHasExisting] = useState(Boolean(existingUrl));
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeUrl = localUrl ?? (hasExisting ? existingUrl : null);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setLocalBlob(blob);
        setLocalUrl(url);
        onBlobChange(blob);
        setMode("idle");
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setMode("recording");
      setRecordSeconds(0);
      timerRef.current = setInterval(
        () => setRecordSeconds((s) => s + 1),
        1000
      );
    } catch {
      alert("Microphone access denied. Please allow microphone access and try again.");
    }
  }

  function stopRecording() {
    if (timerRef.current) clearInterval(timerRef.current);
    mediaRecorderRef.current?.stop();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setLocalBlob(file);
    setLocalUrl(url);
    onBlobChange(file);
  }

  function handlePlayPause() {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  }

  function handleRemove() {
    if (localUrl) URL.revokeObjectURL(localUrl);
    setLocalBlob(null);
    setLocalUrl(null);
    setHasExisting(false);
    onBlobChange(null);
    onClear();
  }

  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-base font-medium text-gray-700">{label}</p>

      {activeUrl ? (
        <div className="flex items-center gap-3 bg-sky-50 border border-sky-100 rounded-2xl px-4 py-3">
          <button
            type="button"
            onClick={handlePlayPause}
            className="w-10 h-10 rounded-full bg-sky-500 active:bg-sky-700 flex items-center justify-center shrink-0 transition-colors"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-white" />
            ) : (
              <Play className="w-4 h-4 text-white ml-0.5" />
            )}
          </button>
          <span className="flex-1 text-sm text-sky-700 font-medium">
            {localBlob ? "New recording ready" : "Saved audio"}
          </span>
          <button
            type="button"
            onClick={handleRemove}
            className="p-2 text-gray-400 active:text-rose-500 transition-colors"
            aria-label="Remove audio"
          >
            <X className="w-4 h-4" />
          </button>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio
            ref={audioRef}
            src={activeUrl}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
        </div>
      ) : mode === "recording" ? (
        <div className="flex items-center gap-3 bg-rose-50 border border-rose-100 rounded-2xl px-4 py-3">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
          <span className="flex-1 text-sm text-rose-700 font-medium">
            Recording… {recordSeconds}s
          </span>
          <button
            type="button"
            onClick={stopRecording}
            className="flex items-center gap-1.5 bg-rose-500 active:bg-rose-700 text-white text-sm font-semibold px-4 rounded-xl min-h-[40px] transition-colors"
          >
            <Square className="w-3 h-3 fill-white" />
            Stop
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={startRecording}
            className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-600 active:bg-gray-50 min-h-[48px] transition-colors"
          >
            <Mic className="w-4 h-4 text-rose-500" />
            Record
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-600 active:bg-gray-50 min-h-[48px] transition-colors"
          >
            <Upload className="w-4 h-4 text-sky-500" />
            Upload
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}
