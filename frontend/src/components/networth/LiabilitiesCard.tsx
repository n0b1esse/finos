import { CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/format";
import { useTranslation } from "@/lib/i18n";
import type { LiabilityItem } from "@/types";

interface LiabilitiesCardProps {
  total: string;
  items: LiabilityItem[];
  isLoading: boolean;
}

export function LiabilitiesCard({ total, items, isLoading }: LiabilitiesCardProps) {
  const { t } = useTranslation();

  const monthlyTotal = items.reduce((sum, item) => sum + Number(item.monthly_payment), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("netWorth.liabilitiesTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="py-10 text-center text-sm text-text-muted">{t("common.loading")}</p>
        ) : items.length === 0 ? (
          <p className="py-10 text-center text-sm text-text-muted">{t("netWorth.noLiabilities")}</p>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <p className="text-xl font-semibold tabular-nums text-text-primary">{formatCurrency(total)}</p>
              {monthlyTotal > 0 && (
                <p className="text-sm tabular-nums text-text-muted">
                  {t("netWorth.monthlyPaymentsTotal", { amount: formatCurrency(monthlyTotal) })}
                </p>
              )}
            </div>
            <ul className="divide-y divide-gridline">
              {items.map((item) => (
                <li key={item.credit_id} className="flex items-center gap-3 py-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-2">
                    <CreditCard size={14} className="text-text-secondary" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-text-primary">{item.name}</span>
                  <span className="shrink-0 text-sm tabular-nums text-text-primary">
                    {formatCurrency(item.remaining)}
                  </span>
                  <span className="w-24 shrink-0 text-right text-xs tabular-nums text-text-muted">
                    {formatCurrency(item.monthly_payment)}
                    {t("common.perMonth")}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
