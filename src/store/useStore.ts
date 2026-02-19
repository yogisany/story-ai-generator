import { create } from 'zustand';
import { supabase } from '../lib/supabase';

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
  phoneNumber?: string;
  avatarUrl?: string | null;
  role: 'admin' | 'user';
  credits: number;
}

interface BrandSettings {
  name: string;
  tagline: string;
  logoUrl: string;
}

interface StoryState {
  user: User | null;
  brandSettings: BrandSettings;
  currentBook: Book | null;
  myBooks: Book[];
  isLoading: boolean;
  error: string | null;
  
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  updateBrand: (updates: Partial<BrandSettings>) => void;
  setCurrentBook: (book: Book | null) => void;
  setMyBooks: (books: Book[]) => void;
  fetchBooks: () => Promise<void>;
  fetchBrandSettings: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  addBook: (book: Book) => void;
  updatePage: (pageId: string, updates: Partial<Page>) => void;
}

export const useStore = create<StoryState>((set, get) => ({
  user: null,
  brandSettings: {
    name: 'Kisah Ai',
    tagline: 'by Erna',
    logoUrl: 'https://storage.googleapis.com/generativeai-downloads/images/sfx-logo.png'
  },
  currentBook: null,
  myBooks: [],
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),
  updateUser: (updates) => set((state) => ({
    user: state.user ? { ...state.user, ...updates } : null
  })),
  updateBrand: (updates) => set((state) => ({
    brandSettings: { ...state.brandSettings, ...updates }
  })),
  setCurrentBook: (book) => set({ currentBook: book }),
  setMyBooks: (books) => set({ myBooks: books }),
  
  fetchBrandSettings: async () => {
    try {
      const { data, error } = await supabase
        .from('brand_settings')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        set({
          brandSettings: {
            name: data.name,
            tagline: data.tagline,
            logoUrl: data.logo_url
          }
        });
      }
    } catch (err) {
      // Ignore error if table doesn't exist yet, fallback to defaults
      console.log("Brand settings not found or table missing");
    }
  },

  fetchBooks: async () => {
    const { user } = get();
    if (!user) return;
    
    set({ isLoading: true });
    try {
      const { data: books, error: booksError } = await supabase
        .from('books')
        .select(`
          *,
          pages (*)
        `)
        .order('created_at', { ascending: false });

      if (booksError) throw booksError;
      set({ myBooks: books || [] });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

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
