import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Download, TrendingUp, TrendingDown, DollarSign, CreditCard } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Accounting() {
  const financialStats = [
    {
      title: "Total Revenue",
      value: "₹18.5L",
      trend: "+12.5%",
      icon: TrendingUp,
      color: "text-success",
    },
    {
      title: "Outstanding Dues",
      value: "₹2.4L",
      trend: "-5.2%",
      icon: TrendingDown,
      color: "text-warning",
    },
    {
      title: "This Month",
      value: "₹4.2L",
      trend: "+8.3%",
      icon: DollarSign,
      color: "text-primary",
    },
    {
      title: "Paid Today",
      value: "₹45,000",
      trend: "3 payments",
      icon: CreditCard,
      color: "text-secondary",
    },
  ];

  const recentInvoices = [
    { id: "INV-001", resident: "Rajesh Kumar", amount: "₹15,000", status: "Paid", date: "2025-10-01", method: "UPI" },
    { id: "INV-002", resident: "Meena Patel", amount: "₹18,500", status: "Pending", date: "2025-09-28", method: "Pending" },
    { id: "INV-003", resident: "Suresh Reddy", amount: "₹22,000", status: "Overdue", date: "2025-09-15", method: "-" },
    { id: "INV-004", resident: "Lakshmi Iyer", amount: "₹16,000", status: "Paid", date: "2025-09-30", method: "Card" },
    { id: "INV-005", resident: "Vijay Singh", amount: "₹19,500", status: "Paid", date: "2025-10-02", method: "NEFT" },
  ];

  const services = [
    { name: "Room Charges", revenue: "₹8.5L", percentage: 46 },
    { name: "Nursing Care", revenue: "₹5.2L", percentage: 28 },
    { name: "Medical Services", revenue: "₹3.1L", percentage: 17 },
    { name: "Diagnostics", revenue: "₹1.7L", percentage: 9 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Accounting & Billing</h2>
          <p className="text-muted-foreground">Manage invoices, payments, and financial records</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {financialStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Resident</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Method</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.id}</TableCell>
                    <TableCell>{invoice.resident}</TableCell>
                    <TableCell className="font-semibold">{invoice.amount}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          invoice.status === "Paid"
                            ? "default"
                            : invoice.status === "Overdue"
                            ? "destructive"
                            : "secondary"
                        }
                        className={
                          invoice.status === "Paid"
                            ? "bg-success/10 text-success hover:bg-success/20"
                            : ""
                        }
                      >
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{invoice.date}</TableCell>
                    <TableCell className="text-sm">{invoice.method}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by Service</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {services.map((service) => (
                <div key={service.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{service.name}</span>
                    <span className="text-muted-foreground">{service.revenue}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${service.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{service.percentage}% of total</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
