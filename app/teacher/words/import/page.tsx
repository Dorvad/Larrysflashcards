"use client";

import { useState, useRef, useTransition, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, FileText, CheckCircle, AlertCircle, Download } from "lucide-react";
import { importWords } from "@/app/actions/words";
import type { ImportRow, ImportResult } from "@/app/actions/words";

// ── CSV parser ────────────────────────────────────────────────────────────────
// Handles comma and tab delimiters, quoted fields, and UTF-8 Hebrew text.
function parseDelimited(text: string): string[][] {
  const lines = text.split(/\r?\n/);
  const delimiter = (lines[0]?.includes("\t") ?? false) ? "\t" : ",";
  const result: string[][] = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    const cols: string[] = [];
    let inQuote = false;
    let cur = "";
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuote && line[i + 1] === '"') { cur += '"'; i++; }
        else inQuote = !inQuote;
      } else if (ch === delimiter && !inQuote) {
        cols.push(cur.trim());
        cur = "";
      } else {
        cur += ch;
      }
    }
    cols.push(cur.trim());
    result.push(cols);
  }
  return result;
}

const COLUMNS = [
  { key: "hebrew",        label: "hebrew",         required: true  },
  { key: "hebrewNiqqud", label: "hebrew_niqqud",   required: false },
  { key: "transliteration",label: "transliteration",required: false },
  { key: "english",       label: "meaning_en",      required: true  },
  { key: "exampleHebrew", label: "example_he",      required: false },
  { key: "exampleEnglish",label: "example_en",      required: false },
  { key: "category",      label: "category",        required: false },
  { key: "difficulty",    label: "difficulty",      required: false },
  { key: "teacherNote",   label: "teacher_notes",   required: false },
] as const;

const TEMPLATE_HEADER = COLUMNS.map((c) => c.label).join(",");
const TEMPLATE_EXAMPLE = [
  "שָׁלוֹם", "שלום", "shalom", "hello / peace",
  "שָׁלוֹם חֲבֵרִים", "Hello friends", "Greetings", "easy", "",
].join(",");
const TEMPLATE_CONTENT = `${TEMPLATE_HEADER}\n${TEMPLATE_EXAMPLE}\n`;

function downloadTemplate() {
  const blob = new Blob([TEMPLATE_CONTENT], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "vocabulary_template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function mapRowToImportRow(headers: string[], cells: string[]): ImportRow {
  const get = (label: string) => cells[headers.indexOf(label)]?.trim() ?? "";
  return {
    hebrew:         get("hebrew"),
    hebrewNiqqud:  get("hebrew_niqqud") || undefined,
    transliteration:get("transliteration") || undefined,
    english:        get("meaning_en"),
    exampleHebrew: get("example_he") || undefined,
    exampleEnglish:get("example_en") || undefined,
    category:       get("category") || undefined,
    difficulty:     get("difficulty") || undefined,
    teacherNote:    get("teacher_notes") || undefined,
  };
}

function isRowValid(row: ImportRow) {
  return Boolean(row.hebrew?.trim() && row.english?.trim());
}

type Phase = "upload" | "preview" | "done";

export default function ImportPage() {
  const [phase, setPhase]           = useState<Phase>("upload");
  const [rows, setRows]             = useState<ImportRow[]>([]);
  const [filename, setFilename]     = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [result, setResult]         = useState<ImportResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPending, startTransition]= useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    if (!file) return;
    setParseError(null);
    setFilename(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const grid = parseDelimited(text);
        if (grid.length < 2) {
          setParseError("The file appears to be empty or has only a header row.");
          return;
        }
        const headers = grid[0].map((h) => h.toLowerCase().replace(/\s+/g, "_"));
        if (!headers.includes("hebrew") || !headers.includes("meaning_en")) {
          setParseError(
            'Missing required columns. The file must have "hebrew" and "meaning_en" headers.'
          );
          return;
        }
        const parsed = grid.slice(1).map((cells) => mapRowToImportRow(headers, cells));
        setRows(parsed);
        setPhase("preview");
      } catch {
        setParseError("Couldn't read this file. Make sure it's a valid CSV or TSV.");
      }
    };
    reader.readAsText(file, "UTF-8");
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  function handleImport() {
    const validRows = rows.filter(isRowValid);
    startTransition(async () => {
      const res = await importWords(validRows);
      setResult(res);
      setPhase("done");
    });
  }

  const validCount   = rows.filter(isRowValid).length;
  const invalidCount = rows.length - validCount;

  // ── Done ─────────────────────────────────────────────────────────────────
  if (phase === "done" && result) {
    return (
      <div>
        <Link
          href="/teacher/words"
          className="inline-flex items-center gap-2 text-base text-gray-500 min-h-[48px] mb-8 -ml-1 px-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back to words
        </Link>

        <div className="max-w-md mx-auto text-center flex flex-col items-center gap-6 py-8">
          {result.imported > 0 ? (
            <CheckCircle className="w-16 h-16 text-emerald-400" />
          ) : (
            <AlertCircle className="w-16 h-16 text-rose-400" />
          )}

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {result.imported > 0 ? "Import complete" : "Nothing imported"}
            </h1>
            {result.imported > 0 && (
              <p className="text-lg text-gray-500 mt-1">
                {result.imported} word{result.imported === 1 ? "" : "s"} added to Larry&apos;s vocabulary.
              </p>
            )}
          </div>

          {result.errors.length > 0 && (
            <div className="w-full bg-rose-50 border border-rose-200 rounded-2xl p-4 text-left">
              <p className="text-sm font-semibold text-rose-700 mb-2">
                {result.errors.length} row{result.errors.length === 1 ? "" : "s"} skipped
              </p>
              <ul className="text-sm text-rose-600 space-y-1 max-h-40 overflow-y-auto">
                {result.errors.map((err, i) => (
                  <li key={i}>
                    {err.row > 0 ? `Row ${err.row}: ` : ""}{err.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Link
              href="/teacher/words"
              className="flex-1 bg-sky-500 text-white text-base font-semibold rounded-xl py-4 text-center min-h-[52px] flex items-center justify-center active:bg-sky-700"
            >
              View all words
            </Link>
            <button
              onClick={() => { setPhase("upload"); setRows([]); setResult(null); setFilename(""); }}
              className="flex-1 bg-white text-gray-700 border border-gray-200 text-base font-semibold rounded-xl py-4 min-h-[52px] active:bg-gray-50"
            >
              Import another file
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Preview ───────────────────────────────────────────────────────────────
  if (phase === "preview") {
    return (
      <div>
        <Link
          href="/teacher/words"
          className="inline-flex items-center gap-2 text-base text-gray-500 min-h-[48px] mb-6 -ml-1 px-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back to words
        </Link>

        <div className="flex items-center gap-3 mb-1">
          <FileText className="w-5 h-5 text-sky-500 shrink-0" />
          <h1 className="text-2xl font-bold text-gray-900">Review before importing</h1>
        </div>
        <p className="text-base text-gray-500 mb-6 ml-8">{filename}</p>

        {/* Summary chips */}
        <div className="flex flex-wrap gap-3 mb-6">
          <span className="px-4 py-2 bg-emerald-50 text-emerald-700 text-sm font-semibold rounded-full border border-emerald-200">
            {validCount} ready to import
          </span>
          {invalidCount > 0 && (
            <span className="px-4 py-2 bg-rose-50 text-rose-700 text-sm font-semibold rounded-full border border-rose-200">
              {invalidCount} will be skipped (missing required fields)
            </span>
          )}
        </div>

        {/* Preview table — show first 10 rows */}
        <div className="overflow-x-auto rounded-2xl border border-gray-200 mb-6">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-8">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Hebrew</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">English</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Transliteration</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Category</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.slice(0, 10).map((row, i) => {
                const valid = isRowValid(row);
                return (
                  <tr key={i} className={valid ? "bg-white" : "bg-rose-50/50"}>
                    <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3 font-medium" dir="rtl" lang="he"
                        style={{ fontFamily: "'Noto Serif Hebrew', serif" }}>
                      {row.hebrew || <span className="text-rose-400 italic">missing</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {row.english || <span className="text-rose-400 italic">missing</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-400 italic hidden sm:table-cell">
                      {row.transliteration}
                    </td>
                    <td className="px-4 py-3 text-gray-400 hidden md:table-cell">
                      {row.category || "Lesson words"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {valid
                        ? <CheckCircle className="w-4 h-4 text-emerald-400 inline" />
                        : <AlertCircle className="w-4 h-4 text-rose-400 inline" />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {rows.length > 10 && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-400 text-center">
              …and {rows.length - 10} more rows
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleImport}
            disabled={validCount === 0 || isPending}
            className="flex-1 bg-sky-500 text-white text-base font-semibold rounded-xl py-4 min-h-[52px] disabled:opacity-50 active:bg-sky-700 transition-colors"
          >
            {isPending
              ? "Importing…"
              : `Import ${validCount} word${validCount === 1 ? "" : "s"}`}
          </button>
          <button
            onClick={() => { setPhase("upload"); setRows([]); setFilename(""); }}
            disabled={isPending}
            className="flex-1 bg-white text-gray-700 border border-gray-200 text-base font-semibold rounded-xl py-4 min-h-[52px] active:bg-gray-50"
          >
            Choose a different file
          </button>
        </div>
      </div>
    );
  }

  // ── Upload ────────────────────────────────────────────────────────────────
  return (
    <div>
      <Link
        href="/teacher/words"
        className="inline-flex items-center gap-2 text-base text-gray-500 min-h-[48px] mb-6 -ml-1 px-1"
      >
        <ArrowLeft className="w-4 h-4" /> Back to words
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">Import from CSV</h1>
      <p className="text-base text-gray-500 mb-8">
        Upload a spreadsheet to add many words at once.
      </p>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all mb-6 ${
          isDragging
            ? "border-sky-400 bg-sky-50"
            : "border-gray-200 bg-gray-50 active:bg-gray-100"
        }`}
      >
        <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-base font-semibold text-gray-700">
          Drop your CSV or TSV file here
        </p>
        <p className="text-sm text-gray-400 mt-1">or tap to choose a file</p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.tsv,.txt"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {parseError && (
        <div className="mb-6 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <p className="text-sm text-rose-700">{parseError}</p>
        </div>
      )}

      {/* Column guide */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
        <p className="text-sm font-semibold text-gray-700 mb-3">Required column headers (first row)</p>
        <div className="flex flex-wrap gap-2">
          {COLUMNS.map((col) => (
            <span
              key={col.key}
              className={`text-xs font-mono px-2.5 py-1 rounded-lg ${
                col.required
                  ? "bg-sky-100 text-sky-700 font-bold"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {col.label}
              {col.required && " *"}
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">
          * Required. All other columns are optional. Invalid categories default to &quot;Lesson words&quot;.
          Accepts comma-separated (.csv) or tab-separated (.tsv) files.
        </p>
      </div>

      {/* Template download */}
      <button
        onClick={downloadTemplate}
        className="inline-flex items-center gap-2 text-sm text-sky-600 font-semibold min-h-[44px]"
      >
        <Download className="w-4 h-4" />
        Download template
      </button>
    </div>
  );
}
