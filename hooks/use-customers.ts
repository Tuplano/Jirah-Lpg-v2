import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllCustomers, createCustomer } from "@/services/customer-service";
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
