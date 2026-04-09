import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getAllSupplierDeliveries,
  recordSupplierDelivery,
  updateSupplierDeliveryStatus,
  deleteSupplierDelivery,
} from "@/services/supplier-service";
import { toast } from "sonner";

export function useSuppliers() {
  return useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => await getAllSuppliers(),
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Parameters<typeof createSupplier>[0]) => await createSupplier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("Supplier added successfully!");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to add supplier.");
    }
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Parameters<typeof updateSupplier>[1] }) => await updateSupplier(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("Supplier updated.");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to update supplier.");
    }
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => await deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("Supplier deleted.");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to delete supplier.");
    }
  });
}

export function useSupplierDeliveries() {
  return useQuery({
    queryKey: ["supplier-deliveries"],
    queryFn: async () => await getAllSupplierDeliveries(),
  });
}

export function useRecordSupplierDelivery() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Parameters<typeof recordSupplierDelivery>[0]) => await recordSupplierDelivery(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier-deliveries"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success("Delivery recorded.");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to record delivery.");
    }
  });
}

export function useUpdateSupplierDeliveryStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: 'pending' | 'completed' | 'cancelled' }) => await updateSupplierDeliveryStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier-deliveries"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success("Delivery status updated.");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to update status.");
    }
  });
}

export function useDeleteSupplierDelivery() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => await deleteSupplierDelivery(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier-deliveries"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success("Delivery deleted.");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to delete delivery.");
    }
  });
}
