import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllRefills, recordReturned, recordSentBatch } from "@/services/refill-service";
import { toast } from "sonner";

export function useRefills() {
  return useQuery({
    queryKey: ["refills"],
    queryFn: async () => await getAllRefills(),
  });
}

export function useRecordReturned() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, dateReturned, cost }: { id: number, dateReturned: string, cost?: number }) => {
      return await recordReturned(id, dateReturned, cost);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["refills"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success("Refill return recorded successfully!");
    }
  });
}

export function useRecordSentBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      return await recordSentBatch(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["refills"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Refills recorded successfully!");
    }
  });
}
