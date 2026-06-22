import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, AlertTriangle, ChevronDown, Minus } from "lucide-react";
import { CRMProjectEstimation } from "./ProjectEstimationsTable";

interface FinancialBreakdownDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  companyName?: string;
  boqRows: CRMProjectEstimation[];
  bcsRows: CRMProjectEstimation[];
  /**
   * Resolved BOQ total from the detail-page tile (`Number(boq_value) || row sum`).
   * Passed in so the dialog's headline margin/total ALWAYS matches the tile that
   * opened it — never recomputed from a different denominator here.
   */
  totalValue: number;
  /** The tile's BCS-incomplete state, so the dialog mirrors the tile exactly. */
  bcsIncomplete?: boolean;
}

type Row = { name: string; boq: number | null; bcs: number | null };

const EPS = 0.005; // treat |amount| < 0.005L as break-even / zero
const inr = (v: number) =>
  (Number(v) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmt = (v: number | null) => (v == null ? "—" : `₹${inr(v)}L`);
const fmtSigned = (v: number) => `${v < 0 ? "−" : "+"}₹${inr(Math.abs(v))}L`;
const norm = (s?: string) => (s || "").trim();
// Demote extreme percentages (tiny BOQ vs large BCS) — the rupee delta is the real figure.
const pctLabel = (pct: number) => (Math.abs(pct) >= 300 ? ">300%" : `${Math.abs(pct).toFixed(1)}%`);

// A non-positive BOQ or a 0/null BCS is treated as "not entered" — no real margin.
const pkgMargin = (boq: number | null, bcs: number | null) => {
  if (boq == null || boq <= 0 || bcs == null || bcs === 0) return null;
  return (1 - bcs / boq) * 100;
};
// BOQ recorded, BCS not yet entered.
const bcsPending = (r: Row) => r.boq != null && r.boq > 0 && (r.bcs == null || r.bcs === 0);
// Cost recorded but no BOQ value — a real loss that must reconcile with the net.
const costNoValue = (r: Row) => r.bcs != null && r.bcs !== 0 && (r.boq == null || r.boq <= 0);
const costCell = (r: Row) => (r.bcs != null && r.bcs !== 0 ? fmt(r.bcs) : "—");

export const FinancialBreakdownDialog = ({
  open,
  onOpenChange,
  projectName,
  companyName,
  boqRows,
  bcsRows,
  totalValue,
  bcsIncomplete,
}: FinancialBreakdownDialogProps) => {
  // Pair each package's BOQ value with its BCS value (matched by package name).
  const packages = new Map<string, { boq: number | null; bcs: number | null }>();
  boqRows.forEach((r) => {
    const k = norm(r.package_name) || "(unnamed)";
    const cur = packages.get(k) || { boq: null, bcs: null };
    cur.boq = (cur.boq || 0) + (Number(r.value) || 0);
    packages.set(k, cur);
  });
  bcsRows.forEach((r) => {
    const k = norm(r.package_name) || "(unnamed)";
    const cur = packages.get(k) || { boq: null, bcs: null };
    cur.bcs = (cur.bcs || 0) + (Number(r.value) || 0);
    packages.set(k, cur);
  });

  const rows: Row[] = Array.from(packages.entries()).map(([name, v]) => ({ name, ...v }));
  const bcsTotal = bcsRows.reduce((s, r) => s + (Number(r.value) || 0), 0);
  const canMargin = totalValue > 0;
  const marginPercent = canMargin ? (1 - bcsTotal / totalValue) * 100 : 0;
  const netAmount = totalValue - bcsTotal;
  const breakEven = canMargin && Math.abs(netAmount) < EPS;
  const netProfit = netAmount > EPS;
  const missingBcs = rows.filter((r) => bcsPending(r) || costNoValue(r)).length;
  const showIncomplete = !!bcsIncomplete || missingBcs > 0;

  // Net-margin visual state (drives the KPI tile colour + icon).
  const net = !canMargin
    ? { bg: "bg-muted/30", text: "text-foreground", Icon: Minus }
    : showIncomplete
    ? { bg: "bg-amber-50/60 border-amber-200", text: "text-amber-700", Icon: AlertTriangle }
    : breakEven
    ? { bg: "bg-muted/30", text: "text-foreground", Icon: Minus }
    : netProfit
    ? { bg: "bg-emerald-50/60 border-emerald-200", text: "text-emerald-700", Icon: TrendingUp }
    : { bg: "bg-red-50/60 border-red-200", text: "text-red-600", Icon: TrendingDown };

  // Per-package profit/loss cell — rupee delta primary, capped % secondary.
  const renderRowMargin = (r: Row) => {
    const pct = pkgMargin(r.boq, r.bcs);
    if (pct != null) {
      const amount = (r.boq as number) - (r.bcs as number);
      const even = Math.abs(amount) < EPS;
      const Icon = even ? Minus : amount > 0 ? TrendingUp : TrendingDown;
      const tone = even ? "text-muted-foreground" : amount > 0 ? "text-emerald-700" : "text-red-600";
      return (
        <span className={cn("inline-flex items-baseline gap-1.5", tone)}>
          <Icon className="w-3.5 h-3.5 self-center" aria-label={even ? "break-even" : amount > 0 ? "profit" : "loss"} />
          <span className="font-semibold tabular-nums">{fmtSigned(amount)}</span>
          <span className="text-[11px] font-medium opacity-70 tabular-nums">{pctLabel(pct)}</span>
        </span>
      );
    }
    if (costNoValue(r)) {
      // Cost with no BOQ value — a full loss; shown so the ledger reconciles with the net.
      return (
        <span className="inline-flex items-baseline gap-1.5 text-red-600">
          <TrendingDown className="w-3.5 h-3.5 self-center" aria-label="loss" />
          <span className="font-semibold tabular-nums">{fmtSigned(-(r.bcs as number))}</span>
          <span className="text-[11px] font-medium opacity-70">no BOQ</span>
        </span>
      );
    }
    if (bcsPending(r)) return <span className="text-xs font-medium text-amber-600">BCS pending</span>;
    return <span className="text-xs font-medium text-muted-foreground">—</span>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Margin Breakdown</DialogTitle>
          <DialogDescription>
            {projectName}
            {companyName ? ` · ${companyName}` : ""}
          </DialogDescription>
        </DialogHeader>

        {/* KPI summary — three cards in one row */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="rounded-lg border bg-muted/30 p-3 min-w-0">
            <p className="text-[10px] sm:text-[11px] uppercase font-bold text-muted-foreground tracking-wide">Total BOQ</p>
            <p className="text-base sm:text-lg font-bold tabular-nums whitespace-nowrap mt-1">{fmt(totalValue)}</p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3 min-w-0">
            <p className="text-[10px] sm:text-[11px] uppercase font-bold text-muted-foreground tracking-wide">Total BCS</p>
            <p className="text-base sm:text-lg font-bold tabular-nums whitespace-nowrap mt-1">{fmt(bcsTotal)}</p>
          </div>
          <div className={cn("rounded-lg border p-3 min-w-0", net.bg)}>
            <p className="text-[10px] sm:text-[11px] uppercase font-bold text-muted-foreground tracking-wide">Net Margin</p>
            {!canMargin ? (
              <p className="text-base sm:text-lg font-bold mt-1">—</p>
            ) : showIncomplete ? (
              // BCS pending — do NOT show a percentage (it would be misleading); flag it instead.
              <p className="text-sm sm:text-base font-bold text-amber-700 inline-flex items-center gap-1.5 whitespace-nowrap mt-1">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                Missing BCS
              </p>
            ) : (
              <>
                <p className={cn("text-base sm:text-lg font-bold tabular-nums inline-flex items-center gap-1 whitespace-nowrap mt-1", net.text)}>
                  <net.Icon className="w-4 h-4 shrink-0" aria-hidden />
                  {pctLabel(marginPercent)}
                </p>
                <p className={cn("text-xs sm:text-sm font-semibold tabular-nums whitespace-nowrap opacity-80", net.text)}>
                  ({fmtSigned(netAmount)})
                </p>
              </>
            )}
          </div>
        </div>

        {showIncomplete && (
          <p className="inline-flex items-center gap-1 text-[11px] text-amber-700">
            <AlertTriangle className="w-3 h-3 shrink-0" />
            Margin not final — {missingBcs} package{missingBcs > 1 ? "s" : ""} missing BCS.
          </p>
        )}

        {/* How the margin is calculated — sits directly under Net Margin */}
        <details className="group rounded-lg bg-muted/40 px-4 py-3">
          <summary className="flex items-center justify-between cursor-pointer list-none text-[10px] uppercase font-bold text-muted-foreground tracking-wider rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
            How is margin calculated?
            <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
          </summary>
          <div className="mt-2 space-y-1">
            <p className="font-mono text-xs text-muted-foreground">Total BOQ = {fmt(totalValue)}</p>
            <p className="font-mono text-xs text-muted-foreground">Total BCS = {fmt(bcsTotal)}</p>
            <p className="font-mono text-xs text-muted-foreground">
              Margin % = ( 1 − Total BCS ÷ Total BOQ ) × 100 = {canMargin ? pctLabel(marginPercent) : "—"}
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              Net = Total BOQ − Total BCS = {canMargin ? fmtSigned(netAmount) : "—"}
            </p>
          </div>
        </details>

        {/* Package ledger — desktop table */}
        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mt-1">Packages</p>
        <div className="hidden sm:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Package</TableHead>
                <TableHead className="text-right">BOQ</TableHead>
                <TableHead className="text-right">BCS</TableHead>
                <TableHead className="text-right">Profit / Loss</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-20 text-muted-foreground">
                    No packages added yet.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r) => (
                  <TableRow key={r.name}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell className="text-right tabular-nums">{fmt(r.boq)}</TableCell>
                    <TableCell className={cn("text-right tabular-nums", bcsPending(r) && "text-amber-600")}>
                      {costCell(r)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex justify-end">{renderRowMargin(r)}</span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Package ledger — mobile stacked cards (no horizontal scroll) */}
        <div className="sm:hidden space-y-2">
          {rows.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">No packages added yet.</p>
          ) : (
            rows.map((r) => (
              <div key={r.name} className="rounded-lg border bg-card p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="min-w-0 truncate font-semibold text-sm" title={r.name}>
                    {r.name}
                  </span>
                  <span className="shrink-0 text-sm">{renderRowMargin(r)}</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground tabular-nums">
                  BOQ {fmt(r.boq)} · BCS{" "}
                  <span className={cn(bcsPending(r) && "text-amber-600")}>{costCell(r)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
