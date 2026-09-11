import { api } from "@/api/client";
import type { Credit, CreditInput, CreditPaymentInput } from "@/types";

export function fetchCredits() {
  return api.get<Credit[]>("/credits");
}

export function createCredit(input: CreditInput) {
  return api.post<Credit>("/credits", input);
}

export function updateCredit(id: number, input: Partial<CreditInput>) {
  return api.patch<Credit>(`/credits/${id}`, input);
}

export function deleteCredit(id: number) {
  return api.delete<void>(`/credits/${id}`);
}

export function addCreditPayment(id: number, input: CreditPaymentInput) {
  return api.post<Credit>(`/credits/${id}/payments`, input);
}
