import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllSales, recordSale } from "@/services/sales-service";
import { getAllLpgSizes } from "@/services/lpg-size-service";
import { toast } from "sonner";

export function useSales() {
  return useQuery({
    queryKey: ["sales"],
    queryFn: async () => await getAllSales(),
  });
}

export function useLpgSizes() {
  return useQuery({
    queryKey: ["lpg-sizes"],
    queryFn: async () => await getAllLpgSizes(),
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (saleData: any) => {
      return await recordSale(saleData);
    },

    onMutate: async (newSale) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ["sales"] });
      await queryClient.cancelQueries({ queryKey: ["inventory"] });

      // Snapshot the previous value
      const previousSales = queryClient.getQueryData(["sales"]);
      const previousInventory = queryClient.getQueryData(["inventory"]);

      // Optimistically update to the new value
      // Note: We'd need to mock the full sale object here for a true optimistic update
      
      return { previousSales, previousInventory };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success("Sale recorded successfully!");
    },
    onError: (err, newSale, context) => {
      // Rollback
      if (context?.previousSales) queryClient.setQueryData(["sales"], context.previousSales);
      if (context?.previousInventory) queryClient.setQueryData(["inventory"], context.previousInventory);
      toast.error("Failed to record sale.");
    },
  });
}
