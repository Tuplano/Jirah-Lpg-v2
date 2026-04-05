import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllTransactions, getAllAdjustments } from "@/services/transactions-service";
import { toast } from "sonner";

export function useTransactions() {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: async () => await getAllTransactions(),
  });
}

export function useAdjustments() {
  return useQuery({
    queryKey: ["adjustments"],
    queryFn: async () => await getAllAdjustments(),
  });
}
