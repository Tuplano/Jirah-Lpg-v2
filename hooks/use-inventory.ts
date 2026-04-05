import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStockLevels } from "@/services/inventory-service";
import { getUnmanagedSizes, initializeInventory } from "@/services/lpg-size-service";
import { toast } from "sonner";

export function useInventory() {
  return useQuery({
    queryKey: ["inventory"],
    queryFn: async () => await getStockLevels(),
  });
}

export function useUnmanagedSizes() {
  return useQuery({
    queryKey: ["unmanaged-sizes"],
    queryFn: async () => await getUnmanagedSizes(),
  });
}

export function useInitializeInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sizeId, initialFull, initialEmpty }: { sizeId: number, initialFull: number, initialEmpty: number }) => {
      return await initializeInventory(sizeId, initialFull, initialEmpty);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["unmanaged-sizes"] });
      toast.success("Size added to active stock successfully!");
    },
    onError: (error) => {
      console.error("Failed to initialize inventory:", error);
      toast.error("Failed to add size to stock. Please try again.");
    }
  });
}
