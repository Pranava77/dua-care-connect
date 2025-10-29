import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Heart, AlertCircle, FileText, TrendingUp, Calendar, Activity } from "lucide-react";
import { mockApi } from "@/lib/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

export default function Dashboard() {
  const [stats, setStats] = useState({
    residents: 0,
    medicalCases: 0,
    prescriptions: 0,
    staff: 0
  });
  const [recentResidents, setRecentResidents] = useState<any[]>([]);
  const [recentPrescriptions, setRecentPrescriptions] = useState<any[]>([]);
  const [chartData, setChartData] = useState({
    occupancyTrend: [],
    revenueTrend: [],
    medicalAlerts: [],
    staffAttendance: []
  });
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [residentsResult, medicalResult, prescriptionsResult, staffResult] = await Promise.all([
        mockApi.getResidents(),
        mockApi.getMedicalRecords(),
        mockApi.getRecentPrescriptions(),
        mockApi.getStaff()
      ]);

      setStats({
        residents: residentsResult.data?.length || 0,
        medicalCases: medicalResult.data?.length || 0,
        prescriptions: prescriptionsResult.data?.length || 0,
        staff: staffResult.data?.length || 0
      });

      const recentResidentsData = await mockApi.getRecentResidents();

      setRecentResidents(recentResidentsData.data || []);
      setRecentPrescriptions(prescriptionsResult.data || []);

      // Generate mock chart data
      setChartData({
        occupancyTrend: [
          { month: 'Jan', occupancy: 85, admissions: 3 },
          { month: 'Feb', occupancy: 88, admissions: 2 },
          { month: 'Mar', occupancy: 92, admissions: 4 },
          { month: 'Apr', occupancy: 89, admissions: 1 },
          { month: 'May', occupancy: 95, admissions: 5 },
          { month: 'Jun', occupancy: 91, admissions: 2 }
        ],
        revenueTrend: [
          { month: 'Jan', revenue: 185000, expenses: 120000 },
          { month: 'Feb', revenue: 192000, expenses: 125000 },
          { month: 'Mar', revenue: 210000, expenses: 130000 },
          { month: 'Apr', revenue: 198000, expenses: 128000 },
          { month: 'May', revenue: 225000, expenses: 135000 },
          { month: 'Jun', revenue: 218000, expenses: 132000 }
        ],
        medicalAlerts: [
          { name: 'Critical', value: 2, color: '#ef4444' },
          { name: 'High', value: 5, color: '#f97316' },
          { name: 'Medium', value: 8, color: '#eab308' },
          { name: 'Low', value: 12, color: '#22c55e' }
        ],
        staffAttendance: [
          { day: 'Mon', present: 18, absent: 2 },
          { day: 'Tue', present: 19, absent: 1 },
          { day: 'Wed', present: 17, absent: 3 },
          { day: 'Thu', present: 20, absent: 0 },
          { day: 'Fri', present: 18, absent: 2 },
          { day: 'Sat', present: 16, absent: 4 },
          { day: 'Sun', present: 15, absent: 5 }
        ]
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const dashboardStats = [
    {
      title: "Total Residents",
      value: stats.residents.toString(),
      icon: Users,
      trend: `${recentResidents.length} recent`,
      color: "text-primary",
      borderColor: "bg-primary",
      isPrimary: true,
    },
    {
      title: "Medical Records",
      value: stats.medicalCases.toString(),
      icon: Heart,
      trend: "Active cases",
      color: "text-secondary",
      borderColor: "bg-secondary",
      isPrimary: false,
    },
    {
      title: "Prescriptions",
      value: stats.prescriptions.toString(),
      icon: FileText,
      trend: "Total tracked",
      color: "text-warning",
      borderColor: "bg-warning",
      isPrimary: false,
    },
    {
      title: "Staff Members",
      value: stats.staff.toString(),
      icon: AlertCircle,
      trend: "Active staff",
      color: "text-success",
      borderColor: "bg-success",
      isPrimary: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-headline-1 font-bold text-gradient-primary">Dashboard</h2>
        <p className="text-body text-muted-foreground">Welcome back! Here's your institution overview.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat) => (
          <Card key={stat.title} className={`relative overflow-hidden hover:scale-105 transition-all duration-300 card-hover ${stat.isPrimary ? 'pulse-primary' : ''}`}>
            <div className={`absolute left-0 top-0 h-full w-1 ${stat.borderColor}`} />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color} transition-transform hover:scale-110`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="overflow-hidden border-0 shadow-lg card-hover">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="p-2 rounded-lg bg-primary text-primary-foreground">
                <TrendingUp className="h-5 w-5" />
              </div>
              <span className="text-gradient-primary font-semibold">
                Occupancy Trend
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={chartData.occupancyTrend} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <defs>
                  <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                    color: 'hsl(var(--card-foreground))'
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: '600' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="occupancy" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  fill="url(#occupancyGradient)"
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2, fill: 'hsl(var(--background))' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 shadow-lg card-hover">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="p-2 rounded-lg bg-success text-success-foreground">
                <FileText className="h-5 w-5" />
              </div>
              <span className="text-success font-semibold">
                Revenue vs Expenses
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={chartData.revenueTrend} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value: number) => [`£${(value / 1000).toFixed(0)}K`, '']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                    color: 'hsl(var(--card-foreground))'
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: '600' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="line"
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--success))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--success))', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: 'hsl(var(--success))', strokeWidth: 2, fill: 'hsl(var(--background))' }}
                  name="Revenue"
                />
                <Line 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="hsl(var(--destructive))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--destructive))', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: 'hsl(var(--destructive))', strokeWidth: 2, fill: 'hsl(var(--background))' }}
                  name="Expenses"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="overflow-hidden border-0 shadow-lg card-hover">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="p-2 rounded-lg bg-warning text-warning-foreground">
                <AlertCircle className="h-5 w-5" />
              </div>
              <span className="text-warning font-semibold">
                Medical Alerts Distribution
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={chartData.medicalAlerts}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  innerRadius={40}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.medicalAlerts.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      stroke="hsl(var(--card))"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                    color: 'hsl(var(--card-foreground))'
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: '600' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {chartData.medicalAlerts.map((alert, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: alert.color }}
                  />
                  <span className="text-sm text-muted-foreground">{alert.name}</span>
                  <span className="text-sm font-medium">{alert.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 shadow-lg card-hover">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="p-2 rounded-lg bg-secondary text-secondary-foreground">
                <Activity className="h-5 w-5" />
              </div>
              <span className="text-secondary font-semibold">
                Staff Attendance This Week
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartData.staffAttendance} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <defs>
                  <linearGradient id="presentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0.8}/>
                  </linearGradient>
                  <linearGradient id="absentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="day" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                    color: 'hsl(var(--card-foreground))'
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: '600' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="rect"
                />
                <Bar 
                  dataKey="present" 
                  fill="url(#presentGradient)" 
                  name="Present"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="absent" 
                  fill="url(#absentGradient)" 
                  name="Absent"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="overflow-hidden border-0 shadow-lg card-hover">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="p-2 rounded-lg bg-accent text-accent-foreground">
                <Users className="h-5 w-5" />
              </div>
              <span className="text-accent font-semibold">
                Recent Admissions
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {recentResidents.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-8">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  No recent admissions
                </div>
              ) : (
                recentResidents.map((resident) => (
                  <div key={resident.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                        {resident.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{resident.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Admitted {Math.floor((new Date().getTime() - new Date(resident.created_at).getTime()) / (1000 * 60 * 60 * 24))} days ago
                        </p>
                      </div>
                    </div>
                    <span className="text-xs bg-success text-success-foreground px-3 py-1 rounded-full font-medium">New</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 shadow-lg card-hover">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="p-2 rounded-lg bg-primary text-primary-foreground">
                <FileText className="h-5 w-5" />
              </div>
              <span className="text-primary font-semibold">
                Upcoming Prescription Refills
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {recentPrescriptions.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-8">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  No upcoming refills
                </div>
              ) : (
                recentPrescriptions.map((prescription) => (
                  <div key={prescription.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-warning text-warning-foreground flex items-center justify-center font-semibold text-sm">
                        💊
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{prescription.medication}</p>
                        <p className="text-sm text-muted-foreground">
                          For {prescription.residents?.name}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs bg-warning text-warning-foreground px-3 py-1 rounded-full font-medium">{prescription.status}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
