/**
 * ModificationHistory Component
 *
 * Displays the complete modification history for an order as a
 * vertical step timeline. Each step is collapsed by default and
 * shows a compact summary; expanding reveals a clean diff of what
 * changed — including when the SAME product had its variant swapped
 * (e.g. Red/M → Blue/L) rather than being added/removed outright.
 */
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getModificationHistory,
  ModificationHistoryEntry,
} from "../../api/order";
import { Button } from "../../components/ui/button";
import {
  ArrowLeft,
  Package,
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  Loader2,
  AlertCircle,
  History,
  Plus,
  Minus as MinusIcon,
  Pencil,
  Repeat,
  ChevronsUpDown,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { format, formatDistanceToNow } from "date-fns";

interface ProductLike {
  productId?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  variation?: { color?: string; size?: string };
}

type ProductDiffEntry =
  | { kind: "added"; product: ProductLike }
  | { kind: "removed"; product: ProductLike }
  | {
      kind: "changed";
      name: string;
      variation?: string;
      before: { quantity: number; unitPrice: number };
      after: { quantity: number; unitPrice: number };
    }
  | {
      kind: "variantChanged";
      name: string;
      beforeVariation: string;
      afterVariation: string;
      beforeQty: number;
      afterQty: number;
      beforePrice: number;
      afterPrice: number;
    };

const variationLabel = (p: ProductLike) => {
  const parts = [];
  if (p.variation?.color) parts.push(p.variation.color);
  if (p.variation?.size) parts.push(p.variation.size);
  return parts.join(" / ");
};

// Key includes the variant so two different variants of the same
// product are treated as distinct line items, not merged into one.
const productKey = (p: ProductLike) =>
  `${p.productId || p.name}__${p.variation?.color || ""}__${
    p.variation?.size || ""
  }`;

const diffProducts = (
  oldList: ProductLike[] = [],
  newList: ProductLike[] = [],
): ProductDiffEntry[] => {
  const oldMap = new Map(oldList.map((p) => [productKey(p), p]));
  const newMap = new Map(newList.map((p) => [productKey(p), p]));

  const removed: ProductLike[] = [];
  const added: ProductLike[] = [];
  const changed: Extract<ProductDiffEntry, { kind: "changed" }>[] = [];

  for (const [key, oldP] of oldMap) {
    const newP = newMap.get(key);
    if (!newP) {
      removed.push(oldP);
    } else if (
      oldP.quantity !== newP.quantity ||
      oldP.unitPrice !== newP.unitPrice
    ) {
      changed.push({
        kind: "changed",
        name: newP.name,
        variation: variationLabel(newP),
        before: { quantity: oldP.quantity, unitPrice: oldP.unitPrice },
        after: { quantity: newP.quantity, unitPrice: newP.unitPrice },
      });
    }
  }
  for (const [key, newP] of newMap) {
    if (!oldMap.has(key)) added.push(newP);
  }

  // Pair up removed/added entries that share the same productId — that's
  // the same underlying product whose variant was swapped, not a
  // separate remove + add. Match by productId (falling back to name).
  const entries: ProductDiffEntry[] = [];
  const usedAdded = new Set<number>();

  for (const oldP of removed) {
    const oldMatchKey = oldP.productId || oldP.name;
    const pairIndex = added.findIndex(
      (newP, i) =>
        !usedAdded.has(i) && (newP.productId || newP.name) === oldMatchKey,
    );

    if (pairIndex !== -1) {
      const newP = added[pairIndex];
      usedAdded.add(pairIndex);
      entries.push({
        kind: "variantChanged",
        name: newP.name,
        beforeVariation: variationLabel(oldP) || "No variant",
        afterVariation: variationLabel(newP) || "No variant",
        beforeQty: oldP.quantity,
        afterQty: newP.quantity,
        beforePrice: oldP.unitPrice,
        afterPrice: newP.unitPrice,
      });
    } else {
      entries.push({ kind: "removed", product: oldP });
    }
  }

  added.forEach((newP, i) => {
    if (!usedAdded.has(i)) entries.push({ kind: "added", product: newP });
  });

  return [...entries, ...changed];
};

const formatFieldName = (field: string) =>
  field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, " $1");

const formatFieldValue = (value: any) => {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

// Plain-language, one-line summary of what happened in a step.
const summarizeStep = (
  productDiff: ProductDiffEntry[],
  otherChangesCount: number,
) => {
  const counts = { added: 0, removed: 0, changed: 0, variantChanged: 0 };
  productDiff.forEach((d) => (counts[d.kind] += 1));

  const parts: string[] = [];
  if (counts.added) parts.push(`${counts.added} added`);
  if (counts.removed) parts.push(`${counts.removed} removed`);
  if (counts.variantChanged)
    parts.push(
      `${counts.variantChanged} variant${
        counts.variantChanged > 1 ? "s" : ""
      } swapped`,
    );
  if (counts.changed)
    parts.push(
      `${counts.changed} qty/price update${counts.changed > 1 ? "s" : ""}`,
    );
  if (otherChangesCount)
    parts.push(
      `${otherChangesCount} other field${otherChangesCount > 1 ? "s" : ""}`,
    );

  if (parts.length === 0) return "No detailed changes recorded";
  return parts.join(" · ");
};

// Full plain-English sentences describing every change, written for
// someone with no technical background — no raw arrays, no jargon.
const buildNarrative = (
  productDiff: ProductDiffEntry[],
  oldTotal: number,
  newTotal: number,
): string[] => {
  const lines: string[] = [];

  productDiff.forEach((d) => {
    if (d.kind === "added") {
      const v = variationLabel(d.product);
      lines.push(
        `Added ${d.product.quantity} ${
          d.product.quantity > 1 ? "units" : "unit"
        } of "${d.product.name}"${v ? ` (${v})` : ""}.`,
      );
    } else if (d.kind === "removed") {
      const v = variationLabel(d.product);
      lines.push(
        `Removed ${d.product.quantity} ${
          d.product.quantity > 1 ? "units" : "unit"
        } of "${d.product.name}"${v ? ` (${v})` : ""} from the order.`,
      );
    } else if (d.kind === "variantChanged") {
      const qtyChanged = d.beforeQty !== d.afterQty;
      const priceChanged = d.beforePrice !== d.afterPrice;
      let sentence = `Changed "${d.name}" from ${d.beforeVariation} to ${d.afterVariation}.`;
      if (qtyChanged)
        sentence = sentence.replace(
          ".",
          `, and quantity from ${d.beforeQty} to ${d.afterQty}.`,
        );
      if (priceChanged)
        sentence = sentence.replace(
          ".",
          ` (price ৳${d.beforePrice} → ৳${d.afterPrice}).`,
        );
      lines.push(sentence);
    } else if (d.kind === "changed") {
      const v = d.variation ? ` (${d.variation})` : "";
      const qtyChanged = d.before.quantity !== d.after.quantity;
      const priceChanged = d.before.unitPrice !== d.after.unitPrice;
      if (qtyChanged && priceChanged) {
        lines.push(
          `Updated "${d.name}"${v}: quantity changed from ${d.before.quantity} to ${d.after.quantity}, and price from ৳${d.before.unitPrice} to ৳${d.after.unitPrice}.`,
        );
      } else if (qtyChanged) {
        lines.push(
          `Updated "${d.name}"${v}: quantity changed from ${d.before.quantity} to ${d.after.quantity}.`,
        );
      } else if (priceChanged) {
        lines.push(
          `Updated "${d.name}"${v}: price changed from ৳${d.before.unitPrice} to ৳${d.after.unitPrice}.`,
        );
      }
    }
  });

  const priceDiff = newTotal - oldTotal;
  if (priceDiff !== 0) {
    lines.push(
      `As a result, the order total ${
        priceDiff > 0 ? "increased" : "decreased"
      } from ৳${oldTotal} to ৳${newTotal} (${
        priceDiff > 0 ? "+" : "−"
      }৳${Math.abs(priceDiff)}).`,
    );
  } else if (lines.length > 0) {
    lines.push(`The order total stayed the same at ৳${newTotal}.`);
  }

  return lines;
};

const ModificationHistory = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState<any>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (orderId) fetchHistory();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const fetchHistory = async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      const response = await getModificationHistory(orderId);
      if (response.success && response.data) {
        setHistoryData(response.data);
        const first = response.data.modifications?.[0]?.id;
        if (first) setExpanded(new Set([first]));
      } else {
        toast.error(response.error || "Failed to load modification history");
      }
    } catch (error) {
      console.error("Error fetching history:", error);
      toast.error("Failed to load modification history");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const modifications: ModificationHistoryEntry[] =
    historyData?.modifications || [];
  const total = modifications.length;
  const allExpanded = total > 0 && expanded.size === total;

  const toggleAll = () => {
    if (allExpanded) setExpanded(new Set());
    else setExpanded(new Set(modifications.map((m) => m.id)));
  };

  const netChange = useMemo(
    () =>
      modifications.reduce((sum, m) => {
        const oldP = m.oldState?.totalPrice || 0;
        const newP = m.newState?.totalPrice || 0;
        return sum + (newP - oldP);
      }, 0),
    [modifications],
  );

  const lastModified = modifications[0]?.timestamps?.createdAt
    ? new Date(modifications[0].timestamps.createdAt)
    : null;

  const renderStep = (
    entry: ModificationHistoryEntry,
    index: number,
    isLast: boolean,
  ) => {
    const stepNumber = total - index; // oldest = step 1
    const modifiedDate = new Date(entry.timestamps.createdAt);
    const oldTotalPrice = entry.oldState?.totalPrice || 0;
    const newTotalPrice = entry.newState?.totalPrice || 0;
    const priceDiff = newTotalPrice - oldTotalPrice;
    const isOpen = expanded.has(entry.id);

    const productDiff = diffProducts(
      entry.oldState?.products || [],
      entry.newState?.products || [],
    );
    const nonProductChanges = entry.changesummary.filter(
      (c) => c.field !== "products",
    );
    const narrative = buildNarrative(productDiff, oldTotalPrice, newTotalPrice);

    return (
      <li key={entry.id} className='relative pl-12'>
        {!isLast && (
          <span
            className='absolute left-[19px] top-10 bottom-[-16px] w-px bg-slate-200'
            aria-hidden
          />
        )}
        <span
          className={`absolute left-0 top-1 flex h-10 w-10 items-center justify-center rounded-full text-[12px] font-semibold ring-4 ring-slate-50 transition-colors ${
            isOpen
              ? "bg-indigo-600 text-white"
              : "bg-white text-indigo-600 border border-slate-200"
          }`}>
          {stepNumber}
        </span>

        <div
          className={`rounded-2xl border bg-white transition-shadow ${
            isOpen
              ? "border-indigo-200 shadow-md shadow-indigo-100/50"
              : "border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300"
          }`}>
          <button
            type='button'
            onClick={() => toggleExpanded(entry.id)}
            className='w-full flex items-center gap-3 px-4 py-3.5 text-left'>
            <div className='min-w-0 flex-1'>
              <div className='flex items-center flex-wrap gap-x-2 gap-y-0.5'>
                <span className='text-sm font-semibold text-slate-900 tracking-tight truncate'>
                  {entry.performedBy.userName}
                </span>
                <span className='text-[11px] text-slate-400 truncate'>
                  {entry.performedBy.userEmail}
                </span>
              </div>
              <p className='text-xs text-slate-500 mt-0.5 truncate'>
                {summarizeStep(productDiff, nonProductChanges.length)}
              </p>
            </div>

            <div className='flex items-center gap-2 shrink-0'>
              {priceDiff !== 0 && (
                <span
                  className={`inline-flex h-6 items-center gap-1 rounded-full px-2.5 text-[11px] font-semibold ${
                    priceDiff > 0
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }`}>
                  {priceDiff > 0 ? (
                    <ArrowUpRight className='w-3 h-3' />
                  ) : (
                    <ArrowDownRight className='w-3 h-3' />
                  )}
                  ৳{Math.abs(priceDiff)}
                </span>
              )}
              <span className='hidden sm:block text-[11px] text-slate-400 w-24 text-right'>
                {formatDistanceToNow(modifiedDate, { addSuffix: true })}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  isOpen ? "rotate-180 text-indigo-600" : ""
                }`}
              />
            </div>
          </button>

          {isOpen && (
            <div className='border-t border-slate-100 px-4 py-4 space-y-5'>
              {/* {entry.reason && (
                <div className='rounded-xl bg-indigo-50/60 border border-indigo-100 px-3.5 py-2.5 text-sm text-indigo-900'>
                  {entry.reason}
                </div>
              )} */}

              {/* Plain-language explanation — written so anyone can read it,
                  no product codes or raw arrays. */}
              {narrative.length > 0 && (
                <div className='rounded-xl border border-slate-200 bg-white px-3.5 py-3'>
                  <div className='text-[11px] uppercase tracking-widest text-slate-400 font-medium mb-2'>
                    What changed
                  </div>
                  <ul className='space-y-1.5'>
                    {narrative.map((line, i) => (
                      <li
                        key={i}
                        className='flex items-start gap-2 text-sm text-slate-700 leading-relaxed'>
                        <span className='mt-2 h-1 w-1 rounded-full bg-indigo-400 shrink-0' />
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className='flex items-center gap-3 rounded-xl bg-slate-50 px-3.5 py-2.5 text-sm'>
                <span className='text-[11px] uppercase tracking-widest text-slate-400 font-medium'>
                  Order total
                </span>
                <span className='text-slate-400 line-through'>
                  ৳{oldTotalPrice}
                </span>
                <span className='text-slate-300'>→</span>
                <span className='font-semibold text-slate-900'>
                  ৳{newTotalPrice}
                </span>
                <span className='text-[11px] text-slate-500 ml-1'>
                  {format(modifiedDate, "MMM dd, yyyy · hh:mm a")}
                </span>
              </div>

              {productDiff.length > 0 && (
                <div>
                  <div className='text-[11px] uppercase tracking-widest text-slate-400 font-medium mb-2'>
                    Product changes
                  </div>
                  <div className='space-y-1.5'>
                    {productDiff.map((d, i) => {
                      if (d.kind === "variantChanged") {
                        const qtyChanged = d.beforeQty !== d.afterQty;
                        const priceChanged = d.beforePrice !== d.afterPrice;
                        return (
                          <div
                            key={i}
                            className='rounded-xl border border-violet-100 bg-violet-50/60 px-3.5 py-2.5 text-sm'>
                            <div className='flex items-center gap-2.5'>
                              <span className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-100'>
                                <Repeat className='w-3 h-3 text-violet-700' />
                              </span>
                              <span className='font-medium text-slate-900 truncate'>
                                {d.name}
                              </span>
                              <span className='ml-auto text-[11px] font-semibold text-violet-700 bg-violet-100 rounded-full px-2 py-0.5'>
                                Variant swapped
                              </span>
                            </div>
                            <div className='mt-1.5 ml-7 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600'>
                              <span className='rounded-md bg-white border border-slate-200 px-1.5 py-0.5'>
                                {d.beforeVariation}
                              </span>
                              <span className='text-slate-400'>→</span>
                              <span className='rounded-md bg-white border border-violet-200 px-1.5 py-0.5 font-medium text-violet-700'>
                                {d.afterVariation}
                              </span>
                              {qtyChanged && (
                                <span className='ml-1'>
                                  · qty {d.beforeQty} → {d.afterQty}
                                </span>
                              )}
                              {priceChanged && (
                                <span>
                                  · ৳{d.beforePrice} → ৳{d.afterPrice}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      }
                      if (d.kind === "added") {
                        return (
                          <div
                            key={i}
                            className='flex items-center gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50/60 px-3.5 py-2.5 text-sm'>
                            <span className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100'>
                              <Plus className='w-3 h-3 text-emerald-700' />
                            </span>
                            <span className='font-medium text-slate-900 truncate'>
                              {d.product.name}
                            </span>
                            <span className='text-slate-500'>
                              x{d.product.quantity}
                            </span>
                            {variationLabel(d.product) && (
                              <span className='text-xs rounded-md bg-white border border-slate-200 px-1.5 py-0.5 text-slate-500'>
                                {variationLabel(d.product)}
                              </span>
                            )}
                            <span className='ml-auto font-medium text-slate-600'>
                              ৳{d.product.unitPrice}
                            </span>
                          </div>
                        );
                      }
                      if (d.kind === "removed") {
                        return (
                          <div
                            key={i}
                            className='flex items-center gap-2.5 rounded-xl border border-red-100 bg-red-50/60 px-3.5 py-2.5 text-sm'>
                            <span className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100'>
                              <MinusIcon className='w-3 h-3 text-red-700' />
                            </span>
                            <span className='font-medium text-slate-500 truncate line-through decoration-slate-400'>
                              {d.product.name}
                            </span>
                            <span className='text-slate-400'>
                              x{d.product.quantity}
                            </span>
                            {variationLabel(d.product) && (
                              <span className='text-xs rounded-md bg-white border border-slate-200 px-1.5 py-0.5 text-slate-400'>
                                {variationLabel(d.product)}
                              </span>
                            )}
                            <span className='ml-auto font-medium text-slate-500'>
                              ৳{d.product.unitPrice}
                            </span>
                          </div>
                        );
                      }
                      return (
                        <div
                          key={i}
                          className='flex items-center gap-2.5 rounded-xl border border-amber-100 bg-amber-50/60 px-3.5 py-2.5 text-sm flex-wrap'>
                          <span className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100'>
                            <Pencil className='w-3 h-3 text-amber-700' />
                          </span>
                          <span className='font-medium text-slate-900 truncate'>
                            {d.name}
                          </span>
                          {d.variation && (
                            <span className='text-xs rounded-md bg-white border border-slate-200 px-1.5 py-0.5 text-slate-500'>
                              {d.variation}
                            </span>
                          )}
                          <span className='ml-auto flex items-center gap-2 text-xs text-slate-600 font-medium'>
                            <span>
                              qty {d.before.quantity} → {d.after.quantity}
                            </span>
                            <span className='text-slate-300'>|</span>
                            <span>
                              ৳{d.before.unitPrice} → ৳{d.after.unitPrice}
                            </span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {nonProductChanges.length > 0 && (
                <div>
                  <div className='text-[11px] uppercase tracking-widest text-slate-400 font-medium mb-2'>
                    Other changes
                  </div>
                  <div className='space-y-1.5'>
                    {nonProductChanges.map((change, idx) => (
                      <div
                        key={idx}
                        className='flex items-center gap-2.5 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm'>
                        <span className='font-medium text-slate-600 w-28 shrink-0 truncate'>
                          {formatFieldName(change.field)}
                        </span>
                        <span className='text-slate-400 truncate'>
                          {formatFieldValue(change.oldValue)}
                        </span>
                        <span className='text-slate-300 shrink-0'>→</span>
                        <span className='text-slate-900 font-medium truncate'>
                          {formatFieldValue(change.newValue)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {productDiff.length === 0 && nonProductChanges.length === 0 && (
                <p className='text-sm text-slate-400'>
                  No detailed field changes recorded for this step.
                </p>
              )}
            </div>
          )}
        </div>
      </li>
    );
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-slate-50 flex items-center justify-center'>
        <div className='text-center'>
          <Loader2 className='w-6 h-6 animate-spin text-indigo-600 mx-auto mb-3' />
          <p className='text-sm text-slate-500'>Loading history…</p>
        </div>
      </div>
    );
  }

  if (!historyData) {
    return (
      <div className='min-h-screen bg-slate-50 flex items-center justify-center px-4'>
        <div className='max-w-md w-full flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3'>
          <AlertCircle className='h-4 w-4 text-red-600 shrink-0' />
          <p className='text-sm text-red-800'>
            Failed to load modification history. Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-slate-50'>
      {/* Top bar */}
      <div className='sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-200'>
        <div className='max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4'>
          <Button
            variant='outline'
            onClick={() => navigate("/order")}
            className='h-9 px-3 text-sm font-medium border-slate-200 rounded-lg shrink-0'>
            <ArrowLeft className='w-4 h-4 mr-1.5' />
            Orders
          </Button>
          <div className='h-6 w-px bg-slate-200 shrink-0' />
          <div className='flex items-center gap-2.5 min-w-0'>
            <div className='w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0'>
              <History className='w-4 h-4 text-white' />
            </div>
            <div className='min-w-0'>
              <h1 className='text-sm font-semibold text-slate-900 truncate'>
                Modification History
              </h1>
              <p className='text-[11px] text-slate-500 truncate'>
                Order #{modifications[0]?.orderNumber || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-3xl mx-auto px-4 sm:px-6 py-8'>
        {total === 0 ? (
          <div className='rounded-2xl border-2 border-dashed border-slate-200 bg-white py-14 text-center'>
            <div className='w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3'>
              <History className='w-6 h-6 text-slate-400' />
            </div>
            <h3 className='text-base font-semibold text-slate-700 mb-1'>
              No modifications yet
            </h3>
            <p className='text-sm text-slate-500'>
              Changes to this order will appear here as steps.
            </p>
          </div>
        ) : (
          <>
            {/* Stats strip */}
            <div className='grid grid-cols-3 gap-3 mb-6'>
              <div className='rounded-xl border border-slate-200 bg-white px-4 py-3'>
                <div className='text-[11px] uppercase tracking-widest text-slate-400 font-medium mb-1'>
                  Steps
                </div>
                <div className='text-lg font-semibold text-slate-900'>
                  {total}
                </div>
              </div>
              <div className='rounded-xl border border-slate-200 bg-white px-4 py-3'>
                <div className='text-[11px] uppercase tracking-widest text-slate-400 font-medium mb-1'>
                  Net change
                </div>
                <div
                  className={`text-lg font-semibold ${
                    netChange > 0
                      ? "text-emerald-600"
                      : netChange < 0
                        ? "text-red-600"
                        : "text-slate-900"
                  }`}>
                  {netChange > 0 ? "+" : netChange < 0 ? "−" : ""}৳
                  {Math.abs(netChange)}
                </div>
              </div>
              <div className='rounded-xl border border-slate-200 bg-white px-4 py-3'>
                <div className='text-[11px] uppercase tracking-widest text-slate-400 font-medium mb-1'>
                  Last modified
                </div>
                <div className='text-lg font-semibold text-slate-900 truncate'>
                  {lastModified
                    ? formatDistanceToNow(lastModified, { addSuffix: true })
                    : "—"}
                </div>
              </div>
            </div>

            <div className='flex justify-end mb-3'>
              <button
                type='button'
                onClick={toggleAll}
                className='inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors'>
                <ChevronsUpDown className='w-3.5 h-3.5' />
                {allExpanded ? "Collapse all" : "Expand all"}
              </button>
            </div>

            <ol className='space-y-4'>
              {modifications.map((entry, index) =>
                renderStep(entry, index, index === modifications.length - 1),
              )}
            </ol>
          </>
        )}
      </div>
    </div>
  );
};

export default ModificationHistory;
