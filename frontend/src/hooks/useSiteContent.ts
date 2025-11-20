import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Content, defaultSiteContent } from "@labubu/common";

export const useSiteContent = () => {
  const { data, isLoading, isFetching, error } = useQuery<Content[]>({
    queryKey: ["siteContent"],
    queryFn: () => api.content.getAll(),
    staleTime: 1000 * 60 * 5,
  });

  const contentMap = useMemo(() => {
    const entries: Record<string, string> = { ...defaultSiteContent };
    data?.forEach((entry) => {
      if (entry.key) {
        entries[entry.key] = entry.value ?? "";
      }
    });
    return entries;
  }, [data]);

  const getContent = (key: string, fallback?: string) => {
    if (contentMap[key] !== undefined && contentMap[key] !== "") {
      return contentMap[key];
    }
    if (fallback !== undefined) {
      return fallback;
    }
    return defaultSiteContent[key] ?? "";
  };

  return {
    getContent,
    contentMap,
    isLoading,
    isFetching,
    error,
  };
};
