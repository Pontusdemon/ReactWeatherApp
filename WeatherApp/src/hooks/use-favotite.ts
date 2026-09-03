import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalStorage } from "./use-local-storage";
import { cleanLocationName } from "@/lib/utils";

interface FavoriteCity {
  lat: number;
  lon: number;
  name: string;
  country: string;
  id: string;
  state?: string;
  AddedAt: number;
}

export function useFavorite() {
  const [favorites, setFavorites] = useLocalStorage<FavoriteCity[]>(
    "favorites",
    [],
  );
  const normalizedFavorites = favorites.map((favorite) => ({
    ...favorite,
    name: cleanLocationName(favorite.name),
  }));

  useEffect(() => {
    if (normalizedFavorites.some((favorite, index) => favorite.name !== favorites[index].name)) {
      setFavorites(normalizedFavorites);
    }
  }, [favorites, normalizedFavorites, setFavorites]);

  const queryClient = useQueryClient();

  const favoriteQuery = useQuery({
    queryKey: ["favorites"],
    queryFn: () => normalizedFavorites,
    initialData: normalizedFavorites,
    staleTime: Infinity,
  });

  const addFavorite = useMutation({
    mutationFn: async (city: Omit<FavoriteCity, "id" | "AddedAt">) => {
      const newFavorite: FavoriteCity = {
        ...city,
        id: `${city.lat}-${city.lon}`,
        AddedAt: Date.now(),
      };
      const exists = normalizedFavorites.some((fav) => fav.id === newFavorite.id);
      if (exists) return normalizedFavorites;

      const newFavorites = [...normalizedFavorites, newFavorite].slice(0, 10); // Keep only the latest 10 searches

      setFavorites(newFavorites);
      return newFavorites;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["favorites"],
      });
    },
  });

  const removeFavorite = useMutation({
    mutationFn: async (cityId: string) => {
      const newFavorites = normalizedFavorites.filter((city) => city.id !== cityId);
      setFavorites(newFavorites);
      return newFavorites;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["favorites"],
      });
    },
  });

  return {
    favorites: favoriteQuery.data ?? [],
    addFavorite,
    removeFavorite,
    isFavorite: (lat: number, lon: number) =>
      favorites.some((city) => city.lat === lat && city.lon === lon),
  };
}
