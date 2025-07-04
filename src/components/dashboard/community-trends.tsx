import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

const trends = [
  { name: "S&P 500 ETF", category: "ETF", popularity: 92 },
  { name: "Tech Bundle", category: "Bundle", popularity: 85 },
  { name: "Apple Inc.", category: "Stock", popularity: 78 },
  { name: "Green Energy", category: "Bundle", popularity: 65 },
];

export default function CommunityTrends() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Community Trends
        </CardTitle>
        <CardDescription>
          Popular investments among investors aged 18-30.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead className="text-right">Category</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trends.map((trend) => (
              <TableRow key={trend.name}>
                <TableCell className="font-medium">{trend.name}</TableCell>
                <TableCell className="text-right">
                  <Badge variant="outline">{trend.category}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
