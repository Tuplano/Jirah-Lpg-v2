import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllRefills, recordReturned, recordSentBatch, deleteRefill, updateRefill } from "@/services/refill-service";
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
    mutationFn: async ({ id, dateReturned }: { id: number, dateReturned: string }) => {
      return await recordReturned(id, dateReturned);
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

export function useDeleteRefill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      return await deleteRefill(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["refills"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Refill deleted successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete refill");
    }
  });
}

export function useUpdateRefill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await updateRefill(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["refills"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Refill updated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update refill");
    }
  });
}
