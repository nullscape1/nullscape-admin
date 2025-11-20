import { useEffect, useState } from 'react';
import { getMe, api } from '../lib/api';
import {
  Briefcase,
  FileText,
  BookOpen,
  Mail,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  FolderKanban,
  TrendingUp,
  MoreVertical,
  Eye,
  Plus,
  Users,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  color: 'blue' | 'purple' | 'teal' | 'green' | 'orange';
  delay?: number;
}

function StatCard({ title, value, icon: Icon, trend, color, delay = 0 }: StatCardProps) {
  const colorClasses = {
    blue: {
      gradient: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-500/10',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-500/20',
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
    },
    purple: {
      gradient: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-500/10',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-500/20',
      iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600',
    },
    teal: {
      gradient: 'from-teal-500 to-teal-600',
      bg: 'bg-teal-500/10',
      text: 'text-teal-600 dark:text-teal-400',
      border: 'border-teal-500/20',
      iconBg: 'bg-gradient-to-br from-teal-500 to-teal-600',
    },
    green: {
      gradient: 'from-green-500 to-green-600',
      bg: 'bg-green-500/10',
      text: 'text-green-600 dark:text-green-400',
      border: 'border-green-500/20',
      iconBg: 'bg-gradient-to-br from-green-500 to-green-600',
    },
    orange: {
      gradient: 'from-orange-500 to-orange-600',
      bg: 'bg-orange-500/10',
      text: 'text-orange-600 dark:text-orange-400',
      border: 'border-orange-500/20',
      iconBg: 'bg-gradient-to-br from-orange-500 to-orange-600',
    },
  };

  const colors = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="group"
    >
      <div className="stat-card h-full">
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div className={cn('p-4 rounded-2xl shadow-lg', colors.iconBg)}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <button className="btn btn-ghost btn-sm p-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
            <p className="text-4xl font-bold mb-4">{value}</p>
            {trend && (
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'flex items-center gap-1.5 text-sm font-semibold px-2.5 py-1 rounded-lg',
                    trend.isPositive
                      ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                      : 'bg-red-500/10 text-red-600 dark:text-red-400'
                  )}
                >
                  {trend.isPositive ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  <span>{Math.abs(trend.value)}%</span>
                </div>
                <span className="text-xs text-muted-foreground">{trend.label}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const [me, setMe] = useState<any>(null);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMe(), api.get('/analytics/summary')])
      .then(([userData, statsData]) => {
        setMe(userData);
        setStats(statsData.data);
      })
      .catch((err) => {
        setError(err?.response?.data?.message || 'Failed to load data');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const chartData = [
    { name: 'Jan', inquiries: 45, projects: 12, revenue: 12000 },
    { name: 'Feb', inquiries: 52, projects: 15, revenue: 15000 },
    { name: 'Mar', inquiries: 48, projects: 18, revenue: 18000 },
    { name: 'Apr', inquiries: 61, projects: 20, revenue: 20000 },
    { name: 'May', inquiries: 55, projects: 22, revenue: 22000 },
    { name: 'Jun', inquiries: 67, projects: 25, revenue: 25000 },
  ];

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card card-padding">
              <div className="skeleton h-40 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      {me && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card card-padding bg-gradient-to-r from-primary-blue via-primary-purple to-primary-purple text-white border-0 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Welcome back, {me.name}! 👋</h2>
              <p className="text-white/90 text-lg">
                Here's what's happening with your content today.
              </p>
            </div>
            <div className="hidden md:block">
              <Activity className="w-32 h-32 text-white/20" />
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Projects"
          value={stats?.totalProjects ?? 0}
          icon={FolderKanban}
          trend={{ value: 12, isPositive: true, label: 'vs last month' }}
          color="blue"
          delay={0.1}
        />
        <StatCard
          title="Total Services"
          value={stats?.totalServices ?? 0}
          icon={Briefcase}
          trend={{ value: 8, isPositive: true, label: 'vs last month' }}
          color="purple"
          delay={0.2}
        />
        <StatCard
          title="Enquiries Today"
          value={stats?.enquiriesToday ?? 0}
          icon={Mail}
          trend={{ value: 5, isPositive: false, label: 'vs yesterday' }}
          color="teal"
          delay={0.3}
        />
        <StatCard
          title="Blog Posts"
          value={stats?.totalBlogPosts ?? 0}
          icon={BookOpen}
          trend={{ value: 15, isPositive: true, label: 'vs last month' }}
          color="green"
          delay={0.4}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="card card-padding"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold mb-1">Revenue Overview</h3>
              <p className="text-sm text-muted-foreground">Last 6 months performance</p>
            </div>
            <button className="btn btn-ghost btn-sm">
              <TrendingUp className="w-4 h-4" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary-blue))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary-blue))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary-blue))"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Inquiries Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="card card-padding"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold mb-1">Inquiries Trend</h3>
              <p className="text-sm text-muted-foreground">Monthly inquiry volume</p>
            </div>
            <button className="btn btn-ghost btn-sm">
              <Mail className="w-4 h-4" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Line
                type="monotone"
                dataKey="inquiries"
                stroke="hsl(var(--primary-purple))"
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--primary-purple))', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Projects Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="card card-padding"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold mb-1">Projects Overview</h3>
            <p className="text-sm text-muted-foreground">Project completion by month</p>
          </div>
          <button className="btn btn-ghost btn-sm">
            <FolderKanban className="w-4 h-4" />
          </button>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="name" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Bar dataKey="projects" fill="hsl(var(--primary-blue))" radius={[12, 12, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Latest Inquiries */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="card card-padding"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold mb-1">Latest Inquiries</h3>
            <p className="text-sm text-muted-foreground">Recent customer inquiries</p>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-outline btn-sm">
              <Eye className="w-4 h-4" />
              View All
            </button>
            <button className="btn btn-primary btn-sm">
              <Plus className="w-4 h-4" />
              New
            </button>
          </div>
        </div>
        {stats?.latestInquiries?.length ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr className="table-header-row">
                  <th className="table-header-cell">Date</th>
                  <th className="table-header-cell">Name</th>
                  <th className="table-header-cell">Email</th>
                  <th className="table-header-cell">Type</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {stats.latestInquiries.slice(0, 5).map((inquiry: any) => (
                  <tr key={inquiry._id} className="table-row">
                    <td className="table-cell text-sm text-muted-foreground">
                      {new Date(inquiry.createdAt).toLocaleDateString()}
                    </td>
                    <td className="table-cell font-semibold">{inquiry.name || '-'}</td>
                    <td className="table-cell text-muted-foreground">{inquiry.email || '-'}</td>
                    <td className="table-cell">
                      <span className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-muted">
                        {inquiry.type}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-500/10 text-green-600 dark:text-green-400">
                        New
                      </span>
                    </td>
                    <td className="table-cell text-right">
                      <button className="btn btn-ghost btn-sm">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <Mail className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-lg font-semibold mb-2">No inquiries yet</p>
            <p className="text-sm text-muted-foreground">New inquiries will appear here</p>
          </div>
        )}
      </motion.div>

      {error && (
        <div className="card card-padding border-destructive bg-destructive/10">
          <p className="text-destructive font-semibold">{error}</p>
        </div>
      )}
    </div>
  );
}
