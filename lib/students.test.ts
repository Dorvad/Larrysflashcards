import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { excludeTeacherProfile, managedStudentIds } from "./students";

describe("excludeTeacherProfile", () => {
  it("removes rows linked to the teacher profile", () => {
    const rows = [
      { id: "larry", profile_id: "larry-user" },
      { id: "dor-test", profile_id: "dor-user" },
    ];

    const filtered = excludeTeacherProfile(rows, "dor-user");

    assert.deepEqual(filtered, [{ id: "larry", profile_id: "larry-user" }]);
  });
});

describe("managedStudentIds", () => {
  it("returns student record ids", () => {
    assert.deepEqual(
      managedStudentIds([
        { id: "student-1", profileId: "larry", displayName: "Larry" },
      ]),
      ["student-1"]
    );
  });
});
