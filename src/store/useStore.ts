import { create } from 'zustand';

interface Page {
  id: string;
  pageNumber: number;
  content: string;
  illustrationUrl: string | null;
  illustrationPrompt: string;
  narrationUrl?: string | null;
}

interface Book {
  id: string;
  title: string;
  theme: string;
  targetAge: string;
  moral: string;
  coverUrl: string | null;
  coverPrompt: string;
  characterDescription: string;
  pages: Page[];
}

interface User {
  id: string;
  name: string;
  email: string;
  credits: number;
}

interface StoryState {
  user: User | null;
  currentBook: Book | null;
  myBooks: Book[];
  isLoading: boolean;
  error: string | null;
  
  setUser: (user: User | null) => void;
  setCurrentBook: (book: Book | null) => void;
  setMyBooks: (books: Book[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  addBook: (book: Book) => void;
  updatePage: (pageId: string, updates: Partial<Page>) => void;
}

export const useStore = create<StoryState>((set) => ({
  user: null,
  currentBook: null,
  myBooks: [],
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),
  setCurrentBook: (book) => set({ currentBook: book }),
  setMyBooks: (books) => set({ myBooks: books }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  
  addBook: (book) => set((state) => ({ myBooks: [book, ...state.myBooks] })),
  updatePage: (pageId, updates) => set((state) => {
    if (!state.currentBook) return state;
    const updatedPages = state.currentBook.pages.map(p => 
      p.id === pageId ? { ...p, ...updates } : p
    );
    return {
      currentBook: { ...state.currentBook, pages: updatedPages }
    };
  }),
}));
