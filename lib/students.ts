// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = { from: (table: string) => any };

export interface ManagedStudent {
  id: string;
  profileId: string;
  displayName: string;
}

interface StudentRow {
  id: string;
  profile_id: string;
  display_name: string | null;
}

/** Rows whose profile is the teacher (test accounts) must not count as students. */
export function excludeTeacherProfile<T extends { profile_id: string }>(
  rows: T[],
  teacherUserId: string
): T[] {
  return rows.filter((row) => row.profile_id !== teacherUserId);
}

/** Student records managed by this teacher, excluding the teacher's own profile. */
export async function getManagedStudents(
  supabase: SupabaseClient,
  teacherUserId: string
): Promise<ManagedStudent[]> {
  const { data, error } = await supabase
    .from("students")
    .select("id, profile_id, display_name")
    .eq("teacher_id", teacherUserId);

  if (error) throw error;

  return excludeTeacherProfile((data ?? []) as StudentRow[], teacherUserId).map((row) => ({
    id: row.id,
    profileId: row.profile_id,
    displayName: row.display_name || "Student",
  }));
}

export function managedStudentIds(students: ManagedStudent[]): string[] {
  return students.map((student) => student.id);
}

/** Restrict a query to specific students; returns null when the scope is empty. */
export function applyStudentScope<T extends { in: (column: string, values: string[]) => T }>(
  query: T,
  studentIds?: string[]
): T | null {
  if (studentIds && studentIds.length === 0) return null;
  if (studentIds) return query.in("student_id", studentIds);
  return query;
}
