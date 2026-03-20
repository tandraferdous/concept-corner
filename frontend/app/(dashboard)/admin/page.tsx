'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  RefreshCw,
  Download,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import { adminApi } from '@/utils/api';
import { formatPrice, formatDate } from '@/utils/helpers';

interface Stats {
  totalUsers: number;
  totalRevenue: number;
  totalCourses: number;
  totalEnrollments: number;
  revenueGrowth: number;
  usersGrowth: number;
  enrollmentsGrowth: number;
  coursesGrowth: number;
}

interface Transaction {
  _id: string;
  user?: { name: string; email: string };
  amount: number;
  status: 'success' | 'pending' | 'failed';
  createdAt: string;
  courses?: { title: string }[];
}

const MOCK_REVENUE_DATA = [
  { month: 'Jul', revenue: 42000 },
  { month: 'Aug', revenue: 58000 },
  { month: 'Sep', revenue: 51000 },
  { month: 'Oct', revenue: 74000 },
  { month: 'Nov', revenue: 89000 },
  { month: 'Dec', revenue: 112000 },
  { month: 'Jan', revenue: 98000 },
];

const MOCK_TRANSACTIONS: Transaction[] = [
  { _id: '1', user: { name: 'Rafiq Ahmed', email: 'rafiq@example.com' }, amount: 1499, status: 'success', createdAt: new Date().toISOString(), courses: [{ title: 'Web Development Bootcamp' }] },
  { _id: '2', user: { name: 'Nusrat Jahan', email: 'nusrat@example.com' }, amount: 1999, status: 'success', createdAt: new Date(Date.now() - 86400000).toISOString(), courses: [{ title: 'Python for Data Science' }] },
  { _id: '3', user: { name: 'Arif Hossain', email: 'arif@example.com' }, amount: 2499, status: 'pending', createdAt: new Date(Date.now() - 172800000).toISOString(), courses: [{ title: 'UI/UX Design Masterclass' }] },
  { _id: '4', user: { name: 'Sadia Islam', email: 'sadia@example.com' }, amount: 999, status: 'failed', createdAt: new Date(Date.now() - 259200000).toISOString(), courses: [{ title: 'Digital Marketing' }] },
];

const MOCK_STATS: Stats = {
  totalUsers: 12543,
  totalRevenue: 524000,
  totalCourses: 87,
  totalEnrollments: 34210,
  revenueGrowth: 23.5,
  usersGrowth: 18.2,
  enrollmentsGrowth: 31.4,
  coursesGrowth: 12.0,
};

const statusColors = {
  success: 'text-accent-400 bg-accent-400/10',
  pending: 'text-yellow-400 bg-yellow-400/10',
  failed: 'text-red-400 bg-red-400/10',
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>(MOCK_STATS);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      adminApi.getDashboardStats(),
      adminApi.getAllPayments({ limit: 10, sort: 'newest' }),
    ])
      .then(([statsRes, paymentsRes]) => {
        if (statsRes.data) setStats(statsRes.data);
        if (paymentsRes.data?.payments) setTransactions(paymentsRes.data.payments);
      })
      .catch(() => {
        // Use mock data on error
      })
      .finally(() => setIsLoading(false));
  }, []);

  const statCards = [
    {
      label: 'Total Revenue',
      value: formatPrice(stats.totalRevenue),
      growth: stats.revenueGrowth,
      icon: <DollarSign size={22} />,
      gradient: 'from-primary-600 to-primary-800',
    },
    {
      label: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      growth: stats.usersGrowth,
      icon: <Users size={22} />,
      gradient: 'from-secondary-600 to-secondary-800',
    },
    {
      label: 'Total Courses',
      value: stats.totalCourses.toLocaleString(),
      growth: stats.coursesGrowth,
      icon: <BookOpen size={22} />,
      gradient: 'from-accent-600 to-accent-800',
    },
    {
      label: 'Enrollments',
      value: stats.totalEnrollments.toLocaleString(),
      growth: stats.enrollmentsGrowth,
      icon: <TrendingUp size={22} />,
      gradient: 'from-yellow-600 to-orange-700',
    },
  ];

  const quickActions = [
    { label: 'Add Course', icon: <Plus size={16} />, href: '/instructor/courses/new', color: 'bg-primary-600' },
    { label: 'Manage Users', icon: <Users size={16} />, href: '/admin/users', color: 'bg-secondary-600' },
    { label: 'View Reports', icon: <Download size={16} />, href: '/admin/reports', color: 'bg-accent-600' },
    { label: 'Refresh', icon: <RefreshCw size={16} />, href: '#', color: 'bg-white/10' },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-20 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-8 mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold font-poppins text-white">Admin Dashboard</h1>
            <p className="text-white/50 mt-1">Platform overview and analytics</p>
          </div>
          <div className="flex gap-3">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="secondary"
                size="sm"
                leftIcon={action.icon}
                onClick={() => action.href !== '#' && (window.location.href = action.href)}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white`}>
                  {card.icon}
                </div>
                <span
                  className={`flex items-center gap-1 text-xs font-semibold ${card.growth >= 0 ? 'text-accent-400' : 'text-red-400'}`}
                >
                  {card.growth >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {Math.abs(card.growth)}%
                </span>
              </div>
              <p className="text-2xl font-bold text-white font-poppins">{card.value}</p>
              <p className="text-white/50 text-xs mt-1">{card.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Revenue chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold font-poppins text-white">Revenue Overview</h2>
              <p className="text-white/40 text-sm">Monthly revenue (BDT)</p>
            </div>
            <span className="px-3 py-1.5 bg-primary-600/20 text-primary-400 text-xs font-semibold rounded-xl border border-primary-500/30">
              Last 7 Months
            </span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={MOCK_REVENUE_DATA} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f1f5f9' }}
                formatter={(value: number) => [`৳${value.toLocaleString()}`, 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#revenueGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <h2 className="text-lg font-semibold font-poppins text-white">Recent Transactions</h2>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-white/5">
                  <th className="px-6 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white text-sm font-medium">{tx.user?.name ?? 'Unknown'}</p>
                        <p className="text-white/40 text-xs">{tx.user?.email ?? ''}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white/70 text-sm line-clamp-1">{tx.courses?.[0]?.title ?? 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white font-semibold text-sm">{formatPrice(tx.amount)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${statusColors[tx.status]}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white/40 text-xs">{formatDate(tx.createdAt)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
