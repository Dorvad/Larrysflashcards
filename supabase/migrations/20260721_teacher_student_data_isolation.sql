-- Keep teacher dashboards accurate: teachers must not have student records.
-- Also removes any mistaken test data where a teacher profile was linked as a student.

CREATE OR REPLACE FUNCTION public.enforce_student_profile_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = NEW.profile_id AND role = 'teacher'
  ) THEN
    RAISE EXCEPTION 'A teacher profile cannot be linked as a student record';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS students_enforce_profile_role ON public.students;
CREATE TRIGGER students_enforce_profile_role
  BEFORE INSERT OR UPDATE OF profile_id ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.enforce_student_profile_role();

DELETE FROM public.practice_sessions ps
USING public.students s
JOIN public.profiles p ON p.id = s.profile_id
WHERE ps.student_id = s.id
  AND p.role = 'teacher';

DELETE FROM public.reviews r
USING public.students s
JOIN public.profiles p ON p.id = s.profile_id
WHERE r.student_id = s.id
  AND p.role = 'teacher';

DELETE FROM public.students s
USING public.profiles p
WHERE s.profile_id = p.id
  AND p.role = 'teacher';
