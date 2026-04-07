import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllLpgSizes, createLpgSize, updateLpgSize } from "@/services/lpg-size-service";
import { toast } from "sonner";

export function useLpgSizes() {
  return useQuery({
    queryKey: ["lpg-sizes"],
    queryFn: async () => await getAllLpgSizes(),
  });
}

export function useCreateLpgSize() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, price, size }: { name: string, price: number; size: number }) => {
      return await createLpgSize(name, price, size);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lpg-sizes"] });
      toast.success("New LPG size added to catalog.");
    },
    onError: (error) => {
      console.error("Failed to create LPG size:", error);
      toast.error("Failed to add LPG size. Please try again.");
    }
  });
}

export function useUpdateLpgSize() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name, price, size }: { id: number; name: string; price: number; size: number }) => {
      return await updateLpgSize(id, { name, price, size });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lpg-sizes"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["refills"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["unmanaged-sizes"] });
      toast.success("LPG size updated successfully.");
    },
    onError: (error) => {
      console.error("Failed to update LPG size:", error);
      toast.error("Failed to update LPG size. Please try again.");
    }
  });
}
