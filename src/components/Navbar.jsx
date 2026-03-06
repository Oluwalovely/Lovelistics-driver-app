import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useState, useEffect, useRef } from 'react';
import { getMyNotifications } from '../services/api';
import { Package, Bell, LogOut, Menu, X, User, ChevronDown } from 'lucide-react';
import logo from '../assets/logo.png';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [unreadCount, setUnreadCount] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const fetchUnread = async () => {
            try {
                const res = await getMyNotifications();
                setUnreadCount(res.data.unreadCount);
            } catch (err) { console.log(err); }
        };
        if (user) fetchUnread();
    }, [user, location]);

    useEffect(() => { setMenuOpen(false); setDropdownOpen(false); }, [location]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handler = e => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleLogout = () => { logout(); navigate('/login'); };
    const isActive = (path) => location.pathname === path;

    return (
        <>
            <nav className="app-nav">
                <div className="app-nav-inner">

                    <Link to="/dashboard" className="app-brand">
                        <img src={logo} alt="LOVELISTICS" className="app-logo" />
                        <div>
                            <span className="app-brand-name">LOVELISTICS</span>
                            <span className="app-driver-badge">DRIVER</span>
                        </div>
                    </Link>

                    <div className="app-nav-links">
                        <Link to="/dashboard" className={`app-nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
                            <Package size={16} /> My Orders
                        </Link>
                        <Link to="/notifications" className={`app-nav-link ${isActive('/notifications') ? 'active' : ''}`}>
                            <Bell size={16} /> Notifications
                            {unreadCount > 0 && <span className="app-nav-badge">{unreadCount}</span>}
                        </Link>
                    </div>

                    <div className="app-nav-right">
                        <Link to="/notifications" className="app-bell">
                            <Bell size={20} />
                            {unreadCount > 0 && <span className="app-bell-badge">{unreadCount}</span>}
                        </Link>

                        {/* Avatar Dropdown */}
                        <div className="app-avatar-wrap" ref={dropdownRef}>
                            <button className="app-avatar-btn" onClick={() => setDropdownOpen(o => !o)}>
                                <div className="app-avatar-circle">
                                    {user?.fullName?.charAt(0).toUpperCase()}
                                </div>
                                <span className="app-avatar-name">{user?.fullName?.split(' ')[0]}</span>
                                <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', color: 'rgba(255,255,255,0.5)' }} />
                            </button>

                            {dropdownOpen && (
                                <div className="app-dropdown">
                                    <div className="app-dropdown-header">
                                        <p className="app-dropdown-name">{user?.fullName}</p>
                                        <p className="app-dropdown-email">{user?.email}</p>
                                    </div>
                                    <div className="app-dropdown-divider" />
                                    <Link to="/profile" className="app-dropdown-item">
                                        <User size={15} /> My Profile
                                    </Link>
                                    <div className="app-dropdown-divider" />
                                    <button className="app-dropdown-item app-dropdown-logout"
                                        onClick={() => { setDropdownOpen(false); setShowLogoutModal(true); }}>
                                        <LogOut size={15} /> Log Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <button className="app-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
                        {menuOpen ? <X size={22} color="#fff" /> : <Menu size={22} color="#fff" />}
                    </button>
                </div>

                {menuOpen && (
                    <div className="app-mobile-menu">
                        <Link to="/dashboard" className={`app-mobile-link ${isActive('/dashboard') ? 'active' : ''}`}>
                            <Package size={16} /> My Orders
                        </Link>
                        <Link to="/notifications" className={`app-mobile-link ${isActive('/notifications') ? 'active' : ''}`}>
                            <Bell size={16} /> Notifications
                            {unreadCount > 0 && <span className="app-mobile-badge">{unreadCount}</span>}
                        </Link>
                        <Link to="/profile" className={`app-mobile-link ${isActive('/profile') ? 'active' : ''}`}>
                            <User size={16} /> My Profile
                        </Link>
                        <div className="app-mobile-divider" />
                        <div className="app-mobile-user">Hi, {user?.fullName?.split(' ')[0]}</div>
                        <button className="app-mobile-logout" onClick={() => { setMenuOpen(false); setShowLogoutModal(true); }}>
                            <LogOut size={15} /> Logout
                        </button>
                    </div>
                )}
            </nav>

            {/* Logout Modal */}
            {showLogoutModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div style={{ background: '#fff', borderRadius: 16, padding: '2rem', maxWidth: 360, width: '100%', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
                        <div style={{ width: 60, height: 60, background: 'rgba(13,31,79,0.08)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                            <LogOut size={28} color="#0d1f4f" />
                        </div>
                        <h5 style={{ fontWeight: 700, color: '#0d1f4f', marginBottom: '0.5rem' }}>Log Out?</h5>
                        <p style={{ color: '#6b7a99', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                            Are you sure you want to log out of your account?
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                            <button onClick={() => setShowLogoutModal(false)}
                                onMouseEnter={e => { e.currentTarget.style.background = '#f4f6fb'; e.currentTarget.style.borderColor = '#0d1f4f'; e.currentTarget.style.color = '#0d1f4f'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#dde2ef'; e.currentTarget.style.color = '#6b7a99'; }}
                                style={{ padding: '0.6rem 1.5rem', borderRadius: 10, border: '1px solid #dde2ef', background: '#fff', color: '#6b7a99', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s' }}>
                                Stay
                            </button>
                            <button onClick={handleLogout}
                                onMouseEnter={e => { e.currentTarget.style.background = '#162660'; e.currentTarget.style.transform = 'scale(1.03)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = '#0d1f4f'; e.currentTarget.style.transform = 'scale(1)'; }}
                                style={{ padding: '0.6rem 1.5rem', borderRadius: 10, border: 'none', background: '#0d1f4f', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s' }}>
                                Yes, Log Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;