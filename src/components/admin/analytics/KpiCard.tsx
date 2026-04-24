import { ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  trend?: number; // percent, positive = up
  highlight?: boolean;
  icon?: ReactNode;
}

export function KpiCard({ label, value, sub, trend, highlight, icon }: KpiCardProps) {
  const trendPos = trend !== undefined && trend > 0;
  const trendNeg = trend !== undefined && trend < 0;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:shadow-elegant ${
        highlight
          ? "bg-burgundy text-cream shadow-elegant"
          : "border border-burgundy/12 bg-cream shadow-soft"
      }`}
    >
      {/* Background decoration */}
      {highlight && (
        <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
      )}

      <div className="flex items-start justify-between gap-2">
        <p
          className={`text-[0.65rem] font-medium uppercase tracking-[0.28em] ${
            highlight ? "text-cream/70" : "text-burgundy/70"
          }`}
        >
          {label}
        </p>
        {icon && (
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-xl ${
              highlight ? "bg-white/15" : "bg-burgundy/8"
            }`}
          >
            <span className={highlight ? "text-cream" : "text-burgundy"}>{icon}</span>
          </span>
        )}
      </div>

      <p
        className={`mt-4 font-serif text-3xl font-medium tracking-tight ${
          highlight ? "text-cream" : "text-petrol"
        }`}
      >
        {value}
      </p>

      {(sub || trend !== undefined) && (
        <div className="mt-3 flex items-center gap-2">
          {trend !== undefined && (
            <span
              className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.65rem] font-semibold ${
                trendPos
                  ? highlight
                    ? "bg-white/20 text-cream"
                    : "bg-green-100 text-green-700"
                  : trendNeg
                  ? highlight
                    ? "bg-white/20 text-cream/80"
                    : "bg-red-100 text-red-600"
                  : highlight
                  ? "bg-white/15 text-cream/70"
                  : "bg-burgundy/10 text-petrol/60"
              }`}
            >
              {trendPos ? (
                <TrendingUp size={11} />
              ) : trendNeg ? (
                <TrendingDown size={11} />
              ) : (
                <Minus size={11} />
              )}
              {trendPos ? "+" : ""}
              {trend?.toFixed(1)}%
            </span>
          )}
          {sub && (
            <p
              className={`text-xs ${
                highlight ? "text-cream/60" : "text-petrol/50"
              }`}
            >
              {sub}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
