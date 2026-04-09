import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllTransactions, getAllAdjustments } from "@/services/transactions-service";
import { toast } from "sonner";

export function useTransactions(page: number = 1, pageSize: number = 10) {
  return useQuery({
    queryKey: ["transactions", page, pageSize],
    queryFn: async () => await getAllTransactions(page, pageSize),
  });
}

export function useAdjustments(page: number = 1, pageSize: number = 10) {
  return useQuery({
    queryKey: ["adjustments", page, pageSize],
    queryFn: async () => await getAllAdjustments(page, pageSize),
  });
}
