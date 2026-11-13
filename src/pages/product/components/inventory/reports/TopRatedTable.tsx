import { Star, Sparkles } from "lucide-react";
import { ReportTable, type ReportColumn } from "../reportScaffold/ReportTable";
import { ReportStatTiles } from "../reportScaffold/ReportStatTiles";
import { MonoCell, RatingCell, ProductNameCell } from "../reportScaffold/reportCells";
import { formatNumber } from "../../../../../utils/inventoryReportUtils";
import { TopRatedProduct } from "../../../../../api/inventoryReport";

interface TopRatedTableProps {
  data: TopRatedProduct[];
}

const columns: ReportColumn<TopRatedProduct>[] = [
  {
    key: "rank",
    header: "Rank",
    align: "center",
    mobileSlot: "hidden",
    render: (_, i) => <RankBadge rank={i + 1} />,
  },
  {
    key: "name",
    header: "Product",
    widthClass: "min-w-[200px]",
    mobileSlot: "title",
    render: (p) => <ProductNameCell name={p.name} />,
  },
  {
    key: "sku",
    header: "SKU",
    mobileSlot: "meta",
    render: (p) => <MonoCell value={p.sku} />,
  },
  {
    key: "rating",
    header: "Rating",
    align: "center",
    mobileSlot: "trailing",
    render: (p) => <RatingCell rating={p.rating} votes={p.totalReviews} />,
  },
  {
    key: "reviews",
    header: "Reviews",
    align: "right",
    mobileSlot: "meta",
    render: (p) => (
      <span className='tabular-nums text-[#141413]'>
        {formatNumber(p.totalReviews)}
      </span>
    ),
  },
];

const RankBadge = ({ rank }: { rank: number }) =>
  rank === 1 ? (
    <span className='inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#C96442] text-white text-xs font-bold'>
      {rank}
    </span>
  ) : (
    <span className='inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#F5F1EA] text-[#57554D] text-xs font-semibold'>
      {rank}
    </span>
  );

/**
 * Top Rated Table — highest customer-rated products.
 */
export const TopRatedTable = ({ data }: TopRatedTableProps) => {
  // API may return rating as a string ("4.5") — normalize before any math
  const rows = (Array.isArray(data) ? data : []).map((p) => ({
    ...p,
    rating: Number(p.rating) || 0,
  }));
  const avgRating = rows.length
    ? rows.reduce((sum, p) => sum + p.rating, 0) / rows.length
    : 0;
  const totalReviews = rows.reduce((sum, p) => sum + p.totalReviews, 0);
  const perfectRatings = rows.filter((p) => p.rating >= 4.5).length;

  return (
    <div className='space-y-3'>
      <ReportStatTiles
        tiles={[
          {
            label: "Highest rating",
            value: (rows[0]?.rating ?? 0).toFixed(1),
            tone: "warn",
            icon: <Star className='h-3.5 w-3.5' />,
          },
          {
            label: "Perfect ratings",
            value: `${perfectRatings} / ${rows.length}`,
            sub: "4.5 stars and above",
            tone: "good",
          },
          { label: "Total reviews", value: formatNumber(totalReviews) },
          { label: "Avg rating", value: avgRating.toFixed(1) },
        ]}
      />
      <ReportTable
        columns={columns}
        rows={rows}
        rowKey={(_, i) => i}
        empty={{
          icon: <Sparkles className='h-5 w-5' />,
          title: "No Ratings Yet",
          description: "No products have been rated by customers",
        }}
        summary={[{ label: "Products Listed", value: rows.length }]}
      />
    </div>
  );
};

export default TopRatedTable;
