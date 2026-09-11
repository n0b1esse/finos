import { useState } from "react";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CreditList } from "@/components/credits/CreditList";
import { CreditFormModal } from "@/components/credits/CreditFormModal";
import { CreditPaymentModal } from "@/components/credits/CreditPaymentModal";
import { useCredits, useDeleteCredit } from "@/hooks/useCredits";
import { formatCurrency } from "@/lib/format";
import { useTranslation } from "@/lib/i18n";
import type { Credit } from "@/types";

export function CreditsPage() {
  const { t } = useTranslation();
  const { data: credits, isLoading } = useCredits();
  const deleteCredit = useDeleteCredit();

  const [formOpen, setFormOpen] = useState(false);
  const [editingCredit, setEditingCredit] = useState<Credit | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [payingCredit, setPayingCredit] = useState<Credit | null>(null);

  function openCreateModal() {
    setEditingCredit(null);
    setFormOpen(true);
  }

  function openEditModal(credit: Credit) {
    setEditingCredit(credit);
    setFormOpen(true);
  }

  function openPaymentModal(credit: Credit) {
    setPayingCredit(credit);
    setPaymentOpen(true);
  }

  function handleDelete(credit: Credit) {
    if (window.confirm(t("credit.confirmDelete", { name: credit.name }))) {
      deleteCredit.mutate(credit.id);
    }
  }

  const totalOutstanding = (credits ?? []).reduce((sum, credit) => sum + Number(credit.remaining), 0);

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>
            {t("nav.credits")}
            {totalOutstanding > 0 && (
              <span className="ml-2 text-sm font-normal tabular-nums text-text-muted">
                {t("credit.totalDebt", { amount: formatCurrency(totalOutstanding) })}
              </span>
            )}
          </CardTitle>
          <Button onClick={openCreateModal}>
            <Plus size={16} />
            {t("common.add")}
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="py-10 text-center text-sm text-text-muted">{t("common.loading")}</p>
          ) : (
            <CreditList
              items={credits ?? []}
              onPay={openPaymentModal}
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>

      <CreditFormModal open={formOpen} onClose={() => setFormOpen(false)} credit={editingCredit} />
      <CreditPaymentModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        credit={payingCredit}
      />
    </div>
  );
}
