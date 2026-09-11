import { useEffect, useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { useCreateCredit, useUpdateCredit } from "@/hooks/useCredits";
import { useTranslation, type TranslationKey } from "@/lib/i18n";
import type { Credit, CreditType } from "@/types";

interface CreditFormModalProps {
  open: boolean;
  onClose: () => void;
  credit?: Credit | null;
}

const CREDIT_TYPES: CreditType[] = ["consumer", "mortgage", "auto", "credit_card", "other"];

const EMPTY_FORM = {
  name: "",
  credit_type: "consumer" as CreditType,
  total_amount: "",
  annual_rate: "",
  monthly_payment: "",
  start_date: "",
  end_date: "",
};

export function CreditFormModal({ open, onClose, credit }: CreditFormModalProps) {
  const { t } = useTranslation();
  const createCredit = useCreateCredit();
  const updateCredit = useUpdateCredit();

  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (credit) {
      setForm({
        name: credit.name,
        credit_type: credit.credit_type,
        total_amount: credit.total_amount,
        annual_rate: credit.annual_rate,
        monthly_payment: credit.monthly_payment,
        start_date: credit.start_date ?? "",
        end_date: credit.end_date ?? "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setError(null);
  }, [open, credit]);

  const isSaving = createCredit.isPending || updateCredit.isPending;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const input = {
      name: form.name,
      credit_type: form.credit_type,
      total_amount: form.total_amount,
      annual_rate: form.annual_rate,
      monthly_payment: form.monthly_payment,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
    };

    try {
      if (credit) {
        await updateCredit.mutateAsync({ id: credit.id, input });
      } else {
        await createCredit.mutateAsync(input);
      }
      onClose();
    } catch {
      setError(t("credit.form.saveError"));
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title={credit ? t("credit.form.editTitle") : t("credit.form.newTitle")}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Label htmlFor="credit-name">{t("credit.form.nameLabel")}</Label>
          <Input
            id="credit-name"
            required
            placeholder={t("credit.form.namePlaceholder")}
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          />
        </div>

        <div>
          <Label htmlFor="credit-type">{t("credit.form.typeLabel")}</Label>
          <Select
            id="credit-type"
            value={form.credit_type}
            onChange={(event) => setForm((prev) => ({ ...prev, credit_type: event.target.value as CreditType }))}
          >
            {CREDIT_TYPES.map((type) => (
              <option key={type} value={type}>
                {t(`credit.type.${type}` as TranslationKey)}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="credit-total">{t("credit.form.totalLabel")}</Label>
            <Input
              id="credit-total"
              type="number"
              step="0.01"
              min="0.01"
              required
              value={form.total_amount}
              onChange={(event) => setForm((prev) => ({ ...prev, total_amount: event.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="credit-rate">{t("credit.form.rateLabel")}</Label>
            <Input
              id="credit-rate"
              type="number"
              step="0.01"
              min="0"
              max="100"
              required
              value={form.annual_rate}
              onChange={(event) => setForm((prev) => ({ ...prev, annual_rate: event.target.value }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="credit-monthly">{t("credit.form.monthlyLabel")}</Label>
            <Input
              id="credit-monthly"
              type="number"
              step="0.01"
              min="0.01"
              required
              value={form.monthly_payment}
              onChange={(event) => setForm((prev) => ({ ...prev, monthly_payment: event.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="credit-start">{t("credit.form.startLabel")}</Label>
            <Input
              id="credit-start"
              type="date"
              value={form.start_date}
              onChange={(event) => setForm((prev) => ({ ...prev, start_date: event.target.value }))}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="credit-end">{t("credit.form.endLabel")}</Label>
          <Input
            id="credit-end"
            type="date"
            value={form.end_date}
            onChange={(event) => setForm((prev) => ({ ...prev, end_date: event.target.value }))}
          />
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? t("common.saving") : t("common.save")}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
