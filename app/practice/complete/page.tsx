import { redirect } from "next/navigation";

export default function PracticeCompleteRedirect() {
  redirect("/student/progress");
}
