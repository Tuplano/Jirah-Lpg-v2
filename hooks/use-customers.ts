import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createCustomer,
  getAllCustomerLpgPrices,
  getAllCustomers,
  getCustomerLpgPrice,
  upsertCustomerLpgPrice,
  updateCustomer,
  deleteCustomer,
  deleteCustomerLpgPrice,
} from "@/services/customer-service";
import { toast } from "sonner";

export function useCustomers(page: number = 1, pageSize: number = 100) {
  return useQuery({
    queryKey: ["customers", page, pageSize],
    queryFn: async () => await getAllCustomers(page, pageSize),
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

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await updateCustomer(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer updated successfully.");
    },
    onError: (error) => {
      console.error("Failed to update customer:", error);
      toast.error("Failed to update customer details.");
    }
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      return await deleteCustomer(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer removed.");
    },
    onError: (error) => {
      console.error("Failed to delete customer:", error);
      toast.error("Failed to remove customer. They may have active transactions.");
    }
  });
}

export function useDeleteCustomerLpgPrice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ customerId, lpgSizeId }: { customerId: number; lpgSizeId: number }) => {
      return await deleteCustomerLpgPrice(customerId, lpgSizeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-lpg-prices"] });
      queryClient.invalidateQueries({ queryKey: ["customer-lpg-price"] });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
    onError: (error) => {
      console.error("Failed to delete custom price:", error);
      toast.error("Failed to remove custom price.");
    }
  });
}
