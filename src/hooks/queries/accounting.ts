import { useMutation, useQuery } from "@tanstack/react-query";
import { accountingApi, type InvoiceInput, type PaymentInput } from "@/lib/api/accounting";
import { keys, useInvalidate } from "./keys";

export const useInvoices = (enabled = true) =>
  useQuery({ queryKey: keys.invoices, queryFn: () => accountingApi.listInvoices(), enabled });

export const useFinancialStats = (enabled = true) =>
  useQuery({ queryKey: keys.financialStats, queryFn: accountingApi.stats, enabled });

const invoiceFamilies = [keys.invoices, keys.financialStats, keys.payments];

export function useCreateInvoice() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (data: InvoiceInput) => accountingApi.createInvoice(data), onSuccess: () => invalidate(...invoiceFamilies) });
}

export function useUpdateInvoice() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InvoiceInput> }) => accountingApi.updateInvoice(id, data),
    onSuccess: () => invalidate(...invoiceFamilies),
  });
}

export function useDeleteInvoice() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (id: string) => accountingApi.removeInvoice(id), onSuccess: () => invalidate(...invoiceFamilies) });
}

export function useRecordPayment() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (data: PaymentInput) => accountingApi.recordPayment(data), onSuccess: () => invalidate(...invoiceFamilies) });
}
