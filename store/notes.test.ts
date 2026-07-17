import { describe, it, expect, beforeEach } from "vitest";
import { useNotes } from "./notes";

describe("notes store", () => {
  beforeEach(() => {
    // Reset Zustand store state before each test
    useNotes.setState({ notes: {} });
  });

  it("should set and update a note correctly for a given slug and step/page index", () => {
    const { setNote } = useNotes.getState();
    setNote("test-lesson", 0, "My first step note");

    const state = useNotes.getState().notes;
    expect(state["test-lesson"]).toBeDefined();
    expect(state["test-lesson"]![0]).toBeDefined();
    expect(state["test-lesson"]![0]!.md).toBe("My first step note");
    expect(state["test-lesson"]![0]!.updatedAt).toBeLessThanOrEqual(Date.now());
  });

  it("should store different notes for different pages of the same lesson", () => {
    const { setNote } = useNotes.getState();
    setNote("test-lesson", 0, "Note for step 0");
    setNote("test-lesson", 1, "Note for step 1");

    const state = useNotes.getState().notes;
    expect(state["test-lesson"]![0]!.md).toBe("Note for step 0");
    expect(state["test-lesson"]![1]!.md).toBe("Note for step 1");
  });

  it("should clear specific page notes without affecting other page notes", () => {
    const { setNote, clearNote } = useNotes.getState();
    setNote("test-lesson", 0, "Note for step 0");
    setNote("test-lesson", 1, "Note for step 1");

    clearNote("test-lesson", 0);

    const state = useNotes.getState().notes;
    expect(state["test-lesson"]![0]).toBeUndefined();
    expect(state["test-lesson"]![1]!.md).toBe("Note for step 1");
  });
});
