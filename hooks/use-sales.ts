import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllSales, recordSale, updateSale, deleteSale } from "@/services/sales-service";
import { getAllLpgSizes } from "@/services/lpg-size-service";
import { toast } from "sonner";

export function useSales(page: number = 1, pageSize: number = 10) {
  return useQuery({
    queryKey: ["sales", page, pageSize],
    queryFn: async () => await getAllSales(page, pageSize),
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

export function useUpdateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, saleData }: { id: number; saleData: any }) => {
      return await updateSale(id, saleData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success("Sale updated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update sale");
    }
  });
}

export function useDeleteSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      return await deleteSale(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Sale deleted successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete sale");
    }
  });
}
