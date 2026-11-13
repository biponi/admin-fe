import { useCallback, useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Checkbox } from "../../components/ui/checkbox";
import { Switch } from "../../components/ui/switch";
import { Textarea } from "../../components/ui/textarea";
import { Separator } from "../../components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "../../components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { toast } from "sonner";
import { PageHeader } from "../../components/PageHeader";
import {
  Loader2,
  MoreVertical,
  Plus,
  FlaskConical,
  Trash2,
  Pencil,
  Wallet,
  MapPin,
  Sparkles,
  TrendingUp,
  CircleSlash,
  Trophy,
  Layers,
  X,
} from "lucide-react";
import {
  getPrepaymentRules,
  createPrepaymentRule,
  updatePrepaymentRule,
  deletePrepaymentRule,
  evaluatePrepaymentRules,
  type PrepaymentRule,
  type PrepaymentBasisType,
  type PrepaymentEvaluation,
} from "../../api/prepaymentRule";
import {
  getZones,
  getDivisions,
  getDistricts,
  type DeliveryZone,
  type LocationDistrict,
} from "../../api/location";
import {
  MobileActionSheet,
  MobileSkeletonList,
} from "../../components/mobile";

const BASIS_META: Record<
  PrepaymentBasisType,
  { label: string; hint: string; chip: string; bar: string }
> = {
  delivery_charge: {
    label: "Delivery charge",
    hint: "Advance = the order's delivery charge",
    chip: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800",
    bar: "bg-gradient-to-b from-sky-400 to-sky-600",
  },
  percentage: {
    label: "Percentage of order",
    hint: "Advance = % of (items + delivery charge)",
    chip: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800",
    bar: "bg-gradient-to-b from-violet-400 to-violet-600",
  },
  fixed: {
    label: "Fixed amount",
    hint: "Advance = a flat ৳ amount",
    chip: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
    bar: "bg-gradient-to-b from-emerald-400 to-emerald-600",
  },
  full_amount: {
    label: "Full amount",
    hint: "Advance = the entire order total",
    chip: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
    bar: "bg-gradient-to-b from-amber-400 to-amber-600",
  },
};

const RISK_LEVELS = [
  { value: "green", label: "Green (low risk)" },
  { value: "yellow", label: "Yellow (review)" },
  { value: "red", label: "Red (high risk)" },
] as const;

interface RuleFormState {
  name: string;
  description: string;
  active: boolean;
  priority: number;
  zones: string[];
  minOrderTotal: string;
  maxOrderTotal: string;
  riskLevels: string[];
  requireCampaignProducts: boolean;
  basisType: PrepaymentBasisType;
  basisValue: string;
  basisMin: string;
  basisMax: string;
}

const emptyForm: RuleFormState = {
  name: "",
  description: "",
  active: true,
  priority: 0,
  zones: [],
  minOrderTotal: "",
  maxOrderTotal: "",
  riskLevels: [],
  requireCampaignProducts: false,
  basisType: "delivery_charge",
  basisValue: "",
  basisMin: "",
  basisMax: "",
};

const toForm = (rule: PrepaymentRule): RuleFormState => ({
  name: rule.name,
  description: rule.description || "",
  active: rule.active,
  priority: rule.priority ?? 0,
  zones: rule.conditions?.zones ?? [],
  minOrderTotal: rule.conditions?.minOrderTotal?.toString() ?? "",
  maxOrderTotal: rule.conditions?.maxOrderTotal?.toString() ?? "",
  riskLevels: rule.conditions?.riskLevels ?? [],
  requireCampaignProducts: !!rule.conditions?.requireCampaignProducts,
  basisType: rule.basis?.type ?? "delivery_charge",
  basisValue: rule.basis?.value?.toString() ?? "",
  basisMin: rule.basis?.minAmount?.toString() ?? "",
  basisMax: rule.basis?.maxAmount?.toString() ?? "",
});

const describeConditions = (rule: PrepaymentRule): string[] => {
  const parts: string[] = [];
  if (rule.conditions?.zones?.length) parts.push(`${rule.conditions.zones.length} zone(s)`);
  if (rule.conditions?.minOrderTotal != null) parts.push(`total ≥ ৳${rule.conditions.minOrderTotal}`);
  if (rule.conditions?.maxOrderTotal) parts.push(`total ≤ ৳${rule.conditions.maxOrderTotal}`);
  if (rule.conditions?.riskLevels?.length) parts.push(`risk: ${rule.conditions.riskLevels.join("/")}`);
  if (rule.conditions?.requireCampaignProducts) parts.push("campaign products");
  return parts.length ? parts : ["always"];
};

const describeBasis = (rule: PrepaymentRule): string => {
  switch (rule.basis?.type) {
    case "delivery_charge":
      return "Delivery charge";
    case "percentage":
      return `${rule.basis.value}% of order`;
    case "fixed":
      return `৳${rule.basis.value} flat`;
    case "full_amount":
      return "Full amount";
    default:
      return "—";
  }
};

/** Effective charge for an area: override → zone charge → stored effective. */
const effectiveChargeOf = (area: LocationDistrict): number =>
  area.chargeOverride !== null && area.chargeOverride !== undefined
    ? area.chargeOverride
    : area.zone
      ? area.zone.charge
      : area.effectiveCharge || 0;

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <span className='text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500'>
    {children}
  </span>
);

const PrepaymentSettings = () => {
  const [rules, setRules] = useState<PrepaymentRule[]>([]);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PrepaymentRule | null>(null);
  const [form, setForm] = useState<RuleFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingRule, setDeletingRule] = useState<PrepaymentRule | null>(null);
  // Mobile row-action sheet target
  const [sheetRule, setSheetRule] = useState<PrepaymentRule | null>(null);

  // Test sheet — real location data (UI naming: "District" = backend division,
  // "Area" = backend district, same as LocationSettings)
  const [testOpen, setTestOpen] = useState(false);
  const [divisions, setDivisions] = useState<
    { divisionId: string; division: string; districtCount: number }[]
  >([]);
  const [testDistrict, setTestDistrict] = useState("");
  const [areas, setAreas] = useState<LocationDistrict[]>([]);
  const [areasLoading, setAreasLoading] = useState(false);
  const [testArea, setTestArea] = useState<LocationDistrict | null>(null);
  const [testPhone, setTestPhone] = useState("");
  const [testItems, setTestItems] = useState("1 x 1000");
  const [testDeliveryCharge, setTestDeliveryCharge] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<PrepaymentEvaluation | null>(null);

  const activeCount = useMemo(
    () => rules.filter((r) => r.active).length,
    [rules]
  );

  const loadRules = useCallback(async () => {
    setLoading(true);
    const response = await getPrepaymentRules({ limit: 200 });
    if (response.success && response.data) {
      setRules(response.data.rules);
    } else {
      toast.error(response.error || "Failed to load prepayment rules");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadRules();
    getZones().then((r) => {
      if (r.success && r.data) setZones(r.data);
    });
    getDivisions().then((r) => {
      if (r.success && r.data) setDivisions(r.data);
    });
  }, [loadRules]);

  // Reset test state when the sheet closes
  useEffect(() => {
    if (!testOpen) {
      setTestResult(null);
      setTesting(false);
    }
  }, [testOpen]);

  // Areas for the selected district (division)
  useEffect(() => {
    setTestArea(null);
    setTestDeliveryCharge("");
    setTestResult(null);
    if (!testDistrict) {
      setAreas([]);
      return;
    }
    let cancelled = false;
    setAreasLoading(true);
    getDistricts({ division: testDistrict, limit: 200 }).then((r) => {
      if (cancelled) return;
      setAreasLoading(false);
      if (r.success && r.data) setAreas(r.data.districts);
      else setAreas([]);
    });
    return () => {
      cancelled = true;
    };
  }, [testDistrict]);

  const openCreate = () => {
    setEditingRule(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (rule: PrepaymentRule) => {
    setEditingRule(rule);
    setForm(toForm(rule));
    setDialogOpen(true);
  };

  const toggleZone = (zoneId: string) => {
    setForm((prev) => ({
      ...prev,
      zones: prev.zones.includes(zoneId)
        ? prev.zones.filter((z) => z !== zoneId)
        : [...prev.zones, zoneId],
    }));
  };

  const toggleRisk = (level: string) => {
    setForm((prev) => ({
      ...prev,
      riskLevels: prev.riskLevels.includes(level)
        ? prev.riskLevels.filter((r) => r !== level)
        : [...prev.riskLevels, level],
    }));
  };

  const buildPayload = () => {
    const num = (s: string) => (s.trim() === "" ? null : Number(s));
    return {
      name: form.name.trim(),
      description: form.description.trim(),
      active: form.active,
      priority: Number(form.priority) || 0,
      conditions: {
        zones: form.zones,
        minOrderTotal: num(form.minOrderTotal),
        maxOrderTotal: num(form.maxOrderTotal),
        riskLevels: form.riskLevels as PrepaymentRule["conditions"]["riskLevels"],
        requireCampaignProducts: form.requireCampaignProducts,
      },
      basis: {
        type: form.basisType,
        value: Number(form.basisValue) || 0,
        minAmount: num(form.basisMin),
        maxAmount: num(form.basisMax),
      },
    };
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Rule name is required");
      return;
    }
    const payload = buildPayload();
    setSaving(true);
    const response = editingRule
      ? await updatePrepaymentRule(editingRule._id, payload)
      : await createPrepaymentRule(payload);
    setSaving(false);
    if (response.success) {
      toast.success(editingRule ? "Rule updated" : "Rule created");
      setDialogOpen(false);
      loadRules();
    } else {
      toast.error(response.error || "Failed to save rule");
    }
  };

  const handleToggleActive = async (rule: PrepaymentRule) => {
    const response = await updatePrepaymentRule(rule._id, { active: !rule.active });
    if (response.success) {
      setRules((prev) =>
        prev.map((r) => (r._id === rule._id ? { ...r, active: !rule.active } : r))
      );
    } else {
      toast.error(response.error || "Failed to update rule");
    }
  };

  const handleDelete = async () => {
    if (!deletingRule) return;
    const response = await deletePrepaymentRule(deletingRule._id);
    if (response.success) {
      toast.success(`Rule "${deletingRule.name}" deleted`);
      setRules((prev) => prev.filter((r) => r._id !== deletingRule._id));
    } else {
      toast.error(response.error || "Failed to delete rule");
    }
    setDeletingRule(null);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    // parse "qty x unitPrice" lines (also accepts "qty*unitPrice")
    const orderItems = testItems
      .split("\n")
      .map((line) => {
        const m = line.trim().match(/^(\d+)\s*[x*]\s*(\d+(?:\.\d+)?)$/i);
        return m
          ? { productId: "test-product", quantity: Number(m[1]), unitPrice: Number(m[2]) }
          : null;
      })
      .filter(Boolean) as { productId: string; quantity: number; unitPrice: number }[];

    const response = await evaluatePrepaymentRules({
      shipping: {
        district: testArea?.name || "",
        division: testDistrict || "",
      },
      orderItems,
      deliveryCharge: testDeliveryCharge.trim() === "" ? null : Number(testDeliveryCharge),
      customerPhone: testPhone.trim(),
    });
    setTesting(false);
    if (response.success && response.data) {
      setTestResult(response.data);
    } else {
      toast.error(response.error || "Evaluation failed");
    }
  };

  const winnerId = testResult?.appliedRule?.id ?? null;
  const sortedBreakdown = testResult
    ? [...testResult.breakdown].sort(
        (a, b) =>
          (b.ruleId === winnerId ? 1 : 0) - (a.ruleId === winnerId ? 1 : 0) ||
          b.computedAmount - a.computedAmount
      )
    : [];

  const renderConditions = (rule: PrepaymentRule, compact = false) => {
    const meta = BASIS_META[rule.basis?.type ?? "delivery_charge"];
    const parts = describeConditions(rule);
    const shown = compact ? parts.slice(0, 2) : parts;
    return (
      <div className='flex flex-wrap items-center gap-1'>
        <span
          className={`inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-medium ${meta.chip}`}>
          {describeBasis(rule)}
        </span>
        {shown.map((c, i) => (
          <span
            key={i}
            className='inline-flex items-center whitespace-nowrap rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'>
            {c}
          </span>
        ))}
        {compact && parts.length > 2 && (
          <span className='text-[10px] text-slate-400'>+{parts.length - 2}</span>
        )}
      </div>
    );
  };

  return (
    <div className='space-y-5 mobile:pb-[calc(5rem+env(safe-area-inset-bottom))]'>
      {/* Page header */}
      <PageHeader
        icon={<Wallet className='h-5 w-5' />}
        title='Prepayment Rules'
        subtitle='When an advance payment is required and how much — highest advance wins'
        count={
          <div className='flex items-center gap-2'>
            <span className='inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-[11px] font-medium'>
              <Layers className='h-3 w-3 text-primary' /> {rules.length} rule
              {rules.length === 1 ? "" : "s"}
            </span>
            <span className='inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-[11px] font-medium'>
              <Sparkles className='h-3 w-3 text-primary' /> {activeCount} active
            </span>
          </div>
        }
        actions={
          <>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setTestOpen(true)}
              className='h-8 gap-1.5 text-[11px] hover:border-emerald-400 hover:text-emerald-600'>
              <FlaskConical className='h-3.5 w-3.5' />
              Test Rules
            </Button>
            <Button
              size='sm'
              onClick={openCreate}
              className='h-8 gap-1.5 text-[11px]'>
              <Plus className='h-3.5 w-3.5' />
              New Rule
            </Button>
          </>
        }
      />

      {/* Rules table */}
      <div className='rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 overflow-hidden'>
        <div className='flex flex-col gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-700/50 sm:flex-row sm:items-center sm:justify-between md:flex-row md:items-center md:justify-between'>
          <div className='flex items-center gap-2'>
            <Layers className='h-4 w-4 text-indigo-500' />
            <h2 className='text-sm font-semibold text-slate-900 dark:text-white'>
              All Rules
            </h2>
            {loading ? (
              <Loader2 className='h-3.5 w-3.5 animate-spin text-slate-400' />
            ) : (
              <Badge
                variant='outline'
                className='text-[10px] text-slate-400 border-slate-200 dark:border-slate-700'>
                {rules.length}
              </Badge>
            )}
          </div>
        </div>

        {loading ? (
          <>
            <div className='hidden justify-center py-12 md:flex'>
              <Loader2 className='h-5 w-5 animate-spin text-indigo-500' />
            </div>
            <div className='mobile:block hidden px-3 py-3'>
              <MobileSkeletonList count={4} />
            </div>
          </>
        ) : rules.length === 0 ? (
          <div className='flex flex-col items-center gap-2 py-12 text-center'>
            <CircleSlash className='h-8 w-8 text-slate-300 dark:text-slate-600' />
            <p className='text-[13px] text-slate-500 dark:text-slate-400'>
              No rules yet. Campaign prepayment still applies.
            </p>
            <Button
              variant='outline'
              size='sm'
              onClick={openCreate}
              className='h-8 gap-1.5 text-[11px]'>
              <Plus className='h-3 w-3' /> Create your first rule
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className='hidden md:block overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow className='bg-slate-50/70 dark:bg-slate-800/50 hover:bg-slate-50/70 dark:hover:bg-slate-800/50'>
                    <TableHead className='pl-5'>
                      <SectionLabel>Rule</SectionLabel>
                    </TableHead>
                    <TableHead>
                      <SectionLabel>Conditions</SectionLabel>
                    </TableHead>
                    <TableHead>
                      <SectionLabel>Priority</SectionLabel>
                    </TableHead>
                    <TableHead>
                      <SectionLabel>Updated</SectionLabel>
                    </TableHead>
                    <TableHead>
                      <SectionLabel>Status</SectionLabel>
                    </TableHead>
                    <TableHead className='pr-5 text-right'>
                      <SectionLabel>Actions</SectionLabel>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.map((rule) => (
                    <TableRow
                      key={rule._id}
                      className='group transition-colors hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20'>
                      <TableCell className='pl-5 align-top'>
                        <div className='flex items-start gap-2'>
                          <span
                            className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                              rule.active ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
                            }`}
                          />
                          <div className='min-w-0'>
                            <p className='truncate text-[13px] font-medium text-slate-900 dark:text-white'>
                              {rule.name}
                            </p>
                            {rule.description && (
                              <p className='line-clamp-1 text-[11px] text-slate-400 dark:text-slate-500'>
                                {rule.description}
                              </p>
                            )}
                            <div className='mt-1.5'>{renderConditions(rule)}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className='align-top'>
                        <span className='text-[11px] text-slate-500 dark:text-slate-400'>
                          {rule.conditions?.zones?.length
                            ? `${rule.conditions.zones.length} zone(s)`
                            : "all zones"}
                        </span>
                      </TableCell>
                      <TableCell className='align-top'>
                        {rule.priority !== 0 ? (
                          <Badge
                            variant='outline'
                            className='border-violet-200 bg-violet-50 text-[10px] text-violet-700 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-300'>
                            {rule.priority}
                          </Badge>
                        ) : (
                          <span className='text-[11px] text-slate-400'>—</span>
                        )}
                      </TableCell>
                      <TableCell className='align-top'>
                        <span className='text-[11px] text-slate-400 dark:text-slate-500'>
                          {rule.updatedAt
                            ? formatDistanceToNow(new Date(rule.updatedAt), {
                                addSuffix: true,
                              })
                            : "—"}
                        </span>
                      </TableCell>
                      <TableCell className='align-top'>
                        <Switch
                          checked={rule.active}
                          onCheckedChange={() => handleToggleActive(rule)}
                        />
                      </TableCell>
                      <TableCell className='pr-5 align-top'>
                        <div className='flex items-center justify-end gap-0.5 opacity-60 transition-opacity group-hover:opacity-100'>
                          <Button
                            variant='ghost'
                            size='sm'
                            title='Test against this rule set'
                            onClick={() => setTestOpen(true)}
                            className='h-7 w-7 p-0 rounded-lg hover:text-emerald-600'>
                            <FlaskConical className='h-3.5 w-3.5' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => openEdit(rule)}
                            className='h-7 w-7 p-0 rounded-lg'>
                            <Pencil className='h-3.5 w-3.5' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => setDeletingRule(rule)}
                            className='h-7 w-7 p-0 rounded-lg text-red-500 hover:text-red-600'>
                            <Trash2 className='h-3.5 w-3.5' />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile cards */}
            <div className='divide-y divide-slate-100 dark:divide-slate-800 md:hidden'>
              {rules.map((rule) => (
                <div key={rule._id} className='flex items-start gap-3 px-4 py-3'>
                  <div className='min-w-0 flex-1'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <span className='text-[13px] font-medium text-slate-900 dark:text-white'>
                        {rule.name}
                      </span>
                      {rule.priority !== 0 && (
                        <Badge
                          variant='outline'
                          className='border-violet-200 bg-violet-50 text-[10px] text-violet-700 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-300'>
                          prio {rule.priority}
                        </Badge>
                      )}
                    </div>
                    {rule.description && (
                      <p className='line-clamp-1 text-[11px] text-slate-400'>
                        {rule.description}
                      </p>
                    )}
                    <div className='mt-1.5'>{renderConditions(rule)}</div>
                    <div className='mt-1 text-[10px] text-slate-400'>
                      {rule.updatedAt
                        ? formatDistanceToNow(new Date(rule.updatedAt), { addSuffix: true })
                        : ""}
                    </div>
                  </div>
                  <div className='flex shrink-0 flex-col items-end gap-2'>
                    <Switch
                      checked={rule.active}
                      onCheckedChange={() => handleToggleActive(rule)}
                    />
                    <Button
                      variant='ghost'
                      size='sm'
                      aria-label='Rule actions'
                      onClick={() => setSheetRule(rule)}
                      className='h-9 w-9 p-0 rounded-full text-slate-500'>
                      <MoreVertical className='h-4.5 w-4.5' />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Mobile row-action sheet */}
      <MobileActionSheet
        open={!!sheetRule}
        onOpenChange={(open) => !open && setSheetRule(null)}
        title={sheetRule?.name}
        description='Rule actions'
        actions={[
          {
            icon: <FlaskConical className='h-5 w-5 text-emerald-600' />,
            label: 'Test rules',
            onClick: () => setTestOpen(true),
          },
          {
            icon: <Pencil className='h-5 w-5' />,
            label: 'Edit rule',
            onClick: () => sheetRule && openEdit(sheetRule),
          },
          {
            icon: <Trash2 className='h-5 w-5 text-red-500' />,
            label: 'Delete rule',
            destructive: true,
            onClick: () => setDeletingRule(sheetRule),
          },
        ]}
      />

      {/* ── Test rules side sheet (full-width drawer on mobile) ── */}
      <Sheet open={testOpen} onOpenChange={setTestOpen}>
        <SheetContent
          side='right'
          className='w-full sm:max-w-[440px] p-0 flex flex-col gap-0 data-[state=open]:duration-300'>
          {/* Header */}
          <SheetHeader className='px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 flex flex-row items-center justify-between space-y-0'>
            <div className='flex items-center gap-2'>
              <div className='flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm'>
                <FlaskConical className='w-3.5 h-3.5 text-white' />
              </div>
              <div>
                <SheetTitle className='text-sm font-semibold text-slate-900 dark:text-white leading-tight'>
                  Test Rules
                </SheetTitle>
                <p className='text-[10px] text-slate-500 dark:text-slate-400'>
                  Preview which rule wins and why
                </p>
              </div>
            </div>
            <SheetClose asChild>
              <Button variant='ghost' size='sm' className='h-7 w-7 p-0 rounded-lg'>
                <X className='w-4 h-4' />
              </Button>
            </SheetClose>
          </SheetHeader>

          {/* Body */}
          <div className='flex-1 overflow-y-auto px-4 py-4 space-y-4'>
            <div className='space-y-3'>
              <div className='space-y-1.5'>
                <SectionLabel>District</SectionLabel>
                <Select value={testDistrict} onValueChange={(v) => setTestDistrict(v)}>
                  <SelectTrigger className='border-slate-200 dark:border-slate-700'>
                    <SelectValue placeholder='Select district' />
                  </SelectTrigger>
                  <SelectContent>
                    {divisions.map((d) => (
                      <SelectItem key={d.divisionId} value={d.division}>
                        {d.division}
                        <span className='ml-1 text-slate-400'>({d.districtCount})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-1.5'>
                <SectionLabel>Area</SectionLabel>
                <Select
                  value={testArea?._id ?? ""}
                  onValueChange={(id) => {
                    const area = areas.find((a) => a._id === id) || null;
                    setTestArea(area);
                    setTestResult(null);
                    if (area) setTestDeliveryCharge(String(effectiveChargeOf(area)));
                  }}
                  disabled={!testDistrict || areasLoading}>
                  <SelectTrigger className='border-slate-200 dark:border-slate-700'>
                    <SelectValue
                      placeholder={
                        !testDistrict
                          ? "Select a district first"
                          : areasLoading
                            ? "Loading areas…"
                            : "Select area"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {areas.map((a) => (
                      <SelectItem key={a._id} value={a._id}>
                        {a.name}
                        {a.zone && (
                          <span className='ml-1 text-slate-400'>
                            · {a.zone.label || a.zone.name}
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {testArea && (
                <div className='flex flex-wrap items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50 px-2.5 py-2'>
                  <span className='inline-flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300'>
                    <MapPin className='h-3 w-3 text-indigo-500' />
                    {testArea.name}, {testDistrict}
                  </span>
                  {testArea.zone && (
                    <span className='rounded-full border border-sky-200 bg-sky-50 dark:border-sky-800 dark:bg-sky-950/40 px-2 py-0.5 text-[10px] text-sky-700 dark:text-sky-300'>
                      zone: {testArea.zone.label || testArea.zone.name} · ৳
                      {testArea.zone.charge}
                    </span>
                  )}
                  {testArea.chargeOverride !== null &&
                    testArea.chargeOverride !== undefined && (
                      <span className='rounded-full border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40 px-2 py-0.5 text-[10px] text-amber-700 dark:text-amber-300'>
                        charge override ৳{testArea.chargeOverride}
                      </span>
                    )}
                </div>
              )}

              <div className='grid grid-cols-2 gap-3'>
                <div className='space-y-1.5'>
                  <SectionLabel>Delivery charge (৳)</SectionLabel>
                  <Input
                    type='number'
                    value={testDeliveryCharge}
                    onChange={(e) => setTestDeliveryCharge(e.target.value)}
                    placeholder='auto'
                    className='border-slate-200 dark:border-slate-700 text-[13px]'
                  />
                </div>
                <div className='space-y-1.5'>
                  <SectionLabel>Customer phone</SectionLabel>
                  <Input
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder='optional — for risk rules'
                    className='border-slate-200 dark:border-slate-700 text-[13px]'
                  />
                </div>
                <div className='space-y-1.5 col-span-2'>
                  <SectionLabel>Items</SectionLabel>
                  <Textarea
                    rows={2}
                    value={testItems}
                    onChange={(e) => setTestItems(e.target.value)}
                    placeholder={"2 x 500\n1 x 1200"}
                    className='border-slate-200 dark:border-slate-700 text-[13px] resize-none'
                  />
                </div>
              </div>
              <p className='text-[10px] text-slate-400'>
                One item per line: qty x unit price. Delivery charge auto-fills from
                the selected area. Phone is only used by risk-level rules.
              </p>
            </div>

            {/* Result */}
            <div className='rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 p-3 min-h-[160px]'>
              {!testResult ? (
                <div className='flex h-full min-h-[140px] flex-col items-center justify-center gap-2 text-center'>
                  <TrendingUp className='h-7 w-7 text-slate-300 dark:text-slate-600' />
                  <p className='text-[12px] text-slate-500 dark:text-slate-400'>
                    Pick a district &amp; area, then evaluate to preview which rule
                    wins and why.
                  </p>
                </div>
              ) : (
                <div className='space-y-3'>
                  <div
                    className={`rounded-lg p-3 ${
                      testResult.required
                        ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25"
                        : "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    }`}>
                    <div className='flex items-baseline justify-between'>
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wider ${
                          testResult.required ? "text-white/80" : "text-slate-400"
                        }`}>
                        {testResult.required ? "Advance required" : "No prepayment"}
                      </span>
                      {testResult.required && (
                        <span className='text-xl font-bold tabular-nums'>
                          ৳{testResult.amount}
                        </span>
                      )}
                    </div>
                    {testResult.appliedRule && (
                      <div
                        className={`mt-1 text-[12px] ${
                          testResult.required ? "text-white/90" : "text-slate-500"
                        }`}>
                        via “{testResult.appliedRule.name}”
                      </div>
                    )}
                  </div>
                  <div className='flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400'>
                    <span>
                      Order total ৳{testResult.orderTotal} · delivery ৳
                      {testResult.deliveryCharge}
                    </span>
                    {testResult.riskLevel && (
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] ${
                          testResult.riskLevel === "red"
                            ? "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300"
                            : testResult.riskLevel === "yellow"
                              ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                              : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                        }`}>
                        risk: {testResult.riskLevel}
                      </span>
                    )}
                  </div>
                  {!testResult.zoneMatched && (
                    <div className='rounded-md border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 px-2.5 py-1.5 text-[11px] text-amber-700 dark:text-amber-300'>
                      ⚠ Selected area did not resolve to a delivery zone — zone-based
                      rules were skipped.
                    </div>
                  )}
                  {sortedBreakdown.length > 0 && (
                    <>
                      <Separator className='bg-slate-200 dark:bg-slate-700' />
                      <div className='space-y-1'>
                        <SectionLabel>Rule breakdown</SectionLabel>
                        {sortedBreakdown.map((b, i) => {
                          const isWinner = b.ruleId === winnerId;
                          return (
                            <div
                              key={i}
                              className={`flex items-center justify-between rounded-md px-2 py-1.5 text-[11px] ${
                                isWinner
                                  ? "bg-emerald-50 font-medium text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-800"
                                  : "text-slate-500 dark:text-slate-400"
                              }`}>
                              <span className='truncate'>
                                {isWinner && (
                                  <Trophy className='mr-1 inline h-3 w-3 text-emerald-600 dark:text-emerald-400' />
                                )}
                                {b.ruleName}{" "}
                                <span className='opacity-70'>({b.matchedBy})</span>
                              </span>
                              <span className='tabular-nums'>৳{b.computedAmount}</span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className='px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'>
            <div className='flex items-center justify-between gap-2'>
              <span className='text-[10px] text-slate-400'>
                {testArea
                  ? `${testArea.name}, ${testDistrict}`
                  : "select a district & area"}
              </span>
              <Button
                size='sm'
                onClick={handleTest}
                disabled={testing || !testArea || !testItems.trim()}
                className='h-8 gap-1.5 text-[11px] bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white disabled:opacity-50'>
                {testing ? (
                  <Loader2 className='h-3 w-3 animate-spin' />
                ) : (
                  <FlaskConical className='h-3 w-3' />
                )}
                Evaluate
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Create / edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className='max-w-2xl max-h-[85vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <span className='flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white'>
                <Wallet className='h-4 w-4' />
              </span>
              {editingRule ? "Edit Rule" : "New Prepayment Rule"}
            </DialogTitle>
            <DialogDescription>
              A rule = when it applies (conditions) + what must be prepaid (basis).
              Leave all conditions unset to match every order.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label>Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder='e.g. Outside Dhaka — delivery charge advance'
                />
              </div>
              <div className='space-y-1.5'>
                <Label>Priority (tie-break)</Label>
                <Input
                  type='number'
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className='space-y-1.5'>
              <Label>Description</Label>
              <Textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className='space-y-1.5'>
              <SectionLabel>Delivery zones</SectionLabel>
              <div className='flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-slate-50/60 dark:border-slate-700 dark:bg-slate-800/40 p-3'>
                {zones.length === 0 && (
                  <span className='text-[11px] text-slate-400'>No zones configured</span>
                )}
                {zones.map((zone) => {
                  const checked = form.zones.includes(zone._id);
                  return (
                    <label
                      key={zone._id}
                      className={`flex items-center gap-2 rounded-full border px-3 py-1 text-[12px] transition-all cursor-pointer ${
                        checked
                          ? "border-indigo-300 bg-indigo-50 text-indigo-800 shadow-sm dark:border-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700"
                      }`}>
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleZone(zone._id)}
                      />
                      {zone.label || zone.name}
                      <span className='text-slate-400 text-[10px]'>৳{zone.charge}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label>Min order total (৳)</Label>
                <Input
                  type='number'
                  value={form.minOrderTotal}
                  onChange={(e) => setForm({ ...form, minOrderTotal: e.target.value })}
                  placeholder='no minimum'
                />
              </div>
              <div className='space-y-1.5'>
                <Label>Max order total (৳)</Label>
                <Input
                  type='number'
                  value={form.maxOrderTotal}
                  onChange={(e) => setForm({ ...form, maxOrderTotal: e.target.value })}
                  placeholder='no maximum'
                />
              </div>
            </div>

            <div className='space-y-1.5'>
              <SectionLabel>Customer risk levels</SectionLabel>
              <div className='flex flex-wrap gap-2'>
                {RISK_LEVELS.map((r) => {
                  const checked = form.riskLevels.includes(r.value);
                  const tone =
                    r.value === "green"
                      ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : r.value === "yellow"
                        ? "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                        : "border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300";
                  return (
                    <label
                      key={r.value}
                      className={`flex items-center gap-2 rounded-full border px-3 py-1 text-[12px] transition-all cursor-pointer ${
                        checked
                          ? `${tone} shadow-sm`
                          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}>
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleRisk(r.value)}
                      />
                      {r.label}
                    </label>
                  );
                })}
              </div>
            </div>

            <label
              className={`flex items-center gap-2 rounded-lg border p-3 text-[12px] transition-colors cursor-pointer ${
                form.requireCampaignProducts
                  ? "border-violet-300 bg-violet-50/60 dark:border-violet-700 dark:bg-violet-950/30 dark:text-violet-200"
                  : "border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}>
              <Checkbox
                checked={form.requireCampaignProducts}
                onCheckedChange={(v) =>
                  setForm({ ...form, requireCampaignProducts: !!v })
                }
              />
              Only when cart contains campaign prepayment products
            </label>

            <div className='rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 p-4 space-y-3'>
              <SectionLabel>Advance basis *</SectionLabel>
              <div className='grid grid-cols-1 gap-2 md:grid-cols-2'>
                {(Object.keys(BASIS_META) as PrepaymentBasisType[]).map((type) => {
                  const meta = BASIS_META[type];
                  const selected = form.basisType === type;
                  return (
                    <button
                      key={type}
                      type='button'
                      onClick={() => setForm({ ...form, basisType: type })}
                      className={`rounded-lg border p-3 text-left transition-all ${
                        selected
                          ? `${meta.chip} shadow-sm scale-[1.01]`
                          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-primary/40 hover:shadow-sm"
                      }`}>
                      <span className='block text-[12px] font-medium'>{meta.label}</span>
                      <span
                        className={`block text-[10px] ${
                          selected ? "opacity-80" : "text-slate-400"
                        }`}>
                        {meta.hint}
                      </span>
                    </button>
                  );
                })}
              </div>
              {(form.basisType === "percentage" || form.basisType === "fixed") && (
                <div className='space-y-1.5'>
                  <Label>
                    {form.basisType === "percentage" ? "Percent (%)" : "Amount (৳)"}
                  </Label>
                  <Input
                    type='number'
                    value={form.basisValue}
                    onChange={(e) => setForm({ ...form, basisValue: e.target.value })}
                    max={form.basisType === "percentage" ? 100 : undefined}
                  />
                </div>
              )}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                <div className='space-y-1.5'>
                  <Label>Min advance (৳)</Label>
                  <Input
                    type='number'
                    value={form.basisMin}
                    onChange={(e) => setForm({ ...form, basisMin: e.target.value })}
                    placeholder='no clamp'
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label>Max advance (৳)</Label>
                  <Input
                    type='number'
                    value={form.basisMax}
                    onChange={(e) => setForm({ ...form, basisMax: e.target.value })}
                    placeholder='no clamp'
                  />
                </div>
              </div>
            </div>

            <div className='flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 p-3'>
              <Switch
                checked={form.active}
                onCheckedChange={(v) => setForm({ ...form, active: !!v })}
              />
              <Label>Rule active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className='bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:from-indigo-600 hover:to-violet-700'>
              {saving ? <Loader2 className='h-4 w-4 animate-spin mr-2' /> : null}
              {editingRule ? "Save changes" : "Create rule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deletingRule}
        onOpenChange={(open) => !open && setDeletingRule(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete rule?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deletingRule?.name}” will stop applying to new orders immediately. This
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className='bg-red-600 text-white hover:bg-red-500'>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PrepaymentSettings;
