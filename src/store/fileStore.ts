import { create } from "zustand";

interface FileState {
  resume: File | null;
  coverLetter: File | null;
  setResume: (file: File | null) => void; // a user can remove the file as well
  setCoverLetter: (file: File | null) => void; // same as above
}

// Intentionally NOT wrapped in zustand's `persist` middleware — File/Blob
// objects can't be JSON-serialized into localStorage, and even if they
// could, persisting an actual resume file to browser storage would be a
// questionable thing to do. This store lives in memory only and is lost
// on refresh by design
export const useFileStore = create<FileState>()((set) => ({
  resume: null,
  coverLetter: null,
  setResume: (file) => set({ resume: file }),
  setCoverLetter: (file) => set({ coverLetter: file }),
}));
