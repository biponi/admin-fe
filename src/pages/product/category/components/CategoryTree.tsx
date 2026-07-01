// CategoryTree.tsx
// Replaces renderTreeView / renderCategoryRow — owns expand/collapse state
// and recursively renders CategoryTreeRow with correct connector-line context.
import { useMemo, useState } from "react";
import { ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import CategoryTreeRow from "./CategoryTreeRow";
import type { ICategory } from "../../interface";

interface CategoryTreeProps {
  categories: ICategory[];
  onEdit: (category: ICategory) => void;
  deleteExistingCategory: (id: string, force?: boolean) => Promise<boolean>;
  /** optional — falls back to categoryHierarchy on the node if not provided */
  getBreadcrumb?: (category: ICategory) => string | undefined;
}

const columns = [
  { label: "Category", className: "" },
  { label: "Path", className: "hidden lg:table-cell" },
  { label: "Status", className: "" },
  { label: "Depth", className: "hidden md:table-cell" },
  { label: "Products", className: "hidden md:table-cell" },
  { label: "Discount", className: "hidden md:table-cell" },
  { label: "", className: "w-10" },
];

const collectParentIds = (categories: ICategory[]): string[] => {
  const ids: string[] = [];
  const walk = (nodes: ICategory[]) => {
    for (const node of nodes) {
      if (node.children && node.children.length > 0) {
        ids.push(node.id);
        walk(node.children);
      }
    }
  };
  walk(categories);
  return ids;
};

const defaultGetBreadcrumb = (category: ICategory): string | undefined => {
  if (category.categoryHierarchy && category.categoryHierarchy.length > 0) {
    return category.categoryHierarchy.map((c: any) => c.name).join(" / ");
  }
  return undefined;
};

const CategoryTree: React.FC<CategoryTreeProps> = ({
  categories,
  onEdit,
  deleteExistingCategory,
  getBreadcrumb = defaultGetBreadcrumb,
}) => {
  const allParentIds = useMemo(
    () => collectParentIds(categories),
    [categories],
  );
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(allParentIds),
  );

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => setExpanded(new Set(allParentIds));
  const collapseAll = () => setExpanded(new Set());

  const renderTreeView = (
    nodes: ICategory[],
    level = 0,
    ancestorHasMore: boolean[] = [],
  ): JSX.Element[] => {
    return nodes.flatMap((category, index) => {
      const isLast = index === nodes.length - 1;
      const hasChildren = !!category.children && category.children.length > 0;
      const isExpanded = expanded.has(category.id);

      const row = (
        <CategoryTreeRow
          key={category.id}
          category={category}
          level={level}
          isLast={isLast}
          ancestorHasMore={ancestorHasMore}
          hasChildren={hasChildren}
          isExpanded={isExpanded}
          onToggleExpand={() => toggleExpand(category.id)}
          breadcrumb={getBreadcrumb(category)}
          handleEditBtnClick={() => onEdit(category)}
          deleteExistingCategory={deleteExistingCategory}
        />
      );

      const childRows =
        hasChildren && isExpanded
          ? renderTreeView(category.children!, level + 1, [
              ...ancestorHasMore,
              !isLast,
            ])
          : [];

      return [row, ...childRows];
    });
  };

  return (
    <>
      <div className='flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-4 py-2'>
        <span className='text-[11px] font-semibold uppercase tracking-widest text-slate-400'>
          {categories.length} root{" "}
          {categories.length === 1 ? "category" : "categories"}
        </span>
        <div className='flex items-center gap-1'>
          <Button
            size='sm'
            variant='ghost'
            onClick={expandAll}
            className='h-7 gap-1.5 px-2 text-xs text-slate-500 hover:text-indigo-600'>
            <ChevronsUpDown className='h-3.5 w-3.5' />
            Expand all
          </Button>
          <Button
            size='sm'
            variant='ghost'
            onClick={collapseAll}
            className='h-7 gap-1.5 px-2 text-xs text-slate-500 hover:text-indigo-600'>
            <ChevronsDownUp className='h-3.5 w-3.5' />
            Collapse all
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className='border-slate-100 hover:bg-transparent'>
            {columns.map((col) => (
              <TableHead
                key={col.label || "actions"}
                className={`text-[11px] uppercase tracking-widest text-slate-400 ${col.className}`}>
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.length > 0 ? (
            renderTreeView(categories)
          ) : (
            <TableRow>
              <td
                colSpan={columns.length}
                className='py-10 text-center text-sm text-slate-400'>
                No categories yet.
              </td>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
};

export default CategoryTree;
