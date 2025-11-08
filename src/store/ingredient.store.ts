import {
    createIngredient,
    deleteIngredient,
    getIngredients
} from "@/src/actions/ingredients";
import { IIngredient } from "@/src/types/ingredient";
import { create } from "zustand";

interface IngredientState {
    ingredients: IIngredient[];
    isLoading: boolean;
    error: string | null;
    loadIngredients: () => Promise<void>;
    addIngredient: (formData: FormData) => Promise<void>;
    removeIngredient: (id: string) => Promise<void>;
}

export const useIngredientStore = create<IngredientState>((set) => ({
    ingredients: [],
    isLoading: false,
    error: null,

    loadIngredients: async () => {
        set({ isLoading: true, error: null });

        try {
            const result = await getIngredients();

            if (result.success) {
                set({ ingredients: result.ingredients, isLoading: false });
            } else {
                // Ensure error is string
                const errMsg =
                    typeof result.error === "string" ? result.error : "Error while loading ingredients";
                set({ error: errMsg, isLoading: false });
            }
        } catch (error) {
            console.error("error", error);
            const errMsg = error instanceof Error ? error.message : "Error while loading ingredients";
            set({ error: errMsg, isLoading: false });
        }
    },

    addIngredient: async (formData) => {
        set({ error: null });

        try {
            const result = await createIngredient(formData);

            if (result.success) {
                set((state) => ({
                    ingredients: [...state.ingredients, result.ingredient],
                    isLoading: false
                }));
            } else {
                const errMsg =
                    typeof result.error === "string" ? result.error : "Error while adding ingredient";
                set({ error: errMsg, isLoading: false });
            }
        } catch (error) {
            console.error("error", error);
            const errMsg = error instanceof Error ? error.message : "Error while adding ingredient";
            set({ error: errMsg, isLoading: false });
        }
    },

    removeIngredient: async (id: string) => {
        set({ error: null });

        try {
            const result = await deleteIngredient(Number(id));

            if (result.success) {
                set((state) => ({
                    ingredients: state.ingredients.filter(
                        (ingredient) => ingredient.id !== Number(id)
                    ),
                    isLoading: false
                }));
            } else {
                const errMsg =
                    typeof result.error === "string" ? result.error : "Error while deleting ingredient";
                set({ error: errMsg, isLoading: false });
            }
        } catch (error) {
            console.error("error", error);
            const errMsg = error instanceof Error ? error.message : "Error while deleting ingredient";
            set({ error: errMsg, isLoading: false });
        }
    }
}));
