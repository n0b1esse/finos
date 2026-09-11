import { CreditCard, Pencil, PiggyBank, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { useTranslation, type TranslationKey } from "@/lib/i18n";
import type { Credit } from "@/types";

interface CreditListProps {
  items: Credit[];
  onPay: (credit: Credit) => void;
  onEdit: (credit: Credit) => void;
  onDelete: (credit: Credit) => void;
}

export function CreditList({ items, onPay, onEdit, onDelete }: CreditListProps) {
  const { t } = useTranslation();

  if (items.length === 0) {
    return <p className="py-10 text-center text-sm text-text-muted">{t("credit.empty")}</p>;
  }

  return (
    <ul className="divide-y divide-gridline">
      {items.map((credit) => {
        const paid = Number(credit.paid_total);
        const total = Number(credit.total_amount);
        const remaining = Number(credit.remaining);
        const monthly = Number(credit.monthly_payment);
        const fillPercent = Math.min(100, credit.percent);

        return (
          <li key={credit.id} className="py-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-2">
                <CreditCard size={16} className="text-text-secondary" />
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-text-primary">{credit.name}</span>
              <span className="shrink-0 text-sm tabular-nums text-text-primary">
                {formatCurrency(paid)} <span className="text-text-muted">/ {formatCurrency(total)}</span>
              </span>
              <span className="flex shrink-0 gap-1">
                {!credit.is_paid && (
                  <button
                    type="button"
                    aria-label={t("credit.payLabel")}
                    onClick={() => onPay(credit)}
                    className="rounded-md p-1.5 text-text-muted hover:bg-surface-2 hover:text-success"
                  >
                    <PiggyBank size={15} />
                  </button>
                )}
                <button
                  type="button"
                  aria-label={t("common.edit")}
                  onClick={() => onEdit(credit)}
                  className="rounded-md p-1.5 text-text-muted hover:bg-surface-2 hover:text-text-primary"
                >
                  <Pencil size={15} />
                </button>
                <button
                  type="button"
                  aria-label={t("common.delete")}
                  onClick={() => onDelete(credit)}
                  className="rounded-md p-1.5 text-text-muted hover:bg-surface-2 hover:text-danger"
                >
                  <Trash2 size={15} />
                </button>
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2 pl-12">
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                <span
                  className="block h-full rounded-full bg-success"
                  style={{ width: `${fillPercent}%` }}
                />
              </span>
              <span className="w-10 shrink-0 text-right text-xs tabular-nums text-text-muted">
                {credit.percent.toFixed(0)}%
              </span>
            </div>
            <p className="mt-1 pl-12 text-xs" style={{ color: credit.is_paid ? "var(--success)" : "var(--text-muted)" }}>
              {credit.is_paid
                ? t("credit.paidOff")
                : `${t(`credit.type.${credit.credit_type}` as TranslationKey)} · ${t("credit.remaining", { amount: formatCurrency(remaining) })} · ${credit.annual_rate}% · ${formatCurrency(monthly)}${t("common.perMonth")}`}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
