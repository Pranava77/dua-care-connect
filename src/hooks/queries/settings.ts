import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { settingsApi } from "@/lib/api/settings";
import { keys } from "./keys";

export const useAiSettings = (enabled = true) => useQuery({ queryKey: keys.aiSettings, queryFn: settingsApi.getAi, enabled });

/** Saving or removing the key changes every AI-backed view, so refresh them all. */
function useAiSettingsMutation<T>(fn: (input: T) => ReturnType<typeof settingsApi.getAi>) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (data) => {
      client.setQueryData(keys.aiSettings, data);
      return client.invalidateQueries({ queryKey: keys.ai });
    },
  });
}

export const useUpdateAiSettings = () =>
  useAiSettingsMutation((data: { api_key?: string; chat_model?: string }) => settingsApi.updateAi(data));

export const useRemoveAiKey = () => useAiSettingsMutation((_: void) => settingsApi.removeAiKey());
