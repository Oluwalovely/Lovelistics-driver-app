import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../AuthContext';
import { getMyOrders } from '../services/api';
import SidebarLayout from '../components/SidebarLayout';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import {
    CircleDollarSign, Package, CheckCircle,
    TrendingUp, Calendar, AlertCircle, MapPin, Flag
} from 'lucide-react';

const C = {
    navy: '#0d1f4f', navyL: '#162660', orange: '#e8610a',
    amber: '#d97706', green: '#16a34a', bg: '#f1f4f9',
    white: '#ffffff', border: '#e8edf7', muted: '#64748b', faint: '#94a3b8',
};
const shadow = { boxShadow: '0 1px 3px rgba(13,31,79,0.06), 0 4px 20px rgba(13,31,79,0.05)' };

const PERIODS = [
    { key: '7d',  label: '7 Days' },
    { key: '30d', label: '30 Days' },
    { key: '90d', label: '90 Days' },
    { key: 'all', label: 'All Time' },
];

const isDone = o => ['delivered', 'confirmed'].includes(o.status);

const cutoffDate = period => {
    if (period === 'all') return new Date(0);
    const d = new Date();
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    d.setDate(d.getDate() - days);
    return d;
};

const revenueByDay = orders => {
    const m = {};
    orders.forEach(o => {
        const k = new Date(o.updatedAt || o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        m[k] = (m[k] || 0) + (o.price || 0);
    });
    return Object.entries(m)
        .sort((a, b) => new Date(a[0]) - new Date(b[0]))
        .slice(-14)
        .map(([date, amount]) => ({ date, amount }));
};

const KPICard = ({ title, value, icon, color, sub, prefix = '' }) => (
    <div className="kpi-card" style={{ background: C.white, borderRadius: 14, ...shadow, border: `1px solid ${C.border}`, transition: 'transform 0.18s, box-shadow 0.18s', cursor: 'default' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(13,31,79,0.12)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = shadow.boxShadow; }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>{icon}</div>
        </div>
        <p style={{ margin: 0, fontSize: '0.63rem', fontWeight: 600, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.6px' }}>{title}</p>
        <h2 style={{ margin: '0.2rem 0 0', fontSize: '1.45rem', fontWeight: 800, color: C.navy, lineHeight: 1 }}>{prefix}{typeof value === 'number' ? value.toLocaleString() : value}</h2>
        {sub && <p style={{ margin: '0.2rem 0 0', fontSize: '0.63rem', color: C.faint }}>{sub}</p>}
    </div>
);

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: '0.6rem 0.9rem', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
            <p style={{ margin: 0, fontSize: '0.75rem', color: C.faint, fontWeight: 600 }}>{label}</p>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.9rem', fontWeight: 800, color: C.orange }}>₦{payload[0].value.toLocaleString()}</p>
        </div>
    );
};

const Revenue = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [period, setPeriod] = useState('30d');

    useEffect(() => {
        if (!user?._id) return;
        getMyOrders(user._id)
            .then(r => setOrders(r.data.data))
            .catch(() => setError('Failed to load orders'))
            .finally(() => setLoading(false));
    }, [user]);

    // Filter to completed orders only, within the selected period
    const completedInPeriod = useMemo(() => {
        const cutoff = cutoffDate(period);
        return orders
            .filter(isDone)
            .filter(o => new Date(o.updatedAt || o.createdAt) >= cutoff);
    }, [orders, period]);

    const totalEarnings  = useMemo(() => completedInPeriod.reduce((s, o) => s + (o.price || 0), 0), [completedInPeriod]);
    const totalDeliveries = completedInPeriod.length;
    const avgPerOrder    = totalDeliveries ? Math.round(totalEarnings / totalDeliveries) : 0;

    // Today's earnings
    const todayStr = new Date().toDateString();
    const todayEarnings = useMemo(() =>
        orders.filter(isDone).filter(o => new Date(o.updatedAt || o.createdAt).toDateString() === todayStr)
              .reduce((s, o) => s + (o.price || 0), 0),
    [orders]);

    const chartData = useMemo(() => revenueByDay(completedInPeriod), [completedInPeriod]);

    return (
        <SidebarLayout>
            <style>{`
                .kpi-card { padding: 1rem; }
                @media (min-width: 576px) { .kpi-card { padding: 1.1rem; } }
                @media (min-width: 992px) { .kpi-card { padding: 1.25rem; } }
                .rev-kpi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; }
                @media (min-width: 768px) { .rev-kpi-grid { grid-template-columns: repeat(4, 1fr); } }
                .period-tabs { display: flex; gap: 0.4rem; flex-wrap: wrap; }
                .order-row-card { display: none; }
                @media (max-width: 640px) {
                    .desk-header { display: none !important; }
                    .order-row-desktop { display: none !important; }
                    .order-row-card { display: block !important; }
                }
            `}</style>

            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.25rem 3rem' }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.75rem' }}>
                    <div>
                        <h4 style={{ margin: 0, fontWeight: 800, color: C.navy, fontSize: '1.3rem' }}>My Revenue</h4>
                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: C.muted }}>Track your earnings and delivery history</p>
                    </div>
                    {/* Today chip */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: `${C.green}15`, border: `1px solid ${C.green}30`, borderRadius: 10, padding: '0.45rem 0.9rem' }}>
                        <Calendar size={14} color={C.green} />
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: C.green }}>Today: ₦{todayEarnings.toLocaleString()}</span>
                    </div>
                </div>

                {/* Period Tabs */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <div className="period-tabs">
                        {PERIODS.map(p => (
                            <button key={p.key} onClick={() => setPeriod(p.key)}
                                style={{ padding: '0.4rem 1rem', borderRadius: 8, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', background: period === p.key ? C.navy : C.white, color: period === p.key ? '#fff' : C.muted, border: period === p.key ? 'none' : `1px solid ${C.border}`, boxShadow: period === p.key ? '0 2px 8px rgba(13,31,79,0.15)' : 'none' }}>
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
                        <div className="spinner-border" style={{ color: C.navy }} />
                    </div>
                ) : error ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '1rem 1.25rem', color: '#991b1b' }}>
                        <AlertCircle size={18} /> {error}
                    </div>
                ) : (
                    <>
                        {/* KPI Cards */}
                        <div className="rev-kpi-grid" style={{ marginBottom: '1.75rem' }}>
                            <KPICard title="Total Earnings"   value={totalEarnings}   color={C.orange} icon={<CircleDollarSign size={18} />} prefix="₦" sub={`Last ${period === 'all' ? 'all time' : period}`} />
                            <KPICard title="Deliveries"       value={totalDeliveries} color={C.green}  icon={<CheckCircle size={18} />}      sub="Completed" />
                            <KPICard title="Avg per Delivery" value={avgPerOrder}     color={C.navy}   icon={<TrendingUp size={18} />}       prefix="₦" sub="Per order" />
                            <KPICard title="All Time Orders"  value={orders.length}   color={C.amber}  icon={<Package size={18} />}          sub="Total assigned" />
                        </div>

                        {/* Chart */}
                        <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, ...shadow, padding: '1.25rem', marginBottom: '1.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <div>
                                    <p style={{ margin: 0, fontWeight: 700, color: C.navy, fontSize: '0.95rem' }}>Earnings Over Time</p>
                                    <p style={{ margin: 0, fontSize: '0.72rem', color: C.faint }}>Daily earnings from completed deliveries</p>
                                </div>
                            </div>
                            {chartData.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: C.faint }}>
                                    <TrendingUp size={32} color={C.border} style={{ marginBottom: '0.5rem' }} />
                                    <p style={{ margin: 0, fontSize: '0.85rem' }}>No earnings data for this period</p>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={240}>
                                    <BarChart data={chartData} barSize={28}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: C.faint }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 11, fill: C.faint }} axisLine={false} tickLine={false} tickFormatter={v => `₦${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: `${C.orange}10` }} />
                                        <Bar dataKey="amount" fill={C.orange} radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        {/* Completed Orders Table */}
                        <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, ...shadow, overflow: 'hidden' }}>
                            <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <p style={{ margin: 0, fontWeight: 700, color: C.navy, fontSize: '0.95rem' }}>Completed Deliveries</p>
                                <span style={{ background: `${C.green}15`, color: C.green, fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: 999 }}>{totalDeliveries} orders</span>
                            </div>

                            {completedInPeriod.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                                    <Package size={32} color={C.border} />
                                    <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: C.faint }}>No completed deliveries in this period</p>
                                </div>
                            ) : (
                                <>
                                    {/* Desktop Table */}
                                    <div style={{ overflowX: 'auto' }}>
                                        <table className="desk-header" style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
                                            <thead>
                                                <tr>
                                                    {['Tracking #', 'Pickup', 'Delivery', 'Date', 'Earnings'].map(h => (
                                                        <th key={h} style={{ padding: '0.75rem 1rem', fontSize: '0.68rem', fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.7px', background: '#f8fafc', borderBottom: `1px solid ${C.border}`, textAlign: h === 'Earnings' ? 'right' : 'left', whiteSpace: 'nowrap' }}>{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {completedInPeriod.map((o, i) => (
                                                    <tr key={o._id} className="order-row-desktop"
                                                        style={{ background: i % 2 === 0 ? C.white : '#fafbfc', transition: 'background 0.12s' }}
                                                        onMouseEnter={e => e.currentTarget.style.background = '#f0f4ff'}
                                                        onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? C.white : '#fafbfc'}>
                                                        <td style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${C.border}` }}>
                                                            <span style={{ background: '#f0f2f5', color: C.navy, padding: '3px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700 }}>#{o.trackingNumber}</span>
                                                        </td>
                                                        <td style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${C.border}`, fontSize: '0.82rem', color: C.navy, maxWidth: 160 }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                                                <MapPin size={11} color={C.orange} />
                                                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.pickupAddress?.city}</span>
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${C.border}`, fontSize: '0.82rem', color: C.navy, maxWidth: 160 }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                                                <Flag size={11} color={C.green} />
                                                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.deliveryAddress?.city}</span>
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${C.border}`, fontSize: '0.78rem', color: C.faint, whiteSpace: 'nowrap' }}>
                                                            {new Date(o.updatedAt || o.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </td>
                                                        <td style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${C.border}`, textAlign: 'right' }}>
                                                            <span style={{ fontWeight: 800, color: C.orange, fontSize: '0.9rem' }}>₦{o.price?.toLocaleString()}</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile Cards */}
                                    <div style={{ padding: '0.75rem' }}>
                                        {completedInPeriod.map(o => (
                                            <div key={o._id} className="order-row-card" style={{ background: '#f8fafc', borderRadius: 12, border: `1px solid ${C.border}`, padding: '0.85rem', marginBottom: '0.6rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                                                    <span style={{ background: '#f0f2f5', color: C.navy, padding: '3px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700 }}>#{o.trackingNumber}</span>
                                                    <span style={{ fontWeight: 800, color: C.orange, fontSize: '0.95rem' }}>₦{o.price?.toLocaleString()}</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: '0.3rem' }}>
                                                    <MapPin size={11} color={C.orange} />
                                                    <span style={{ fontSize: '0.78rem', color: C.muted }}>{o.pickupAddress?.city}</span>
                                                    <span style={{ color: C.faint }}>→</span>
                                                    <Flag size={11} color={C.green} />
                                                    <span style={{ fontSize: '0.78rem', color: C.muted }}>{o.deliveryAddress?.city}</span>
                                                </div>
                                                <p style={{ margin: 0, fontSize: '0.72rem', color: C.faint }}>
                                                    {new Date(o.updatedAt || o.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>
        </SidebarLayout>
    );
};

export default Revenue;