import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Separator } from "../../components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  AlertCircle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Layers,
  Map as MapIcon,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  bulkUpdateDistricts,
  createDistrict,
  createZone,
  deleteZone,
  getCourierSyncStatus,
  getDistricts,
  getDivisions,
  getPublicLocations,
  getZones,
  syncCourierMappings,
  updateDistrict,
  updateZone,
  type DeliveryZone,
  type LocationDistrict,
} from "../../api/location";
import { useIsMobile } from "../../hooks/use-mobile";
import {
  MobileEmptyState,
  MobileListCard,
  MobilePagination,
  MobileSkeletonList,
  MobileStaggeredList,
} from "../../components/mobile";
import { PageHeader } from "../../components/PageHeader";
import { PageLoader, InlineLoader, ButtonLoadingText } from "../../components/loaders";
import { Dots } from "../../components/loading-ui/dots";

/**
 * Location Settings — admin-configurable delivery charge groups,
 * area→group assignment (drag & drop), and courier location mappings.
 *
 * Terminology (matches the customer-facing forms):
 *  - "District" → backend `division` field (Bagerhat, Dhaka, …)
 *  - "Area"     → backend `district` field ("Bagerhat Sadar", "Dhanmondi", …)
 */

interface DivisionInfo {
  divisionId: string;
  division: string;
  districtCount: number;
}

interface SyncStatus {
  total: number;
  matched: number;
  needsReview: number;
  unmatched: number;
  lastSyncedAt: string | null;
}

const ZONE_DOT_COLORS = [
  "bg-emerald-500",
  "bg-sky-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-teal-500",
  "bg-indigo-500",
];

// ─────────────────────────────────────────────────────────── DnD pieces

function DistrictChip({ district }: { district: LocationDistrict }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: district._id,
    data: { type: "district", district },
  });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`group flex h-7 items-center gap-1.5 rounded-[2px] border border-border/80 bg-background px-2 text-xs font-medium shadow-sm transition-all hover:border-primary/40 hover:shadow cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-30" : ""
      }`}
    >
      <GripVertical className='h-3.5 w-3.5 shrink-0 text-muted-foreground/60 group-hover:text-muted-foreground' />
      <span className='truncate max-w-[140px]'>{district.name}</span>
      {district.chargeOverride !== null && (
        <span className='rounded-[2px] bg-amber-100 px-1.5 text-[11px] font-semibold text-amber-700'>
          ৳{district.chargeOverride}
        </span>
      )}
    </div>
  );
}

function ZoneColumn({
  zone,
  districts,
  colorIndex,
  onChargeChange,
  onDelete,
  onAddArea,
  chargeSaving,
}: {
  zone: DeliveryZone | null; // null = "no group" drop target
  districts: LocationDistrict[];
  colorIndex: number;
  onChargeChange: (zone: DeliveryZone, charge: number) => void;
  onDelete: (zone: DeliveryZone) => void;
  onAddArea: (zoneId: string | null) => void;
  chargeSaving: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: zone ? `zone-${zone._id}` : "zone-unassigned",
    data: { type: "zone", zoneId: zone?._id ?? null },
  });

  const [chargeDraft, setChargeDraft] = useState<string>(String(zone?.charge ?? ""));

  useEffect(() => {
    if (zone) setChargeDraft(String(zone.charge));
  }, [zone?.charge]);

  const dot = zone ? ZONE_DOT_COLORS[colorIndex % ZONE_DOT_COLORS.length] : "bg-slate-300";

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[160px] flex-col rounded-lg border bg-card shadow-sm transition-all ${
        isOver
          ? "border-primary ring-2 ring-primary/20 shadow-primary/5"
          : "border-border/70 hover:shadow"
      }`}
    >
      {zone ? (
        <div className='rounded-t-lg border-b border-border/70 bg-muted/40 px-2.5 py-2'>
          <div className='flex items-center justify-between gap-1.5'>
            <div className='flex min-w-0 items-center gap-2'>
              <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} />
              <div className='min-w-0'>
                <p className='truncate text-[13px] font-semibold leading-tight'>
                  {zone.label || zone.name}
                </p>
                <p className='truncate text-[10px] font-medium tracking-wide text-muted-foreground'>
                  {zone.name}
                </p>
              </div>
            </div>
            <div className='flex shrink-0 items-center gap-0.5'>
              <Badge
                variant='secondary'
                className='rounded-full px-1.5 text-[10px] font-semibold'
              >
                {districts.length}
              </Badge>
              <Button
                variant='ghost'
                size='icon'
                className='h-6 w-6 rounded-md text-muted-foreground hover:text-primary'
                title='Add area to this group'
                onClick={() => onAddArea(zone._id)}
              >
                <Plus className='h-3.5 w-3.5' />
              </Button>
              <Button
                variant='ghost'
                size='icon'
                className='h-6 w-6 rounded-md text-muted-foreground hover:text-destructive'
                title='Delete group'
                onClick={() => onDelete(zone)}
              >
                <Trash2 className='h-3.5 w-3.5' />
              </Button>
            </div>
          </div>

          <div className='mt-1.5 flex items-center gap-1.5'>
            <div className='flex h-7 flex-1 items-center gap-1 rounded-md border border-border/80 bg-background px-2 shadow-sm'>
              <span className='text-xs font-semibold text-muted-foreground'>৳</span>
              <input
                className='w-full bg-transparent text-xs font-semibold outline-none'
                type='number'
                min={0}
                value={chargeDraft}
                onChange={(e) => setChargeDraft(e.target.value)}
                onBlur={() => {
                  const val = Number(chargeDraft);
                  if (!isNaN(val) && val >= 0 && val !== zone.charge) {
                    onChargeChange(zone, val);
                  }
                }}
                disabled={chargeSaving}
              />
              {chargeSaving && (
                <Dots className='h-3 w-5 text-muted-foreground' />
              )}
            </div>
            <span className='text-[10px] font-medium text-muted-foreground'>
              per delivery
            </span>
          </div>
        </div>
      ) : (
        <div className='flex items-center justify-between rounded-t-lg border-b border-dashed border-border/70 px-2.5 py-2'>
          <div className='flex items-center gap-2'>
            <span className={`h-2 w-2 rounded-full ${dot}`} />
            <p className='text-[13px] font-semibold text-muted-foreground'>No group</p>
          </div>
          <Badge variant='outline' className='rounded-full px-1.5 text-[10px] font-semibold'>
            {districts.length}
          </Badge>
        </div>
      )}

      <div className='flex flex-1 flex-wrap content-start gap-1 p-2'>
        {districts.map((d) => (
          <DistrictChip key={d._id} district={d} />
        ))}
        {districts.length === 0 && (
          <div className='flex w-full flex-1 items-center justify-center rounded-md border border-dashed border-border/60'>
            <p className='px-3 py-4 text-center text-[11px] text-muted-foreground'>
              Drag areas here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────── Page

export default function LocationSettings() {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [divisions, setDivisions] = useState<DivisionInfo[]>([]);
  const [districtsByZone, setDistrictsByZone] = useState<Map<string | null, LocationDistrict[]>>(
    new Map(),
  );
  const [loading, setLoading] = useState(true);
  const [chargeSaving, setChargeSaving] = useState(false);
  const [activeDrag, setActiveDrag] = useState<LocationDistrict | null>(null);
  const [newZoneOpen, setNewZoneOpen] = useState(false);
  const [newZoneName, setNewZoneName] = useState("");
  const [newZoneCharge, setNewZoneCharge] = useState("");

  // Division filter (charge groups tab)
  const [divisionFilter, setDivisionFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const loadData = useCallback(async () => {
    setLoading(true);
    const [zonesRes, divisionsRes] = await Promise.all([getZones(), getDivisions()]);
    if (zonesRes.success && zonesRes.data) setZones(zonesRes.data);
    if (divisionsRes.success && divisionsRes.data) setDivisions(divisionsRes.data);
    setLoading(false);
  }, []);

  // Districts (areas) for the charge-groups board
  const loadDistricts = useCallback(async () => {
    const res = await getDistricts({
      division: divisionFilter === "all" ? undefined : divisionFilter,
      search: search || undefined,
      limit: 200,
      page: 1,
    });
    if (res.success && res.data) {
      const byZone = new Map<string | null, LocationDistrict[]>();
      for (const d of res.data.districts) {
        const key = d.zone?._id ?? null;
        if (!byZone.has(key)) byZone.set(key, []);
        byZone.get(key)!.push(d);
      }
      setDistrictsByZone(byZone);
    }
  }, [divisionFilter, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const t = setTimeout(loadDistricts, 250);
    return () => clearTimeout(t);
  }, [loadDistricts]);

  // -------------------------------------------------------- DnD handlers

  const handleDragStart = (event: DragStartEvent) => {
    const d = (event.active.data.current as { district: LocationDistrict })?.district;
    setActiveDrag(d ?? null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveDrag(null);
    const { over, active } = event;
    if (!over) return;
    const district = active.data.current as { district: LocationDistrict };
    const { zoneId } = over.data.current as { zoneId: string | null };
    if (district.district.zone?._id === zoneId) return;

    const targetZone = zones.find((z) => z._id === zoneId);
    const newCharge = targetZone?.charge ?? 0;

    // Optimistic update
    setDistrictsByZone((prev) => {
      const next = new Map(prev);
      const fromKey = district.district.zone?._id ?? null;
      const list = (next.get(fromKey) || []).filter((d) => d._id !== district.district._id);
      next.set(fromKey, list);
      const toList = [...(next.get(zoneId) || []), district.district];
      next.set(zoneId, toList);
      return next;
    });

    const res = await bulkUpdateDistricts([district.district._id], zoneId);
    if (res.success) {
      toast.success(
        `"${district.district.name}" moved to ${targetZone?.label || targetZone?.name || "No group"} (৳${newCharge})`,
      );
      loadDistricts();
    } else {
      toast.error(res.error || "Failed to move area");
      loadDistricts(); // rollback
    }
  };

  // ------------------------------------------------------- Zone actions

  const handleChargeChange = async (zone: DeliveryZone, charge: number) => {
    setChargeSaving(true);
    const res = await updateZone(zone._id, { charge });
    setChargeSaving(false);
    if (res.success) {
      toast.success(`Charge for ${zone.label || zone.name} updated to ৳${charge}`);
      loadData();
      loadDistricts();
    } else {
      toast.error(res.error || "Failed to update charge");
    }
  };

  const handleDeleteZone = async (zone: DeliveryZone) => {
    const assigned = districtsByZone.get(zone._id)?.length || 0;
    if (assigned > 0) {
      toast.error(`${assigned} areas are in this group — move them to another group first`);
      return;
    }
    const res = await deleteZone(zone._id);
    if (res.success) {
      toast.success(`Group ${zone.name} deleted`);
      loadData();
    } else {
      toast.error(res.error || "Failed to delete group");
    }
  };

  const handleCreateZone = async () => {
    const charge = Number(newZoneCharge);
    if (!newZoneName.trim() || isNaN(charge) || charge < 0) {
      toast.error("Enter a group name and a non-negative charge");
      return;
    }
    const res = await createZone({
      name: newZoneName.trim().toLowerCase().replace(/\s+/g, "_"),
      label: newZoneName.trim(),
      charge,
    });
    if (res.success) {
      toast.success(`Group "${newZoneName}" created`);
      setNewZoneName("");
      setNewZoneCharge("");
      setNewZoneOpen(false);
      loadData();
    } else {
      toast.error(res.error || "Failed to create group");
    }
  };

  // ---------------------------------------------------------- Add area

  const [addAreaOpen, setAddAreaOpen] = useState(false);
  const [addAreaZoneId, setAddAreaZoneId] = useState<string | null>(null);
  const [addAreaName, setAddAreaName] = useState("");
  const [addAreaDivisionId, setAddAreaDivisionId] = useState("");
  const [addAreaSaving, setAddAreaSaving] = useState(false);

  const openAddArea = (zoneId: string | null) => {
    setAddAreaZoneId(zoneId);
    setAddAreaName("");
    setAddAreaDivisionId("");
    setAddAreaOpen(true);
  };

  const handleAddArea = async () => {
    const name = addAreaName.trim();
    const division = divisions.find((d) => d.divisionId === addAreaDivisionId);
    if (!name || !division) {
      toast.error("Enter an area name and select its district");
      return;
    }
    setAddAreaSaving(true);
    const res = await createDistrict({
      name,
      divisionId: division.divisionId,
      division: division.division,
      zone: addAreaZoneId,
    });
    setAddAreaSaving(false);
    if (res.success) {
      toast.success(`Area "${name}" added under ${division.division}`);
      setAddAreaOpen(false);
      loadDistricts();
      loadData();
    } else {
      toast.error(res.error || "Failed to create area");
    }
  };

  const allDistricts = useMemo(() => [...districtsByZone.values()].flat(), [districtsByZone]);
  const totalAreas = divisions.reduce((sum, d) => sum + d.districtCount, 0);

  if (loading) {
    return (
      <PageLoader
        domain='settings'
        text='Loading Location Config'
        className='h-64'
      />
    );
  }

  return (
    <div className='space-y-3 p-3 sm:p-4'>
      {/* ── Page header ─────────────────────────────────────────────── */}
      <PageHeader
        icon={<MapPin className='h-5 w-5' />}
        title='Location Settings'
        subtitle='Delivery charge groups, areas & courier mappings'
        count={
          <div className='flex flex-wrap items-center gap-1.5'>
            <Badge variant='outline' className='gap-1 rounded-full px-2 py-0.5 text-[11px]'>
              <Layers className='h-3 w-3 text-primary' />
              {zones.length} groups
            </Badge>
            <Badge variant='outline' className='gap-1 rounded-full px-2 py-0.5 text-[11px]'>
              <MapPin className='h-3 w-3 text-primary' />
              {totalAreas} areas
            </Badge>
          </div>
        }
      />
      <p className='flex items-center gap-1.5 text-xs text-muted-foreground'>
        <Sparkles className='h-3.5 w-3.5 shrink-0 text-primary' />
        <span>
          Each <strong className='font-medium text-foreground'>area</strong> inherits its
          group's charge unless it has an override — drag areas between groups to reprice.
        </span>
      </p>

      <Tabs defaultValue='groups' className='space-y-3'>
        <TabsList className='h-8 rounded-lg bg-muted/60 p-0.5 mobile:flex mobile:w-full mobile:overflow-x-auto'>
          <TabsTrigger
            value='groups'
            className='gap-1.5 rounded-md px-3 text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm'
          >
            <Layers className='h-3.5 w-3.5' /> Charge Groups
          </TabsTrigger>
          <TabsTrigger
            value='areas'
            className='gap-1.5 rounded-md px-3 text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm'
          >
            <MapPin className='h-3.5 w-3.5' /> Areas
          </TabsTrigger>
          <TabsTrigger
            value='districts'
            className='gap-1.5 rounded-md px-3 text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm'
          >
            <MapIcon className='h-3.5 w-3.5' /> Districts
          </TabsTrigger>
          <TabsTrigger
            value='couriers'
            className='gap-1.5 rounded-md px-3 text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm'
          >
            <Truck className='h-3.5 w-3.5' /> Courier Mappings
          </TabsTrigger>
        </TabsList>

        {/* ───────────────────────────────────────────── Groups tab */}
        <TabsContent value='groups' className='space-y-2'>
          {/* Toolbar */}
          <div className='flex flex-wrap items-center gap-1.5 rounded-lg border bg-card px-2.5 py-2 shadow-sm'>
            <Select value={divisionFilter} onValueChange={setDivisionFilter}>
              <SelectTrigger className='h-8 w-[170px] border-0 bg-muted/40 text-xs shadow-none'>
                <SelectValue placeholder='District' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All districts</SelectItem>
                {divisions.map((d) => (
                  <SelectItem key={d.divisionId} value={d.division}>
                    {d.division} ({d.districtCount})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className='relative min-w-[160px] flex-1'>
              <Search className='absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground' />
              <Input
                className='h-8 border-0 bg-muted/40 pl-8 text-xs shadow-none'
                placeholder='Search areas…'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <span className='px-1 text-[11px] font-medium text-muted-foreground'>
              {allDistricts.length} shown
            </span>
            <Separator orientation='vertical' className='hidden h-5 md:block' />
            <div className='ml-auto flex items-center gap-1.5'>
              <Button
                size='sm'
                variant='outline'
                className='h-8 gap-1 rounded-lg text-xs'
                onClick={() => openAddArea(null)}
              >
                <MapPin className='h-3.5 w-3.5' /> Add area
              </Button>
              {newZoneOpen ? (
                <Button size='sm' variant='ghost' className='h-8 gap-1 text-xs' onClick={() => setNewZoneOpen(false)}>
                  <X className='h-3.5 w-3.5' /> Cancel
                </Button>
              ) : (
                <Button size='sm' className='h-8 gap-1 rounded-lg text-xs' onClick={() => setNewZoneOpen(true)}>
                  <Plus className='h-3.5 w-3.5' /> New group
                </Button>
              )}
            </div>
          </div>

          {/* New-group inline form */}
          {newZoneOpen && (
            <Card className='border-primary/30 shadow-sm'>
              <CardContent className='flex flex-wrap items-center gap-2 p-2.5'>
                <Input
                  className='h-8 w-48 text-xs'
                  placeholder='Group name — e.g. dhaka_suburban'
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                />
                <div className='relative'>
                  <span className='absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground'>৳</span>
                  <Input
                    className='h-8 w-28 pl-6 text-xs'
                    type='number'
                    min={0}
                    placeholder='Charge'
                    value={newZoneCharge}
                    onChange={(e) => setNewZoneCharge(e.target.value)}
                  />
                </div>
                <Button size='sm' className='h-8 gap-1 text-xs' onClick={handleCreateZone}>
                  <CheckCircle2 className='h-3.5 w-3.5' /> Create group
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Add-area inline form */}
          {addAreaOpen && (
            <Card className='border-primary/30 shadow-sm'>
              <CardContent className='flex flex-wrap items-center gap-2 p-2.5'>
                <Input
                  className='h-8 w-48 text-xs'
                  placeholder='Area name — e.g. Mirpur East'
                  value={addAreaName}
                  onChange={(e) => setAddAreaName(e.target.value)}
                />
                <Select value={addAreaDivisionId} onValueChange={setAddAreaDivisionId}>
                  <SelectTrigger className='h-8 w-44 text-xs'>
                    <SelectValue placeholder='Select district' />
                  </SelectTrigger>
                  <SelectContent>
                    {divisions.map((d) => (
                      <SelectItem key={d.divisionId} value={d.divisionId}>
                        {d.division}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={addAreaZoneId ?? "none"}
                  onValueChange={(v) => setAddAreaZoneId(v === "none" ? null : v)}
                >
                  <SelectTrigger className='h-8 w-48 text-xs'>
                    <SelectValue placeholder='Charge group' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='none'>No group</SelectItem>
                    {zones
                      .filter((z) => z.active)
                      .map((z) => (
                        <SelectItem key={z._id} value={z._id}>
                          {z.label || z.name} — ৳{z.charge}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button size='sm' className='h-8 gap-1 text-xs' onClick={handleAddArea} disabled={addAreaSaving}>
                  {addAreaSaving ? (
                    <ButtonLoadingText text='Adding…' />
                  ) : (
                    <Plus className='h-3.5 w-3.5' />
                  )}
                  Add area
                </Button>
              </CardContent>
            </Card>
          )}

          <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className='grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 min-[1800px]:grid-cols-5'>
              {zones
                .filter((z) => z.active)
                .map((zone, i) => (
                  <ZoneColumn
                    key={zone._id}
                    zone={zone}
                    colorIndex={i}
                    districts={districtsByZone.get(zone._id) || []}
                    onChargeChange={handleChargeChange}
                    onDelete={handleDeleteZone}
                    onAddArea={openAddArea}
                    chargeSaving={chargeSaving}
                  />
                ))}
              <ZoneColumn
                zone={null}
                colorIndex={-1}
                districts={districtsByZone.get(null) || []}
                onChargeChange={handleChargeChange}
                onDelete={handleDeleteZone}
                onAddArea={openAddArea}
                chargeSaving={chargeSaving}
              />
            </div>
            <DragOverlay>
              {activeDrag ? (
                <div className='inline-flex h-7 items-center gap-1.5 rounded-[2px] border border-primary/40 bg-background px-2 text-xs font-semibold shadow-lg'>
                  <GripVertical className='h-3.5 w-3.5 text-primary' />
                  {activeDrag.name}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </TabsContent>

        {/* ─────────────────────────────────────────────── Areas tab */}
        <TabsContent value='areas'>
          <AreasTable zones={zones} onChanged={() => { loadDistricts(); loadData(); }} />
        </TabsContent>

        {/* ───────────────────────────────────────────── Districts tab */}
        <TabsContent value='districts'>
          <DistrictsTab zones={zones} onChanged={() => { loadDistricts(); loadData(); }} />
        </TabsContent>

        {/* ──────────────────────────────────────── Courier mappings tab */}
        <TabsContent value='couriers'>
          <CourierMappingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ───────────────────────────────────────────────────────── Areas table

function AreasTable({ zones, onChanged }: { zones: DeliveryZone[]; onChanged: () => void }) {
  const [districts, setDistricts] = useState<LocationDistrict[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [division, setDivision] = useState("all");
  const [zoneFilter, setZoneFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [divisions, setDivisions] = useState<DivisionInfo[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    getDivisions().then((r) => {
      if (r.success && r.data) setDivisions(r.data);
    });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getDistricts({
      division: division === "all" ? undefined : division,
      zone: zoneFilter === "all" ? undefined : zoneFilter,
      search: search || undefined,
      page,
      limit: 50,
    });
    if (res.success && res.data) {
      setDistricts(res.data.districts);
      setTotal(res.data.total);
    }
    setLoading(false);
  }, [division, zoneFilter, search, page]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const handleUpdate = async (d: LocationDistrict, payload: Record<string, unknown>) => {
    setSavingId(d._id);
    const res = await updateDistrict(d._id, payload);
    setSavingId(null);
    if (res.success) {
      toast.success("Area updated");
      load();
      onChanged();
    } else {
      toast.error(res.error || "Update failed");
    }
  };

  const totalPages = Math.ceil(total / 50);

  const isMobile = useIsMobile();

  // ── Mobile: card list instead of the horizontal-scroll table ──
  if (isMobile) {
    return (
      <div className='space-y-2'>
        {/* Filters — stacked full-width */}
        <div className='flex flex-col gap-1.5 rounded-lg border bg-card px-2.5 py-2 shadow-sm'>
          <div className='flex items-center gap-1.5'>
            <CardTitle className='text-sm'>Areas</CardTitle>
            <span className='ml-auto text-[11px] text-muted-foreground'>
              {total} total
            </span>
          </div>
          <Select value={division} onValueChange={(v) => { setDivision(v); setPage(1); }}>
            <SelectTrigger className='h-9 w-full bg-background text-xs'>
              <SelectValue placeholder='District' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All districts</SelectItem>
              {divisions.map((d) => (
                <SelectItem key={d.divisionId} value={d.division}>{d.division}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={zoneFilter} onValueChange={(v) => { setZoneFilter(v); setPage(1); }}>
            <SelectTrigger className='h-9 w-full bg-background text-xs'>
              <SelectValue placeholder='Group' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All groups</SelectItem>
              {zones.map((z) => (
                <SelectItem key={z._id} value={z._id}>{z.label || z.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className='relative'>
            <Search className='absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground' />
            <Input
              className='h-9 w-full bg-background pl-8 text-xs'
              placeholder='Search area…'
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        {loading ? (
          <MobileSkeletonList count={5} />
        ) : districts.length === 0 ? (
          <MobileEmptyState
            icon={<MapPin className='h-7 w-7' />}
            title='No areas'
            description='No areas match the current filters'
          />
        ) : (
          <MobileStaggeredList>
            {districts.map((d) => (
              <MobileListCard
                key={d._id}
                title={
                  <span className='flex items-center gap-1.5'>
                    {d.name}
                    {d.chargeOverride !== null && (
                      <Badge variant='secondary' className='rounded-full px-1.5 text-[10px]'>
                        override
                      </Badge>
                    )}
                  </span>
                }
                subtitle={d.division}
                trailing={
                  <span className='text-sm font-semibold'>৳{d.effectiveCharge}</span>
                }
                badge={
                  (d.courierMappings?.pathao?.needsReview ||
                    d.courierMappings?.carrybee?.needsReview) ? (
                    <Badge variant='destructive' className='gap-1 rounded-full text-[10px]'>
                      <AlertCircle className='h-3 w-3' /> mapping
                    </Badge>
                  ) : (
                    <span className='inline-flex items-center gap-1 text-[10px] text-muted-foreground'>
                      <CheckCircle2 className='h-3 w-3 text-emerald-500' /> ok
                    </span>
                  )
                }
              >
                <div className='mt-2.5 grid grid-cols-2 gap-1.5'>
                  <Select
                    value={d.divisionId}
                    onValueChange={(v) => handleUpdate(d, { divisionId: v })}
                  >
                    <SelectTrigger className='h-8 w-full text-xs text-muted-foreground'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {divisions.map((dv) => (
                        <SelectItem key={dv.divisionId} value={dv.divisionId}>
                          {dv.division}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={d.zone?._id ?? "none"}
                    onValueChange={(v) => handleUpdate(d, { zone: v === "none" ? null : v })}
                  >
                    <SelectTrigger className='h-8 w-full text-xs'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='none'>No group</SelectItem>
                      {zones.map((z) => (
                        <SelectItem key={z._id} value={z._id}>{z.label || z.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className='mt-1.5 flex items-center gap-1.5'>
                  <Input
                    className='h-8 w-24 text-xs'
                    type='number'
                    placeholder='Override ৳'
                    defaultValue={d.chargeOverride ?? ""}
                    onBlur={(e) => {
                      const raw = e.target.value;
                      const val = raw === "" ? null : Number(raw);
                      if (val !== d.chargeOverride && (val === null || (!isNaN(val) && val >= 0))) {
                        handleUpdate(d, { chargeOverride: val });
                      }
                    }}
                  />
                  {savingId === d._id && (
                    <Dots className='h-3 w-5 text-muted-foreground' />
                  )}
                </div>
              </MobileListCard>
            ))}
          </MobileStaggeredList>
        )}

        <MobilePagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
    );
  }

  return (
    <Card className='overflow-hidden shadow-sm'>
      <CardHeader className='border-b bg-muted/30 p-2.5'>
        <div className='flex flex-wrap items-center gap-1.5'>
          <CardTitle className='mr-1 text-sm'>Areas</CardTitle>
          <span className='mr-auto text-[11px] text-muted-foreground'>
            {total} total · override a charge to price an area independently of its group
          </span>
          <Select value={division} onValueChange={(v) => { setDivision(v); setPage(1); }}>
            <SelectTrigger className='h-8 w-[160px] bg-background text-xs'>
              <SelectValue placeholder='District' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All districts</SelectItem>
              {divisions.map((d) => (
                <SelectItem key={d.divisionId} value={d.division}>{d.division}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={zoneFilter} onValueChange={(v) => { setZoneFilter(v); setPage(1); }}>
            <SelectTrigger className='h-8 w-[160px] bg-background text-xs'>
              <SelectValue placeholder='Group' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All groups</SelectItem>
              {zones.map((z) => (
                <SelectItem key={z._id} value={z._id}>{z.label || z.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className='relative'>
            <Search className='absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground' />
            <Input
              className='h-8 w-[180px] bg-background pl-8 text-xs'
              placeholder='Search area…'
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className='p-0'>
        {loading ? (
          <InlineLoader domain='settings' text='Loading Areas' />
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full text-[13px]'>
              <thead>
                <tr className='border-b bg-muted/20 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground'>
                  <th className='px-3 py-1.5'>Area</th>
                  <th className='px-3 py-1.5'>District</th>
                  <th className='px-3 py-1.5'>Charge group</th>
                  <th className='px-3 py-1.5'>Override (৳)</th>
                  <th className='px-3 py-1.5'>Effective</th>
                  <th className='px-3 py-1.5'>Status</th>
                </tr>
              </thead>
              <tbody>
                {districts.map((d) => (
                  <tr
                    key={d._id}
                    className='border-b border-border/50 transition-colors last:border-0 hover:bg-muted/30'
                  >
                    <td className='px-3 py-1.5'>
                      <div className='flex items-center gap-1.5'>
                        <span className='font-medium'>{d.name}</span>
                        {d.chargeOverride !== null && (
                          <Badge variant='secondary' className='rounded-full px-1.5 text-[10px]'>
                            override
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className='px-3 py-1.5'>
                      <Select
                        value={d.divisionId}
                        onValueChange={(v) => handleUpdate(d, { divisionId: v })}
                      >
                        <SelectTrigger className='h-7 w-[140px] text-xs text-muted-foreground'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {divisions.map((dv) => (
                            <SelectItem key={dv.divisionId} value={dv.divisionId}>
                              {dv.division}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className='px-3 py-1.5'>
                      <Select
                        value={d.zone?._id ?? "none"}
                        onValueChange={(v) => handleUpdate(d, { zone: v === "none" ? null : v })}
                      >
                        <SelectTrigger className='h-7 w-[150px] text-xs'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='none'>No group</SelectItem>
                          {zones.map((z) => (
                            <SelectItem key={z._id} value={z._id}>{z.label || z.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className='px-3 py-1.5'>
                      <Input
                        className='h-7 w-20 text-xs'
                        type='number'
                        placeholder='—'
                        defaultValue={d.chargeOverride ?? ""}
                        onBlur={(e) => {
                          const raw = e.target.value;
                          const val = raw === "" ? null : Number(raw);
                          if (val !== d.chargeOverride && (val === null || (!isNaN(val) && val >= 0))) {
                            handleUpdate(d, { chargeOverride: val });
                          }
                        }}
                      />
                    </td>
                    <td className='px-3 py-1.5 font-semibold'>৳{d.effectiveCharge}</td>
                    <td className='px-3 py-1.5'>
                      {(d.courierMappings?.pathao?.needsReview ||
                        d.courierMappings?.carrybee?.needsReview) ? (
                        <Badge variant='destructive' className='gap-1 rounded-full text-[10px]'>
                          <AlertCircle className='h-3 w-3' /> mapping
                        </Badge>
                      ) : (
                        <span className='inline-flex items-center gap-1 text-xs text-muted-foreground'>
                          <CheckCircle2 className='h-3.5 w-3.5 text-emerald-500' /> ok
                        </span>
                      )}
                      {savingId === d._id && (
                        <Dots className='ml-2 inline h-3 w-5 text-muted-foreground' />
                      )}
                    </td>
                  </tr>
                ))}
                {districts.length === 0 && (
                  <tr>
                    <td colSpan={6} className='px-3 py-10 text-center text-sm text-muted-foreground'>
                      No areas match the current filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className='flex items-center justify-between border-t px-3 py-2'>
            <p className='text-[11px] text-muted-foreground'>
              Page {page} of {totalPages}
            </p>
            <div className='flex items-center gap-1.5'>
              <Button
                size='sm'
                variant='outline'
                className='h-7 gap-1 text-xs'
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className='h-3 w-3' /> Prev
              </Button>
              <Button
                size='sm'
                variant='outline'
                className='h-7 gap-1 text-xs'
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next <ChevronRight className='h-3 w-3' />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────── Districts tab

/**
 * District-level view: every district (backend "division") with its areas
 * expandable underneath. Areas can be moved to a different district here —
 * e.g. one added under the wrong district by mistake.
 */
function DistrictsTab({
  zones,
  onChanged,
}: {
  zones: DeliveryZone[];
  onChanged: () => void;
}) {
  const [divisions, setDivisions] = useState<DivisionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [areasByDivision, setAreasByDivision] = useState<Map<string, LocationDistrict[]>>(
    new Map(),
  );
  const [loadingAreas, setLoadingAreas] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  // inline add-area (inside an expanded district card)
  const [areaName, setAreaName] = useState("");
  const [areaZoneId, setAreaZoneId] = useState<string>("none");
  const [areaSaving, setAreaSaving] = useState(false);

  const loadDivisions = useCallback(async () => {
    setLoading(true);
    const res = await getDivisions();
    if (res.success && res.data) setDivisions(res.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadDivisions();
  }, [loadDivisions]);

  const loadAreas = useCallback(async (divisionName: string) => {
    setLoadingAreas(divisionName);
    const res = await getDistricts({ division: divisionName, limit: 200, page: 1 });
    if (res.success && res.data) {
      setAreasByDivision((prev) => {
        const next = new Map(prev);
        next.set(divisionName, res.data!.districts);
        return next;
      });
    }
    setLoadingAreas(null);
  }, []);

  const toggle = (division: DivisionInfo) => {
    if (expanded === division.divisionId) {
      setExpanded(null);
      return;
    }
    setExpanded(division.divisionId);
    if (!areasByDivision.has(division.division)) loadAreas(division.division);
  };

  // Move an area to a different district
  const handleMove = async (area: LocationDistrict, divisionId: string) => {
    const target = divisions.find((d) => d.divisionId === divisionId);
    if (!target || target.division === area.division) return;
    setMovingId(area._id);
    const res = await updateDistrict(area._id, { divisionId });
    setMovingId(null);
    if (res.success) {
      toast.success(`"${area.name}" moved to ${target.division}`);
      loadAreas(area.division);
      if (areasByDivision.has(target.division)) loadAreas(target.division);
      loadDivisions(); // refresh counts
      onChanged();
    } else {
      toast.error(res.error || "Failed to move area");
    }
  };

  // Add an area directly inside an expanded district card
  const handleAddArea = async (division: DivisionInfo) => {
    const name = areaName.trim();
    if (!name) {
      toast.error("Enter an area name");
      return;
    }
    setAreaSaving(true);
    const res = await createDistrict({
      name,
      divisionId: division.divisionId,
      division: division.division,
      zone: areaZoneId === "none" ? null : areaZoneId,
    });
    setAreaSaving(false);
    if (res.success) {
      toast.success(`Area "${name}" added under ${division.division}`);
      setAreaName("");
      setAreaZoneId("none");
      loadAreas(division.division);
      loadDivisions(); // refresh counts
      onChanged();
    } else {
      toast.error(res.error || "Failed to create area");
    }
  };

  const visible = divisions.filter(
    (d) =>
      !filter ||
      d.division.toLowerCase().includes(filter.toLowerCase()),
  );

  const isMobile = useIsMobile();

  return (
    <div className='space-y-2'>
      {/* Toolbar */}
      <div className='flex flex-wrap items-center gap-1.5 rounded-lg border bg-card px-2.5 py-2 shadow-sm'>
        <span className='mr-auto text-xs text-muted-foreground'>
          {divisions.length} districts · expand a district to view and manage its areas
        </span>
        <div className='relative mobile:w-full'>
          <Search className='absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground' />
          <Input
            className='h-8 w-[200px] bg-muted/40 pl-8 text-xs shadow-none mobile:h-9 mobile:w-full'
            placeholder='Filter districts…'
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      {/* District cards — two-column grid */}
      {loading ? (
        <Card className='shadow-sm'>
          <InlineLoader domain='settings' text='Loading Districts' />
        </Card>
      ) : (
        <div className='grid grid-cols-1 items-start gap-2.5 lg:grid-cols-2'>
          {visible.map((division) => {
            const areas = areasByDivision.get(division.division);
            const isOpen = expanded === division.divisionId;
            return (
              <Card key={division.divisionId} className='overflow-hidden shadow-sm'>
                <button
                  type='button'
                  className='flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-muted/40'
                  onClick={() => toggle(division)}
                >
                  <ChevronDown
                    className={`h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform ${
                      isOpen ? "" : "-rotate-90"
                    }`}
                  />
                  <MapPin className='h-3.5 w-3.5 shrink-0 text-primary' />
                  <span className='text-[13px] font-medium'>{division.division}</span>
                  {division.bnName && (
                    <span className='truncate text-[11px] text-muted-foreground'>{division.bnName}</span>
                  )}
                  <Badge variant='secondary' className='ml-auto rounded-full px-1.5 text-[10px] font-semibold'>
                    {division.districtCount} areas
                  </Badge>
                </button>

                {isOpen && (
                  <div className='border-t border-border/50 bg-muted/10'>
                    {loadingAreas === division.division && !areas ? (
                      <InlineLoader
                        domain='settings'
                        text='Loading Areas'
                        className='py-5'
                      />
                    ) : !areas || areas.length === 0 ? (
                      <p className='px-4 py-3 text-xs text-muted-foreground'>
                        No areas yet — add the first one below.
                      </p>
                    ) : isMobile ? (
                      <div className='flex flex-col gap-2 px-2.5 py-2'>
                        {areas.map((area) => (
                          <div
                            key={area._id}
                            className='rounded-xl border border-border/60 bg-background px-3 py-2.5'
                          >
                            <div className='flex items-center gap-1.5'>
                              <span className='text-[13px] font-medium'>{area.name}</span>
                              {area.chargeOverride !== null && (
                                <Badge variant='secondary' className='rounded-[2px] px-1.5 text-[10px]'>
                                  ৳{area.chargeOverride}
                                </Badge>
                              )}
                              <span className='ml-auto text-[13px] font-semibold'>
                                ৳{area.effectiveCharge}
                              </span>
                            </div>
                            <div className='mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground'>
                              <Layers className='h-3 w-3' />
                              {area.zone ? area.zone.label || area.zone.name : "No group"}
                            </div>
                            <Select
                              value={area.divisionId}
                              onValueChange={(v) => handleMove(area, v)}
                              disabled={movingId === area._id}
                            >
                              <SelectTrigger className='mt-1.5 h-8 w-full text-xs'>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {divisions.map((d) => (
                                  <SelectItem key={d.divisionId} value={d.divisionId}>
                                    {d.division}
                                    {d.division === area.division ? " (current)" : ""}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {movingId === area._id && (
                              <Dots className='mt-1 h-3 w-5 text-muted-foreground' />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <table className='w-full text-[13px]'>
                        <thead>
                          <tr className='border-b bg-muted/20 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground'>
                            <th className='px-3 py-1.5'>Area</th>
                            <th className='px-3 py-1.5'>Charge group</th>
                            <th className='px-3 py-1.5'>Effective</th>
                            <th className='px-3 py-1.5'>District</th>
                          </tr>
                        </thead>
                        <tbody>
                          {areas.map((area) => (
                            <tr
                              key={area._id}
                              className='border-b border-border/40 transition-colors last:border-0 hover:bg-muted/30'
                            >
                              <td className='px-3 py-1.5'>
                                <div className='flex items-center gap-1.5'>
                                  <span className='font-medium'>{area.name}</span>
                                  {area.chargeOverride !== null && (
                                    <Badge variant='secondary' className='rounded-[2px] px-1.5 text-[10px]'>
                                      ৳{area.chargeOverride}
                                    </Badge>
                                  )}
                                </div>
                              </td>
                              <td className='px-3 py-1.5'>
                                <span className='text-xs text-muted-foreground'>
                                  {area.zone ? area.zone.label || area.zone.name : "No group"}
                                </span>
                              </td>
                              <td className='px-3 py-1.5 font-semibold'>৳{area.effectiveCharge}</td>
                              <td className='px-3 py-1.5'>
                                <Select
                                  value={area.divisionId}
                                  onValueChange={(v) => handleMove(area, v)}
                                  disabled={movingId === area._id}
                                >
                                  <SelectTrigger className='h-7 w-[150px] text-xs'>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {divisions.map((d) => (
                                      <SelectItem key={d.divisionId} value={d.divisionId}>
                                        {d.division}
                                        {d.division === area.division ? " (current)" : ""}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {movingId === area._id && (
                                  <Dots className='ml-1.5 inline h-3 w-5 text-muted-foreground' />
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {/* Inline add-area form — scoped to this district */}
                    <div className='flex flex-wrap items-center gap-1.5 border-t border-border/50 px-3 py-2 mobile:flex-col mobile:items-stretch'>
                      <Plus className='h-3.5 w-3.5 shrink-0 text-primary' />
                      <Input
                        className='h-7 w-40 text-xs mobile:h-9 mobile:w-full'
                        placeholder='New area name'
                        value={areaName}
                        onChange={(e) => setAreaName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddArea(division);
                        }}
                      />
                      <Select value={areaZoneId} onValueChange={setAreaZoneId}>
                        <SelectTrigger className='h-7 w-[170px] text-xs mobile:h-9 mobile:w-full'>
                          <SelectValue placeholder='Charge group' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='none'>No group</SelectItem>
                          {zones
                            .filter((z) => z.active)
                            .map((z) => (
                              <SelectItem key={z._id} value={z._id}>
                                {z.label || z.name} — ৳{z.charge}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size='sm'
                        className='h-7 gap-1 text-xs mobile:h-9 mobile:w-full'
                        onClick={() => handleAddArea(division)}
                        disabled={areaSaving}
                      >
                        {areaSaving ? (
                          <ButtonLoadingText text='Adding…' />
                        ) : (
                          <Plus className='h-3 w-3' />
                        )}
                        Add area
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
          {visible.length === 0 && (
            <Card className='shadow-sm'>
              <p className='px-3 py-8 text-center text-sm text-muted-foreground'>
                No districts match "{filter}"
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────── Courier sync

function StatTile({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  tone?: "default" | "warning" | "success";
}) {
  const toneClass =
    tone === "warning"
      ? "text-amber-600 bg-amber-100/70"
      : tone === "success"
        ? "text-emerald-600 bg-emerald-100/70"
        : "text-primary bg-primary/10";
  return (
    <div className='flex items-center gap-2 rounded-lg border bg-muted/20 px-2.5 py-2'>
      <div className={`rounded-md p-1.5 ${toneClass}`}>
        <Icon className='h-3.5 w-3.5' />
      </div>
      <div className='min-w-0'>
        <p className='text-base font-bold leading-none'>{value}</p>
        <p className='mt-0.5 truncate text-[10px] font-medium text-muted-foreground'>{label}</p>
      </div>
    </div>
  );
}

function CourierMappingsTab() {
  const [statuses, setStatuses] = useState<Record<string, SyncStatus | null>>({});
  const [syncing, setSyncing] = useState<string | null>(null);

  const loadStatuses = useCallback(async () => {
    const [p, c] = await Promise.all([
      getCourierSyncStatus("pathao"),
      getCourierSyncStatus("carrybee"),
    ]);
    setStatuses({
      pathao: p.success ? (p.data as SyncStatus) : null,
      carrybee: c.success ? (c.data as SyncStatus) : null,
    });
  }, []);

  useEffect(() => {
    loadStatuses();
  }, [loadStatuses]);

  const handleSync = async (provider: "pathao" | "carrybee", force: boolean) => {
    setSyncing(provider);
    const res = await syncCourierMappings(provider, force);
    setSyncing(null);
    if (res.success) {
      toast.success(`${provider} sync complete`);
      loadStatuses();
    } else {
      toast.error(res.error || `${provider} sync failed`);
    }
  };

  return (
    <div className='grid gap-2.5 lg:grid-cols-2'>
      {(["pathao", "carrybee"] as const).map((provider) => {
        const status = statuses[provider];
        const coverage = status && status.total > 0
          ? Math.round((status.matched / status.total) * 100)
          : 0;
        return (
          <Card key={provider} className='overflow-hidden shadow-sm'>
            <CardHeader className='flex-row items-center justify-between space-y-0 border-b bg-muted/30 p-2.5'>
              <div className='flex items-center gap-2'>
                <div className='rounded-md bg-primary/10 p-1.5 text-primary'>
                  <Truck className='h-3.5 w-3.5' />
                </div>
                <CardTitle className='text-sm capitalize'>{provider}</CardTitle>
              </div>
              <div className='flex gap-1.5'>
                <Button
                  size='sm'
                  className='h-8 gap-1 text-xs'
                  onClick={() => handleSync(provider, false)}
                  disabled={syncing !== null}
                >
                  {syncing === provider ? (
                    <ButtonLoadingText text='Syncing…' />
                  ) : (
                    <RefreshCw className='h-3.5 w-3.5' />
                  )}
                  Sync
                </Button>
                <Button
                  size='sm'
                  variant='outline'
                  className='h-8 text-xs'
                  onClick={() => handleSync(provider, true)}
                  disabled={syncing !== null}
                >
                  Re-sync all
                </Button>
              </div>
            </CardHeader>
            <CardContent className='space-y-2.5 p-2.5'>
              {status ? (
                <>
                  <div className='grid grid-cols-2 gap-2 xl:grid-cols-4'>
                    <StatTile label='Total areas' value={status.total} icon={Boxes} />
                    <StatTile label='Matched' value={status.matched} icon={CheckCircle2} tone='success' />
                    <StatTile label='Needs review' value={status.needsReview} icon={AlertCircle} tone='warning' />
                    <StatTile label='Unmatched' value={status.unmatched} icon={MapPin} />
                  </div>
                  <div>
                    <div className='mb-1 flex items-center justify-between text-[11px]'>
                      <span className='font-medium text-muted-foreground'>Coverage</span>
                      <span className='font-semibold'>{coverage}%</span>
                    </div>
                    <div className='h-1.5 overflow-hidden rounded-full bg-muted'>
                      <div
                        className='h-full rounded-full bg-gradient-to-r from-emerald-500 to-sky-500 transition-all'
                        style={{ width: `${coverage}%` }}
                      />
                    </div>
                  </div>
                  <div className='flex flex-wrap items-center justify-between gap-1 text-[11px] text-muted-foreground'>
                    <span className='inline-flex items-center gap-1'>
                      Last synced:{" "}
                      {status.lastSyncedAt
                        ? new Date(status.lastSyncedAt).toLocaleString()
                        : "never"}
                    </span>
                    {status.needsReview > 0 && (
                      <span className='inline-flex items-center gap-1 font-medium text-amber-600'>
                        Review flagged rows in the Areas tab <ArrowRight className='h-3 w-3' />
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <InlineLoader
                  domain='settings'
                  text='Checking Sync Status'
                  className='py-6'
                />
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
