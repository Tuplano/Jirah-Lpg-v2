import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createCustomer,
  getAllCustomerLpgPrices,
  getAllCustomers,
  getCustomerLpgPrice,
  upsertCustomerLpgPrice,
} from "@/services/customer-service";
import { toast } from "sonner";

export function useCustomers() {
  return useQuery({
    queryKey: ["customers"],
    queryFn: async () => await getAllCustomers(),
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      return await createCustomer(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer added successfully!");
    }
  });
}

export function useCustomerLpgPrice(customerId?: number, lpgSizeId?: number) {
  return useQuery({
    queryKey: ["customer-lpg-price", customerId, lpgSizeId],
    queryFn: async () => {
      if (!customerId || !lpgSizeId) {
        return null;
      }

      return await getCustomerLpgPrice(customerId, lpgSizeId);
    },
    enabled: Boolean(customerId && lpgSizeId),
  });
}

export function useCustomerLpgPrices() {
  return useQuery({
    queryKey: ["customer-lpg-prices"],
    queryFn: async () => await getAllCustomerLpgPrices(),
  });
}

export function useUpsertCustomerLpgPrice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { customer_id: number; lpg_size_id: number; price: number }) => {
      return await upsertCustomerLpgPrice(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-lpg-prices"] });
      queryClient.invalidateQueries({ queryKey: ["customer-lpg-price"] });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      toast.success("Customer price saved.");
    },
    onError: (error) => {
      console.error("Failed to save customer LPG price:", error);
      toast.error("Failed to save customer price.");
    }
  });
}
