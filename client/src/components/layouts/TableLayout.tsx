import { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CalendarArrowUp, CalendarArrowDown } from "lucide-react";

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
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc"); // ← newest first by default

  const sortedData = [...data].sort((a, b) => {
    const dateA = new Date(a.createdAt ?? 0).getTime();
    const dateB = new Date(b.createdAt ?? 0).getTime();
    return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
  });

  const toggleSort = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  return (
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
        {sortedData.map((item, index) => renderRow(item, index))}
      </TableBody>
    </Table>
  );
}

export default TableLayout;
