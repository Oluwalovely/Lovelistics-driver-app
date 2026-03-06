import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { getDriverProfile, updateDriverProfile } from '../services/api';
import {
    Car, Bike, Truck, FileText, CheckCircle,
    AlertCircle, ChevronDown, Save, User, Shield, ChevronLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';

const C = {
    navy: '#0d1f4f',
    navyL: '#162660',
    orange: '#e8610a',
    green: '#16a34a',
    amber: '#d97706',
    red: '#dc2626',
    bg: '#f1f4f9',
    white: '#ffffff',
    border: '#e8edf7',
    muted: '#64748b',
    faint: '#94a3b8',
};

const shadow = { boxShadow: '0 1px 3px rgba(13,31,79,0.06), 0 4px 20px rgba(13,31,79,0.05)' };

const VEHICLE_TYPES = ['bike', 'motorcycle', 'car', 'van', 'truck'];

const VehicleOption = ({ type, selected, onClick }) => {
    const icons = {
        bike: <Bike size={22} />, motorcycle: <Bike size={22} />,
        car: <Car size={22} />, van: <Truck size={22} />, truck: <Truck size={22} />
    };
    return (
        <button onClick={() => onClick(type)} type="button"
            style={{ flex: 1, minWidth: 80, padding: '0.75rem 0.5rem', borderRadius: 12, border: `2px solid ${selected ? C.orange : C.border}`, background: selected ? `${C.orange}10` : C.white, color: selected ? C.orange : C.muted, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', transition: 'all 0.15s', fontWeight: selected ? 700 : 500, fontSize: '0.72rem', textTransform: 'capitalize' }}
            onMouseEnter={e => { if (!selected) { e.currentTarget.style.borderColor = C.faint; } }}
            onMouseLeave={e => { if (!selected) { e.currentTarget.style.borderColor = C.border; } }}>
            {icons[type]}
            {type}
        </button>
    );
};

const Field = ({ label, name, value, onChange, placeholder, required, hint }) => (
    <div style={{ marginBottom: '1.1rem' }}>
        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: C.navy, marginBottom: '0.4rem', letterSpacing: '0.3px' }}>
            {label} {required && <span style={{ color: C.red }}>*</span>}
        </label>
        <input name={name} value={value} onChange={onChange} placeholder={placeholder}
            style={{ width: '100%', padding: '0.6rem 0.85rem', border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: '0.85rem', color: C.navy, outline: 'none', background: C.white, boxSizing: 'border-box', transition: 'border-color 0.15s' }}
            onFocus={e => e.target.style.borderColor = C.orange}
            onBlur={e => e.target.style.borderColor = C.border} />
        {hint && <p style={{ margin: '0.3rem 0 0', fontSize: '0.7rem', color: C.faint }}>{hint}</p>}
    </div>
);

const Profile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState({
        vehicleType: '', vehiclePlate: '', vehicleModel: '',
        vehicleColor: '', licenseNumber: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [isApproved, setIsApproved] = useState(false);

    useEffect(() => {
        getDriverProfile()
            .then(r => {
                const d = r.data.data;
                if (d) {
                    setProfile({
                        vehicleType: d.vehicleType || '',
                        vehiclePlate: d.vehiclePlate || '',
                        vehicleModel: d.vehicleModel || '',
                        vehicleColor: d.vehicleColor || '',
                        licenseNumber: d.licenseNumber || '',
                    });
                    setIsApproved(d.isApproved || false);
                }
            })
            .catch(() => setError('Failed to load profile'))
            .finally(() => setLoading(false));
    }, []);

    const handleChange = e => {
        setProfile(p => ({ ...p, [e.target.name]: e.target.value }));
        setSuccess(false);
    };

    const handleSubmit = async () => {
        if (!profile.vehicleType) return setError('Please select a vehicle type.');
        if (!profile.vehiclePlate) return setError('Vehicle plate number is required.');
        if (!profile.licenseNumber) return setError('License number is required.');
        setError('');
        setSaving(true);
        try {
            await updateDriverProfile(profile);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 4000);
        } catch {
            setError('Failed to save profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const completeness = () => {
        const fields = [profile.vehicleType, profile.vehiclePlate, profile.vehicleModel, profile.vehicleColor, profile.licenseNumber];
        return Math.round((fields.filter(Boolean).length / fields.length) * 100);
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="spinner-border" style={{ color: C.navy }} />
        </div>
    );

    const pct = completeness();

    return (
        <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Inter', system-ui, sans-serif", padding: '1.5rem 1rem 3rem' }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');`}</style>

            <div style={{ maxWidth: 680, margin: '0 auto' }}>

                {/* Header */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: C.faint, fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', marginBottom: '0.75rem' }}
                        onMouseEnter={e => e.currentTarget.style.color = C.navy}
                        onMouseLeave={e => e.currentTarget.style.color = C.faint}>
                        <ChevronLeft size={15} /> Back to Dashboard
                    </Link>
                    <h1 style={{ fontWeight: 800, color: C.navy, fontSize: '1.4rem', margin: 0 }}>Driver Profile</h1>
                    <p style={{ color: C.faint, margin: '0.2rem 0 0', fontSize: '0.82rem' }}>Complete your profile to get approved and start receiving orders</p>
                </div>

                {/* Approval Status Banner */}
                <div style={{ background: isApproved ? '#f0fdf4' : '#fffbeb', border: `1px solid ${isApproved ? '#bbf7d0' : '#fde68a'}`, borderRadius: 14, padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: isApproved ? '#dcfce7' : '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {isApproved ? <Shield size={20} color={C.green} /> : <AlertCircle size={20} color={C.amber} />}
                    </div>
                    <div>
                        <p style={{ margin: 0, fontWeight: 700, color: isApproved ? C.green : C.amber, fontSize: '0.88rem' }}>
                            {isApproved ? 'Account Approved' : 'Pending Approval'}
                        </p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: C.muted }}>
                            {isApproved
                                ? 'Your account is approved. You can receive and complete orders.'
                                : 'Complete your profile below and wait for admin approval before you can receive orders.'}
                        </p>
                    </div>
                </div>

                {/* Profile Completeness */}
                <div style={{ background: C.white, borderRadius: 14, padding: '1.1rem 1.25rem', border: `1px solid ${C.border}`, ...shadow, marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                        <p style={{ margin: 0, fontWeight: 700, color: C.navy, fontSize: '0.85rem' }}>Profile Completeness</p>
                        <span style={{ fontWeight: 800, color: pct === 100 ? C.green : C.orange, fontSize: '0.9rem' }}>{pct}%</span>
                    </div>
                    <div style={{ background: '#f1f5f9', borderRadius: 999, height: 8, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? `linear-gradient(90deg, ${C.teal}, ${C.green})` : `linear-gradient(90deg, ${C.navy}, ${C.orange})`, borderRadius: 999, transition: 'width 0.4s ease' }} />
                    </div>
                    {pct < 100 && <p style={{ margin: '0.4rem 0 0', fontSize: '0.72rem', color: C.faint }}>Fill in all fields to complete your profile</p>}
                </div>

                {/* Driver Info Card */}
                <div style={{ background: C.white, borderRadius: 14, padding: '1.25rem', border: `1px solid ${C.border}`, ...shadow, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.3rem', color: '#fff', flexShrink: 0 }}>
                        {user?.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p style={{ margin: 0, fontWeight: 800, color: C.navy, fontSize: '1rem' }}>{user?.fullName}</p>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: C.faint }}>{user?.email}</p>
                    </div>
                </div>

                {/* Form */}
                <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, ...shadow, overflow: 'hidden' }}>

                    {/* Vehicle Type */}
                    <div style={{ padding: '1.25rem 1.25rem 0' }}>
                        <p style={{ margin: '0 0 0.75rem', fontSize: '0.78rem', fontWeight: 700, color: C.navy, letterSpacing: '0.3px' }}>
                            Vehicle Type <span style={{ color: C.red }}>*</span>
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.1rem' }}>
                            {VEHICLE_TYPES.map(t => (
                                <VehicleOption key={t} type={t} selected={profile.vehicleType === t}
                                    onClick={v => { setProfile(p => ({ ...p, vehicleType: v })); setSuccess(false); }} />
                            ))}
                        </div>
                    </div>

                    <div style={{ padding: '0 1.25rem 1.25rem' }}>
                        <Field label="Vehicle Plate Number" name="vehiclePlate" value={profile.vehiclePlate}
                            onChange={handleChange} placeholder="e.g. ABC-123-XY" required hint="Enter your vehicle's registration plate number" />
                        <Field label="Vehicle Model" name="vehicleModel" value={profile.vehicleModel}
                            onChange={handleChange} placeholder="e.g. Toyota Camry 2020" />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <Field label="Vehicle Color" name="vehicleColor" value={profile.vehicleColor}
                                onChange={handleChange} placeholder="e.g. Black" />
                            <Field label="License Number" name="licenseNumber" value={profile.licenseNumber}
                                onChange={handleChange} placeholder="e.g. DL-1234567" required />
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{ padding: '1rem 1.25rem', borderTop: `1px solid ${C.border}`, background: '#f8fafc' }}>
                        {error && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 9, padding: '0.6rem 0.85rem', marginBottom: '0.85rem' }}>
                                <AlertCircle size={15} color={C.red} />
                                <p style={{ margin: 0, fontSize: '0.8rem', color: C.red, fontWeight: 500 }}>{error}</p>
                            </div>
                        )}
                        {success && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 9, padding: '0.6rem 0.85rem', marginBottom: '0.85rem' }}>
                                <CheckCircle size={15} color={C.green} />
                                <p style={{ margin: 0, fontSize: '0.8rem', color: C.green, fontWeight: 600 }}>Profile saved successfully!</p>
                            </div>
                        )}
                        <button onClick={handleSubmit} disabled={saving}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 11, border: 'none', background: saving ? C.faint : C.navy, color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'background 0.15s' }}
                            onMouseEnter={e => { if (!saving) e.currentTarget.style.background = C.navyL; }}
                            onMouseLeave={e => { if (!saving) e.currentTarget.style.background = C.navy; }}>
                            <Save size={16} />
                            {saving ? 'Saving...' : 'Save Profile'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;