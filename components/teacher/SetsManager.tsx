"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import type { WordSet } from "@/types/database";

const PRESET_COLORS = [
  "#1a6fd4", "#4d7f4a", "#c8853a", "#9c27b0",
  "#e91e63", "#009688", "#795548", "#607d8b",
];

interface SetsManagerProps {
  sets: WordSet[];
  teacherId: string;
}

export function SetsManager({ sets: initialSets, teacherId }: SetsManagerProps) {
  const router = useRouter();
  const supabase = createClient();

  const [sets, setSets] = useState(initialSets);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editColor, setEditColor] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);

    const { data, error } = await supabase
      .from("word_sets")
      .insert({
        name: newName.trim(),
        description: newDesc.trim() || null,
        color: newColor,
        created_by: teacherId,
        sort_order: sets.length,
      })
      .select("*")
      .single<WordSet>();

    setAdding(false);
    if (!error && data) {
      setSets([...sets, data]);
      setNewName("");
      setNewDesc("");
      router.refresh();
    }
  }

  function startEdit(set: WordSet) {
    setEditId(set.id);
    setEditName(set.name);
    setEditDesc(set.description ?? "");
    setEditColor(set.color);
  }

  async function handleSaveEdit(id: string) {
    setSaving(true);
    const { data, error } = await supabase
      .from("word_sets")
      .update({
        name: editName.trim(),
        description: editDesc.trim() || null,
        color: editColor,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single<WordSet>();

    setSaving(false);
    if (!error && data) {
      setSets(sets.map((s) => (s.id === id ? data : s)));
      setEditId(null);
      router.refresh();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this lesson? Words in it won't be deleted.")) return;
    await supabase.from("word_sets").delete().eq("id", id);
    setSets(sets.filter((s) => s.id !== id));
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Existing sets */}
      <div className="flex flex-col gap-3">
        {sets.map((set) =>
          editId === set.id ? (
            <div key={set.id} className="bg-white rounded-2xl shadow-card p-5 flex flex-col gap-3">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Lesson name"
              />
              <Input
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder="Description (optional)"
              />
              <div className="flex gap-2 flex-wrap">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setEditColor(c)}
                    className={`w-9 h-9 rounded-full border-4 transition-transform ${
                      editColor === c
                        ? "border-gray-600 scale-110"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: c }}
                    aria-label={`Color ${c}`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  size="md"
                  onClick={() => handleSaveEdit(set.id)}
                  loading={saving}
                >
                  Save
                </Button>
                <Button
                  size="md"
                  variant="ghost"
                  onClick={() => setEditId(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div
              key={set.id}
              className="bg-white rounded-2xl shadow-card px-5 py-4 flex items-center gap-3"
            >
              <Badge color={set.color}>{set.name}</Badge>
              {set.description && (
                <p className="text-base text-gray-500 flex-1 truncate">
                  {set.description}
                </p>
              )}
              <div className="flex gap-2 ml-auto">
                <button
                  onClick={() => startEdit(set)}
                  className="text-base text-sky-600 hover:underline min-h-[44px] px-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(set.id)}
                  className="text-base text-red-500 hover:underline min-h-[44px] px-2"
                >
                  Delete
                </button>
              </div>
            </div>
          )
        )}
      </div>

      {sets.length === 0 && (
        <p className="text-center text-gray-400 text-lg py-6">
          No lessons yet — add one below.
        </p>
      )}

      {/* Add new set */}
      <form
        onSubmit={handleAdd}
        className="bg-white rounded-2xl shadow-card p-5 flex flex-col gap-3"
      >
        <h3 className="text-lg font-semibold text-gray-700">Add a lesson</h3>
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Lesson name (e.g. Greetings)"
          required
        />
        <Input
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
          placeholder="Description (optional)"
        />
        <div className="flex gap-2 flex-wrap">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setNewColor(c)}
              className={`w-9 h-9 rounded-full border-4 transition-transform ${
                newColor === c ? "border-gray-600 scale-110" : "border-transparent"
              }`}
              style={{ backgroundColor: c }}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>
        <Button type="submit" loading={adding} size="lg">
          Create lesson
        </Button>
      </form>
    </div>
  );
}
