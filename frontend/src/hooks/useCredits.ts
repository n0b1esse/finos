import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addCreditPayment, createCredit, deleteCredit, fetchCredits, updateCredit } from "@/api/credits";
import type { CreditInput, CreditPaymentInput } from "@/types";

function useInvalidateCredits() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["credits"] });
    // Payments shrink the outstanding debt, which feeds the net-worth
    // summary — stale capital numbers after a payment would lie.
    queryClient.invalidateQueries({ queryKey: ["net-worth-summary"] });
  };
}

export function useCredits() {
  return useQuery({ queryKey: ["credits"], queryFn: fetchCredits });
}

export function useCreateCredit() {
  const invalidate = useInvalidateCredits();
  return useMutation({
    mutationFn: (input: CreditInput) => createCredit(input),
    onSuccess: invalidate,
  });
}

export function useUpdateCredit() {
  const invalidate = useInvalidateCredits();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<CreditInput> }) => updateCredit(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteCredit() {
  const invalidate = useInvalidateCredits();
  return useMutation({
    mutationFn: (id: number) => deleteCredit(id),
    onSuccess: invalidate,
  });
}

export function useAddCreditPayment() {
  const invalidate = useInvalidateCredits();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: CreditPaymentInput }) => addCreditPayment(id, input),
    onSuccess: invalidate,
  });
}
