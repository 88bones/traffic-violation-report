import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TableLayoutProps<T> {
  headers: string[];
  data: T[];
  renderRow: (item: T, index: number) => React.ReactNode;
  caption?: string;
}

function TableLayout<T>({
  headers,
  data,
  renderRow,
  caption,
}: TableLayoutProps<T>) {
  return (
    <Table>
      {caption && <TableCaption>{caption}</TableCaption>}
      <TableHeader>
        <TableRow>
          {headers.map((header, index) => (
            <TableHead key={index}>{header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>{data.map((item, index) => renderRow(item, index))}</TableBody>
    </Table>
  );
}

export default TableLayout;
