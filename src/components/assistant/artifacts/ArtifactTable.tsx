import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import type { SheetArtifactPayload } from "./types";

/** Sheet artifact renderer — shadcn table with sticky header. */
const ArtifactTable = ({ payload }: { payload: SheetArtifactPayload }) => {
  if (!payload?.columns?.length) {
    return <p className='py-6 text-center text-sm text-muted-foreground'>No table data available</p>;
  }

  const totalRows = payload.totalRows;
  const truncated = totalRows != null && totalRows > payload.rows.length;

  return (
    <div className='rounded-md border'>
      <div className='max-h-[60vh] overflow-auto'>
        <Table>
          <TableHeader className='sticky top-0 bg-muted z-10'>
            <TableRow>
              {payload.columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={
                    col.align === "right"
                      ? "text-right"
                      : col.align === "center"
                      ? "text-center"
                      : "text-left"
                  }
                >
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {payload.rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={payload.columns.length} className='text-center text-muted-foreground'>
                  No rows
                </TableCell>
              </TableRow>
            )}
            {payload.rows.map((row, i) => (
              <TableRow key={i}>
                {payload.columns.map((col) => {
                  const value = row[col.key];
                  return (
                    <TableCell
                      key={col.key}
                      className={
                        col.align === "right"
                          ? "text-right tabular-nums"
                          : col.align === "center"
                          ? "text-center"
                          : "text-left"
                      }
                    >
                      {value == null ? "—" : typeof value === "number" ? value.toLocaleString() : String(value)}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {truncated && (
        <p className='border-t px-3 py-2 text-xs text-muted-foreground'>
          Showing first {payload.rows.length.toLocaleString()} of {totalRows!.toLocaleString()} rows
        </p>
      )}
    </div>
  );
};

export default ArtifactTable;
