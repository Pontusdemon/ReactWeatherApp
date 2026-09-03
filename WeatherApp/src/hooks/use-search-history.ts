import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalStorage } from "./use-local-storage";

interface SearchHistoryItem {
  lat: number;
  lon: number;
  name: string;
  country: string;
  id: string;
  query: string;
  state?: string;
  searchedAt: number;
}

function normalizeHistoryItem(item: SearchHistoryItem): SearchHistoryItem {
  const parts = item.name
    .split(/\s*\|\s*/)
    .map((part) => part.trim())
    .filter((part) => part && part !== "undefined");

  const hasLegacyParts = parts.length >= 2;
  const country = hasLegacyParts ? parts[1] : item.country;
  const state = hasLegacyParts
    ? parts[2] && parts[2] !== parts[1]
      ? parts[2]
      : undefined
    : item.state !== item.country
      ? item.state
      : undefined;

  return {
    ...item,
    name: hasLegacyParts ? parts[0] : item.name,
    country,
    state,
  };
}

export function useSearchHistory() {
  const [history, setHistory] = useLocalStorage<SearchHistoryItem[]>(
    "searchHistory",
    [],
  );
  const normalizedHistory = history.map(normalizeHistoryItem);

  useEffect(() => {
    if (normalizedHistory.some((item, index) => item.name !== history[index].name || item.country !== history[index].country || item.state !== history[index].state)) {
      setHistory(normalizedHistory);
    }
  }, [history, normalizedHistory, setHistory]);

  const queryClient = useQueryClient();

  const historyQuery = useQuery({
    queryKey: ["search-History"],
    queryFn: () => normalizedHistory,
    initialData: normalizedHistory,
  });

  const addToHistory = useMutation({
    mutationFn: async (
      search: Omit<SearchHistoryItem, "id" | "searchedAt">,
    ) => {
      const newSearch: SearchHistoryItem = {
        ...search,
        id: `${search.lat}-${search.lon}-${Date.now()}`,
        searchedAt: Date.now(),
      };

      const filteredHistory = history.filter(
        (item) => !(item.lat === search.lat && item.lon === search.lon),
      );

      const newHistory = [newSearch, ...filteredHistory].slice(0, 10); // Keep only the latest 10 searches

      setHistory(newHistory);
      return newHistory;
    },
    onSuccess: (newHistory) => {
      queryClient.setQueryData(["search-History"], newHistory);
    },
  });

  const clearHistory = useMutation({
    mutationFn: async () => {
      setHistory([]);
      return [];
    },
    onSuccess: () => {
      queryClient.setQueryData(["search-History"], []);
    },
  });

  return {
    history: historyQuery.data ?? [],
    addToHistory,
    clearHistory,
  };
}
