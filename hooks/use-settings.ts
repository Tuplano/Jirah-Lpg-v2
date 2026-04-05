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
    mutationFn: async ({ name, price }: { name: string, price: number }) => {
      return await createLpgSize(name, price);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lpg-sizes"] });
      toast.success("New LPG size added to catalog.");
    }
  });
}
