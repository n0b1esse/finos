import { useEffect, useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { useAddCreditPayment } from "@/hooks/useCredits";
import { useTranslation } from "@/lib/i18n";
import type { Credit } from "@/types";

interface CreditPaymentModalProps {
  open: boolean;
  onClose: () => void;
  credit: Credit | null;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function CreditPaymentModal({ open, onClose, credit }: CreditPaymentModalProps) {
  const { t } = useTranslation();
  const addPayment = useAddCreditPayment();

  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayIso());
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setAmount("");
    setDate(todayIso());
    setNote("");
    setError(null);
  }, [open, credit]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!credit) return;
    setError(null);

    try {
      await addPayment.mutateAsync({ id: credit.id, input: { amount, date, note: note || null } });
      onClose();
    } catch {
      setError(t("credit.payment.saveError"));
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={credit ? t("credit.payment.title", { name: credit.name }) : ""}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="payment-amount">{t("credit.payment.amountLabel")}</Label>
            <Input
              id="payment-amount"
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder={t("credit.payment.amountPlaceholder")}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="payment-date">{t("credit.payment.dateLabel")}</Label>
            <Input
              id="payment-date"
              type="date"
              required
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="payment-note">{t("credit.payment.noteLabel")}</Label>
          <Input
            id="payment-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </div>
        <p className="text-xs text-text-muted">{t("credit.payment.hint")}</p>

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" disabled={addPayment.isPending}>
            {addPayment.isPending ? t("common.saving") : t("common.save")}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
