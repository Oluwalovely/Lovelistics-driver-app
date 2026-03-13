import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../AuthContext';
import { getDriverProfile, updateDriverProfile, uploadDriverAvatar, changeDriverPassword } from '../services/api';
import {
    Car, Bike, Truck, CheckCircle, AlertCircle,
    Save, Shield, ChevronLeft, Camera, Eye, EyeOff,
    Lock, User
} from 'lucide-react';
import { Link } from 'react-router-dom';

const C = {
    navy: '#0d1f4f', navyL: '#162660', orange: '#e8610a',
    green: '#16a34a', amber: '#d97706', red: '#dc2626',
    bg: '#f1f4f9', white: '#ffffff', border: '#e8edf7',
    muted: '#64748b', faint: '#94a3b8',
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
            style={{ flex: 1, minWidth: 72, padding: '0.7rem 0.4rem', borderRadius: 12, border: `2px solid ${selected ? C.orange : C.border}`, background: selected ? `${C.orange}10` : C.white, color: selected ? C.orange : C.muted, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', transition: 'all 0.15s', fontWeight: selected ? 700 : 500, fontSize: '0.7rem', textTransform: 'capitalize' }}>
            {icons[type]}
            {type}
        </button>
    );
};

const Field = ({ label, name, value, onChange, placeholder, required, hint, type = 'text', rightEl }) => (
    <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: C.navy, marginBottom: '0.4rem', letterSpacing: '0.3px' }}>
            {label} {required && <span style={{ color: C.red }}>*</span>}
        </label>
        <div style={{ position: 'relative' }}>
            <input name={name} value={value} onChange={onChange} placeholder={placeholder} type={type}
                style={{ width: '100%', padding: rightEl ? '0.6rem 2.8rem 0.6rem 0.85rem' : '0.6rem 0.85rem', border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: '0.85rem', color: C.navy, outline: 'none', background: C.white, boxSizing: 'border-box', transition: 'border-color 0.15s' }}
                onFocus={e => e.target.style.borderColor = C.orange}
                onBlur={e => e.target.style.borderColor = C.border} />
            {rightEl && <div style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}>{rightEl}</div>}
        </div>
        {hint && <p style={{ margin: '0.3rem 0 0', fontSize: '0.7rem', color: C.faint }}>{hint}</p>}
    </div>
);

const SectionHeader = ({ icon, title, desc }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.1rem 1.25rem', borderBottom: `1px solid ${C.border}`, background: '#f8fafc' }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: `${C.navy}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.navy, flexShrink: 0 }}>
            {icon}
        </div>
        <div>
            <p style={{ margin: 0, fontWeight: 700, color: C.navy, fontSize: '0.9rem' }}>{title}</p>
            {desc && <p style={{ margin: 0, fontSize: '0.72rem', color: C.faint }}>{desc}</p>}
        </div>
    </div>
);

const Toast = ({ type, message }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: type === 'success' ? '#f0fdf4' : '#fef2f2', border: `1px solid ${type === 'success' ? '#bbf7d0' : '#fecaca'}`, borderRadius: 9, padding: '0.6rem 0.85rem', marginBottom: '0.85rem' }}>
        {type === 'success' ? <CheckCircle size={15} color={C.green} /> : <AlertCircle size={15} color={C.red} />}
        <p style={{ margin: 0, fontSize: '0.8rem', color: type === 'success' ? C.green : C.red, fontWeight: 600 }}>{message}</p>
    </div>
);

const Profile = () => {
    const { user, updateUser } = useAuth();
    const avatarInputRef = useRef(null);

    const [profile, setProfile] = useState({
        vehicleType: '', vehiclePlate: '', vehicleModel: '',
        vehicleColor: '', licenseNumber: '',
    });
    const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
    const [showPw, setShowPw] = useState({ current: false, newPass: false, confirm: false });

    const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
    const [avatarFile, setAvatarFile] = useState(null);

    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingAvatar, setSavingAvatar] = useState(false);
    const [savingPw, setSavingPw] = useState(false);
    const [isApproved, setIsApproved] = useState(false);

    const [profileMsg, setProfileMsg] = useState(null);   // { type, text }
    const [avatarMsg,  setAvatarMsg]  = useState(null);
    const [pwMsg,      setPwMsg]      = useState(null);

    useEffect(() => {
        getDriverProfile()
            .then(r => {
                const d = r.data.data;
                if (d) {
                    setProfile({
                        vehicleType:  d.vehicleType  || '',
                        vehiclePlate: d.vehiclePlate || '',
                        vehicleModel: d.vehicleModel || '',
                        vehicleColor: d.vehicleColor || '',
                        licenseNumber: d.licenseNumber || '',
                    });
                    setIsApproved(d.isApproved || false);

                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handleProfileChange = e => {
        setProfile(p => ({ ...p, [e.target.name]: e.target.value }));
        setProfileMsg(null);
    };

    const handleAvatarChange = e => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { setAvatarMsg({ type: 'error', text: 'Image must be under 5MB.' }); return; }
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
        setAvatarMsg(null);
    };

    const handleAvatarUpload = async () => {
        if (!avatarFile) return;
        setSavingAvatar(true);
        setAvatarMsg(null);
        try {
            const fd = new FormData();
            fd.append('avatar', avatarFile);
            const res = await uploadDriverAvatar(fd);
            if (res.data.data?.avatar) updateUser({ avatar: res.data.data.avatar });
            setAvatarFile(null);
            setAvatarMsg({ type: 'success', text: 'Profile photo updated!' });
        } catch {
            setAvatarMsg({ type: 'error', text: 'Failed to upload photo. Please try again.' });
        } finally {
            setSavingAvatar(false);
        }
    };

    const handleProfileSave = async () => {
        if (!profile.vehicleType)   return setProfileMsg({ type: 'error', text: 'Please select a vehicle type.' });
        if (!profile.vehiclePlate)  return setProfileMsg({ type: 'error', text: 'Vehicle plate number is required.' });
        if (!profile.licenseNumber) return setProfileMsg({ type: 'error', text: 'License number is required.' });
        setSavingProfile(true);
        setProfileMsg(null);
        try {
            await updateDriverProfile(profile);
            setProfileMsg({ type: 'success', text: 'Profile saved successfully!' });
            setTimeout(() => setProfileMsg(null), 4000);
        } catch {
            setProfileMsg({ type: 'error', text: 'Failed to save profile. Please try again.' });
        } finally {
            setSavingProfile(false);
        }
    };

    const handlePasswordChange = async () => {
        const { current, newPass, confirm } = passwords;
        if (!current || !newPass || !confirm) return setPwMsg({ type: 'error', text: 'All password fields are required.' });
        if (newPass.length < 6) return setPwMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
        if (newPass !== confirm) return setPwMsg({ type: 'error', text: 'New passwords do not match.' });
        setSavingPw(true);
        setPwMsg(null);
        try {
            await changeDriverPassword({ currentPassword: current, newPassword: newPass });
            setPasswords({ current: '', newPass: '', confirm: '' });
            setPwMsg({ type: 'success', text: 'Password changed successfully!' });
            setTimeout(() => setPwMsg(null), 4000);
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to change password.';
            setPwMsg({ type: 'error', text: msg });
        } finally {
            setSavingPw(false);
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
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
                .avatar-wrap:hover .avatar-overlay { opacity: 1 !important; }
            `}</style>

            <div style={{ maxWidth: 680, margin: '0 auto' }}>

                {/* Back + Title */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: C.faint, fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', marginBottom: '0.75rem' }}
                        onMouseEnter={e => e.currentTarget.style.color = C.navy}
                        onMouseLeave={e => e.currentTarget.style.color = C.faint}>
                        <ChevronLeft size={15} /> Back to Dashboard
                    </Link>
                    <h1 style={{ fontWeight: 800, color: C.navy, fontSize: '1.4rem', margin: 0 }}>Driver Profile</h1>
                    <p style={{ color: C.faint, margin: '0.2rem 0 0', fontSize: '0.82rem' }}>Complete your profile to get approved and start receiving orders</p>
                </div>

                {/* Approval Banner */}
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

                {/* ── PHOTO CARD ── */}
                <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, ...shadow, marginBottom: '1.25rem', overflow: 'hidden' }}>
                    <SectionHeader icon={<User size={16} />} title="Profile Photo" desc="Upload a clear photo of yourself" />
                    <div style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                        {/* Avatar */}
                        <div className="avatar-wrap" style={{ position: 'relative', flexShrink: 0, cursor: 'pointer' }} onClick={() => avatarInputRef.current?.click()}>
                            <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', border: `3px solid ${C.border}`, background: C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {avatarPreview
                                    ? <img src={avatarPreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    : <span style={{ fontWeight: 900, fontSize: '1.8rem', color: '#fff' }}>{user?.fullName?.charAt(0).toUpperCase()}</span>
                                }
                            </div>
                            <div className="avatar-overlay" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}>
                                <Camera size={20} color="#fff" />
                            </div>
                        </div>

                        {/* Info + actions */}
                        <div style={{ flex: 1, minWidth: 180 }}>
                            <p style={{ margin: '0 0 0.3rem', fontWeight: 700, color: C.navy, fontSize: '0.95rem' }}>{user?.fullName}</p>
                            <p style={{ margin: '0 0 0.85rem', fontSize: '0.78rem', color: C.faint }}>{user?.email}</p>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <button onClick={() => avatarInputRef.current?.click()}
                                    style={{ padding: '0.45rem 1rem', borderRadius: 8, border: `1.5px solid ${C.border}`, background: C.white, color: C.navy, fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <Camera size={13} /> Choose Photo
                                </button>
                                {avatarFile && (
                                    <button onClick={handleAvatarUpload} disabled={savingAvatar}
                                        style={{ padding: '0.45rem 1rem', borderRadius: 8, border: 'none', background: savingAvatar ? C.faint : C.orange, color: '#fff', fontWeight: 700, fontSize: '0.78rem', cursor: savingAvatar ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                                        <Save size={13} /> {savingAvatar ? 'Uploading...' : 'Save Photo'}
                                    </button>
                                )}
                            </div>
                            <p style={{ margin: '0.4rem 0 0', fontSize: '0.68rem', color: C.faint }}>JPG, PNG or WEBP · Max 5MB</p>
                        </div>
                    </div>
                    {avatarMsg && <div style={{ padding: '0 1.25rem 1rem' }}><Toast type={avatarMsg.type} message={avatarMsg.text} /></div>}
                    <input ref={avatarInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
                </div>

                {/* Profile Completeness */}
                <div style={{ background: C.white, borderRadius: 14, padding: '1.1rem 1.25rem', border: `1px solid ${C.border}`, ...shadow, marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                        <p style={{ margin: 0, fontWeight: 700, color: C.navy, fontSize: '0.85rem' }}>Profile Completeness</p>
                        <span style={{ fontWeight: 800, color: pct === 100 ? C.green : C.orange, fontSize: '0.9rem' }}>{pct}%</span>
                    </div>
                    <div style={{ background: '#f1f5f9', borderRadius: 999, height: 8, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? `linear-gradient(90deg, #0d9488, ${C.green})` : `linear-gradient(90deg, ${C.navy}, ${C.orange})`, borderRadius: 999, transition: 'width 0.4s ease' }} />
                    </div>
                    {pct < 100 && <p style={{ margin: '0.4rem 0 0', fontSize: '0.72rem', color: C.faint }}>Fill in all fields to complete your profile</p>}
                </div>

                {/* ── VEHICLE INFO CARD ── */}
                <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, ...shadow, marginBottom: '1.25rem', overflow: 'hidden' }}>
                    <SectionHeader icon={<Car size={16} />} title="Vehicle Information" desc="Details about your delivery vehicle" />
                    <div style={{ padding: '1.25rem 1.25rem 0' }}>
                        <p style={{ margin: '0 0 0.75rem', fontSize: '0.78rem', fontWeight: 700, color: C.navy, letterSpacing: '0.3px' }}>
                            Vehicle Type <span style={{ color: C.red }}>*</span>
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.1rem' }}>
                            {VEHICLE_TYPES.map(t => (
                                <VehicleOption key={t} type={t} selected={profile.vehicleType === t}
                                    onClick={v => { setProfile(p => ({ ...p, vehicleType: v })); setProfileMsg(null); }} />
                            ))}
                        </div>
                    </div>
                    <div style={{ padding: '0 1.25rem 0' }}>
                        <Field label="Vehicle Plate Number" name="vehiclePlate" value={profile.vehiclePlate}
                            onChange={handleProfileChange} placeholder="e.g. ABC-123-XY" required hint="Enter your vehicle's registration plate number" />
                        <Field label="Vehicle Model" name="vehicleModel" value={profile.vehicleModel}
                            onChange={handleProfileChange} placeholder="e.g. Toyota Camry 2020" />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <Field label="Vehicle Color" name="vehicleColor" value={profile.vehicleColor}
                                onChange={handleProfileChange} placeholder="e.g. Black" />
                            <Field label="License Number" name="licenseNumber" value={profile.licenseNumber}
                                onChange={handleProfileChange} placeholder="e.g. DL-1234567" required />
                        </div>
                    </div>
                    <div style={{ padding: '1rem 1.25rem', borderTop: `1px solid ${C.border}`, background: '#f8fafc', marginTop: '0.5rem' }}>
                        {profileMsg && <Toast type={profileMsg.type} message={profileMsg.text} />}
                        <button onClick={handleProfileSave} disabled={savingProfile}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 11, border: 'none', background: savingProfile ? C.faint : C.navy, color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: savingProfile ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'background 0.15s' }}
                            onMouseEnter={e => { if (!savingProfile) e.currentTarget.style.background = C.navyL; }}
                            onMouseLeave={e => { if (!savingProfile) e.currentTarget.style.background = C.navy; }}>
                            <Save size={16} />
                            {savingProfile ? 'Saving...' : 'Save Profile'}
                        </button>
                    </div>
                </div>

                {/* ── CHANGE PASSWORD CARD ── */}
                <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, ...shadow, overflow: 'hidden' }}>
                    <SectionHeader icon={<Lock size={16} />} title="Change Password" desc="Use a strong password you don't use elsewhere" />
                    <div style={{ padding: '1.25rem 1.25rem 0' }}>
                        {['current', 'newPass', 'confirm'].map((key) => {
                            const labels = { current: 'Current Password', newPass: 'New Password', confirm: 'Confirm New Password' };
                            const placeholders = { current: 'Enter current password', newPass: 'Min. 6 characters', confirm: 'Repeat new password' };
                            return (
                                <Field key={key}
                                    label={labels[key]}
                                    name={key}
                                    value={passwords[key]}
                                    onChange={e => { setPasswords(p => ({ ...p, [key]: e.target.value })); setPwMsg(null); }}
                                    placeholder={placeholders[key]}
                                    required
                                    type={showPw[key] ? 'text' : 'password'}
                                    rightEl={
                                        <button type="button" onClick={() => setShowPw(s => ({ ...s, [key]: !s[key] }))}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: C.faint, display: 'flex', alignItems: 'center' }}>
                                            {showPw[key] ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    }
                                />
                            );
                        })}
                    </div>
                    <div style={{ padding: '1rem 1.25rem', borderTop: `1px solid ${C.border}`, background: '#f8fafc', marginTop: '0.5rem' }}>
                        {pwMsg && <Toast type={pwMsg.type} message={pwMsg.text} />}
                        <button onClick={handlePasswordChange} disabled={savingPw}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 11, border: 'none', background: savingPw ? C.faint : C.orange, color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: savingPw ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'background 0.15s' }}
                            onMouseEnter={e => { if (!savingPw) e.currentTarget.style.background = '#c95508'; }}
                            onMouseLeave={e => { if (!savingPw) e.currentTarget.style.background = C.orange; }}>
                            <Lock size={16} />
                            {savingPw ? 'Updating...' : 'Update Password'}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Profile;