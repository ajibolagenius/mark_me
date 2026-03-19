import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Category } from "@markme/ui";
import { DEMO_DATA } from "@markme/ui";

interface CategoriesState {
  categories: Category[];
  setCategories: (cats: Category[]) => void;
  updateCategory: (cat: Category) => void;
  deleteCategory: (id: string) => void;
  addCategory: (cat: Category) => void;
}

export const useCategoriesStore = create<CategoriesState>()(
  persist(
    (set) => ({
      categories: DEMO_DATA,
      setCategories: (categories) => set({ categories }),
      updateCategory: (cat) =>
        set((s) => ({
          categories: s.categories.map((c) => (c.id === cat.id ? cat : c)),
        })),
      deleteCategory: (id) =>
        set((s) => ({
          categories: s.categories.filter((c) => c.id !== id),
        })),
      addCategory: (cat) =>
        set((s) => ({ categories: [...s.categories, cat] })),
    }),
    { name: "mm-categories" },
  ),
);
