import { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CalendarArrowUp,
  CalendarArrowDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const ITEMS_PER_PAGE = 6;

interface TableLayoutProps<T extends { createdAt?: string }> {
  headers: string[];
  data: T[];
  renderRow: (item: T, index: number) => React.ReactNode;
  caption?: string;
}

function TableLayout<T extends { createdAt?: string }>({
  headers,
  data,
  renderRow,
  caption,
}: TableLayoutProps<T>) {
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);

  const sortedData = [...data].sort((a, b) => {
    const dateA = new Date(a.createdAt ?? 0).getTime();
    const dateB = new Date(b.createdAt ?? 0).getTime();
    return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
  });

  const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentData = sortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const toggleSort = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      <Table>
        {caption && <TableCaption>{caption}</TableCaption>}
        <TableHeader>
          <TableRow>
            {headers.map((header, index) =>
              header === "Date" ? (
                <TableHead
                  key={index}
                  className="flex gap-2 items-center hover:cursor-pointer select-none"
                  onClick={toggleSort}
                >
                  {header}
                  {sortOrder === "desc" ? (
                    <CalendarArrowDown size={14} />
                  ) : (
                    <CalendarArrowUp size={14} />
                  )}
                </TableHead>
              ) : (
                <TableHead key={index}>{header}</TableHead>
              ),
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentData.map((item, index) =>
            renderRow(item, startIndex + index),
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <p className="text-sm text-muted-foreground">
          Showing {startIndex + 1}–
          {Math.min(startIndex + ITEMS_PER_PAGE, sortedData.length)} of{" "}
          {sortedData.length} reports
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
          </Button>

          {/* Page numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (p) =>
                p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1,
            )
            .reduce<(number | string)[]>((acc, p, i, arr) => {
              if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
              acc.push(p);
              return acc;
            }, [])
            .map((p, i) =>
              p === "..." ? (
                <span
                  key={`ellipsis-${i}`}
                  className="px-2 text-muted-foreground"
                >
                  ...
                </span>
              ) : (
                <Button
                  key={p}
                  variant={currentPage === p ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(p as number)}
                >
                  {p}
                </Button>
              ),
            )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default TableLayout;
