import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { getMyOrders } from '../services/api';
import SidebarLayout from '../components/SidebarLayout';
import {
    Package, Clock, Zap, CheckCircle,
    MapPin, Flag, User, Phone, ArrowRight,
    TrendingUp, AlertCircle
} from 'lucide-react';

const C = {
    navy: '#0d1f4f', navyL: '#162660', orange: '#e8610a',
    amber: '#d97706', green: '#16a34a', bg: '#f1f4f9',
    white: '#ffffff', border: '#e8edf7', muted: '#64748b', faint: '#94a3b8',
};
const shadow = { boxShadow: '0 1px 3px rgba(13,31,79,0.06), 0 4px 20px rgba(13,31,79,0.05)' };

const statusCfg = {
    'pending':    { bg: '#fef9ec', text: '#92400e', border: '#fde68a', dot: C.amber,   label: 'Pending'    },
    'assigned':   { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe', dot: '#2563eb', label: 'Assigned'   },
    'picked-up':  { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0', dot: C.green,   label: 'Picked Up'  },
    'in-transit': { bg: '#faf5ff', text: '#6d28d9', border: '#ddd6fe', dot: '#7c3aed', label: 'In Transit' },
    'delivered':  { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0', dot: C.green,   label: 'Delivered'  },
    'confirmed':  { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0', dot: C.green,   label: 'Confirmed'  },
    'cancelled':  { bg: '#fef2f2', text: '#991b1b', border: '#fecaca', dot: '#dc2626', label: 'Cancelled'  },
};

const Badge = ({ status }) => {
    const s = statusCfg[status] || { bg: '#f8fafc', text: C.muted, border: C.border, dot: C.faint, label: status };
    const pulse = ['assigned', 'in-transit', 'picked-up'].includes(status);
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: s.bg, color: s.text, border: `1px solid ${s.border}`, padding: '3px 10px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.3px', whiteSpace: 'nowrap' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, flexShrink: 0, animation: pulse ? 'pulse 2s infinite' : 'none' }} />
            {s.label}
        </span>
    );
};

const KPICard = ({ title, value, icon, color, sub }) => (
    <div className="kpi-card" style={{ background: C.white, borderRadius: 14, ...shadow, border: `1px solid ${C.border}`, cursor: 'default', transition: 'transform 0.18s, box-shadow 0.18s' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(13,31,79,0.12)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = shadow.boxShadow; }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>{icon}</div>
        </div>
        <p style={{ margin: 0, fontSize: '0.63rem', fontWeight: 600, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.6px', lineHeight: 1.3 }}>{title}</p>
        <h2 style={{ margin: '0.2rem 0 0', fontSize: '1.45rem', fontWeight: 800, color: C.navy, lineHeight: 1 }}>{value}</h2>
        {sub && <p style={{ margin: '0.2rem 0 0', fontSize: '0.63rem', color: C.faint }}>{sub}</p>}
    </div>
);

const OrderCard = ({ order }) => {
    const isActive = ['assigned', 'picked-up', 'in-transit'].includes(order.status);
    return (
        <div style={{ background: C.white, borderRadius: 16, ...shadow, border: `1px solid ${C.border}`, borderTop: `3px solid ${isActive ? C.orange : C.navy}`, overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform 0.18s, box-shadow 0.18s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(13,31,79,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = shadow.boxShadow; }}>

            <div style={{ padding: '0.85rem 1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ background: '#f0f2f5', color: C.navy, padding: '5px 12px', borderRadius: 999, fontSize: '0.78rem', fontWeight: 700 }}>
                    #{order.trackingNumber}
                </span>
                <Badge status={order.status} />
            </div>

            <div style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 4, flexShrink: 0 }}>
                    <div style={{ width: 9, height: 9, borderRadius: '50%', background: C.orange }} />
                    <div style={{ width: 2, height: 28, background: C.border }} />
                    <div style={{ width: 9, height: 9, borderRadius: '50%', background: C.green }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ marginBottom: '0.6rem' }}>
                        <p style={{ margin: 0, fontSize: '0.7rem', color: C.faint, display: 'flex', alignItems: 'center', gap: 3 }}><MapPin size={10} /> Pickup</p>
                        <p style={{ margin: 0, fontWeight: 600, color: C.navy, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {order.pickupAddress?.street}, {order.pickupAddress?.city}
                        </p>
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '0.7rem', color: C.faint, display: 'flex', alignItems: 'center', gap: 3 }}><Flag size={10} /> Delivery</p>
                        <p style={{ margin: 0, fontWeight: 600, color: C.navy, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {order.deliveryAddress?.street}, {order.deliveryAddress?.city}
                        </p>
                    </div>
                </div>
            </div>

            {order.customer && (
                <div style={{ margin: '0 1rem 0.85rem', padding: '0.6rem 0.75rem', background: '#f8fafc', borderRadius: 10, border: `1px solid ${C.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#e9ecef', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.navy, flexShrink: 0 }}>
                            <User size={13} />
                        </div>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.83rem', color: C.navy }}>{order.customer.fullName}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, paddingLeft: 34 }}>
                        <Phone size={10} color={C.faint} />
                        <span style={{ fontSize: '0.73rem', color: C.muted }}>{order.customer.phone}</span>
                    </div>
                </div>
            )}

            <div style={{ marginTop: 'auto', padding: '0.75rem 1rem', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafbfc' }}>
                <p style={{ margin: 0, fontWeight: 800, color: C.orange, fontSize: '1.05rem' }}>₦{order.price?.toLocaleString()}</p>
                <Link to={`/orders/${order._id}`}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: isActive ? C.orange : C.navy, color: '#fff', borderRadius: 8, padding: '6px 14px', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none' }}>
                    {isActive ? 'Update' : 'Details'} <ArrowRight size={13} />
                </Link>
            </div>
        </div>
    );
};

const Dashboard = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await getMyOrders(user._id);
                setOrders(res.data.data);
            } catch { setError('Failed to load orders'); }
            finally { setLoading(false); }
        };
        if (user?._id) fetchOrders();
    }, [user]);

    const stats = {
        total:     orders.length,
        pending:   orders.filter(o => o.status === 'assigned').length,
        active:    orders.filter(o => ['picked-up', 'in-transit'].includes(o.status)).length,
        delivered: orders.filter(o => ['delivered', 'confirmed'].includes(o.status)).length,
    };

    const earnings = orders
        .filter(o => ['delivered', 'confirmed'].includes(o.status))
        .reduce((sum, o) => sum + (o.price || 0), 0);

    const filtered =
        filter === 'active'    ? orders.filter(o => ['assigned', 'picked-up', 'in-transit'].includes(o.status)) :
        filter === 'delivered' ? orders.filter(o => ['delivered', 'confirmed'].includes(o.status)) :
        orders;

    const tabs = [
        { key: 'all',       label: 'All Orders' },
        { key: 'active',    label: 'Active' },
        { key: 'delivered', label: 'Delivered' },
    ];

    return (
        <SidebarLayout>
            <style>{`
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
                .kpi-card { padding: 1rem; }
                @media (min-width: 576px) { .kpi-card { padding: 1.1rem; } }
                @media (min-width: 992px) { .kpi-card { padding: 1.25rem; } }
                .kpi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; }
                @media (min-width: 768px) { .kpi-grid { grid-template-columns: repeat(4, 1fr); } }
                .orders-grid { display: grid; grid-template-columns: 1fr; gap: 1rem; }
                @media (min-width: 600px)  { .orders-grid { grid-template-columns: repeat(2, 1fr); } }
                @media (min-width: 1024px) { .orders-grid { grid-template-columns: repeat(3, 1fr); } }
                .dash-topbar { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1.75rem; }
                .filter-tabs { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.25rem; }
            `}</style>

            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.25rem 3rem' }}>
                {/* Topbar */}
                <div className="dash-topbar">
                    <div>
                        <h4 style={{ margin: 0, fontWeight: 800, color: C.navy, fontSize: '1.3rem' }}>My Deliveries</h4>
                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: C.muted }}>
                            Welcome back, <span style={{ fontWeight: 700, color: C.navy }}>{user?.fullName}</span>
                        </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: `${C.green}15`, border: `1px solid ${C.green}30`, borderRadius: 10, padding: '0.45rem 0.9rem' }}>
                        <TrendingUp size={15} color={C.green} />
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: C.green }}>₦{earnings.toLocaleString()} earned</span>
                    </div>
                </div>

                {/* KPIs */}
                <div className="kpi-grid" style={{ marginBottom: '1.75rem' }}>
                    <KPICard title="Total Assigned" value={stats.total}      color={C.navy}   icon={<Package size={18} />}     sub="All time" />
                    <KPICard title="Awaiting Pickup" value={stats.pending}   color={C.amber}  icon={<Clock size={18} />}       sub="Assigned orders" />
                    <KPICard title="In Progress"     value={stats.active}    color={C.orange} icon={<Zap size={18} />}         sub="En route now" />
                    <KPICard title="Delivered"       value={stats.delivered} color={C.green}  icon={<CheckCircle size={18} />} sub="Completed" />
                </div>

                {/* Tabs */}
                <div className="filter-tabs">
                    {tabs.map(t => (
                        <button key={t.key} onClick={() => setFilter(t.key)}
                            style={{ padding: '0.45rem 1.1rem', borderRadius: 8, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', background: filter === t.key ? C.navy : C.white, color: filter === t.key ? '#fff' : C.muted, border: filter === t.key ? 'none' : `1px solid ${C.border}`, boxShadow: filter === t.key ? '0 2px 8px rgba(13,31,79,0.15)' : 'none' }}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Orders */}
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
                        <div className="spinner-border" style={{ color: C.navy }} />
                    </div>
                ) : error ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '1rem 1.25rem', color: '#991b1b' }}>
                        <AlertCircle size={18} /> {error}
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 1rem', background: C.white, borderRadius: 16, ...shadow, border: `1px solid ${C.border}` }}>
                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f1f4f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                            <Package size={28} color={C.faint} />
                        </div>
                        <h5 style={{ fontWeight: 700, color: C.navy, marginBottom: '0.35rem' }}>No orders here</h5>
                        <p style={{ color: C.muted, fontSize: '0.88rem', margin: 0 }}>You have no {filter !== 'all' ? filter : ''} deliveries yet.</p>
                    </div>
                ) : (
                    <div className="orders-grid">
                        {filtered.map(order => <OrderCard key={order._id} order={order} />)}
                    </div>
                )}
            </div>
        </SidebarLayout>
    );
};

export default Dashboard;