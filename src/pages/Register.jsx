import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerDriver } from '../services/api';
import { Eye, EyeOff, Car, CheckCircle } from 'lucide-react';
import logo from '../assets/logo.png';

const Register = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: '', email: '', phone: '', password: '', inviteCode: '',
    });
    const [error, setError]     = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast]     = useState(false);
    const [showPw, setShowPw]   = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await registerDriver(formData);
            setToast(true);
            setTimeout(() => navigate('/login'), 2500);
        } catch (err) {
            setError(err.response?.data?.message || 'Error creating account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">

            {/* Toast */}
            {toast && (
                <div className="auth-toast">
                    <CheckCircle size={17} style={{ flexShrink: 0 }} />
                    Driver account created! Redirecting to login...
                </div>
            )}

            <div className="auth-card">

                {/* Brand */}
                <div className="auth-brand">
                    <img src={logo} alt="LOVELISTICS" className="auth-logo" />
                    <span className="auth-brand-name">LOVELISTICS</span>
                    <p className="auth-tagline">Delivering Trust, On Time. Every Time.</p>
                </div>

                <div className="auth-divider" />

                {/* Badge */}
                <div className="auth-badge-row">
                    <span className="auth-role-badge">
                        <Car size={12} style={{ flexShrink: 0 }} />
                        Driver Registration
                    </span>
                </div>

                {/* Title */}
                <h2 className="auth-title">Create your driver account</h2>

                {/* Error */}
                {error && (
                    <div className="auth-error">
                        <span className="auth-error-dot" />
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} noValidate>
                    <div className="auth-field">
                        <label htmlFor="fullName">Full Name</label>
                        <input
                            id="fullName"
                            type="text"
                            name="fullName"
                            placeholder="John Doe"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                            autoComplete="name"
                        />
                    </div>

                    <div className="auth-field">
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="auth-field">
                        <label htmlFor="phone">Phone Number</label>
                        <input
                            id="phone"
                            type="text"
                            name="phone"
                            placeholder="08012345678"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            autoComplete="tel"
                        />
                    </div>

                    <div className="auth-field">
                        <label htmlFor="password">Password</label>
                        <div className="auth-pw-wrap">
                            <input
                                id="password"
                                type={showPw ? 'text' : 'password'}
                                name="password"
                                placeholder="Min 6 characters"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                autoComplete="new-password"
                            />
                            <button type="button" className="auth-pw-toggle" onClick={() => setShowPw(p => !p)} tabIndex={-1}>
                                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <div className="auth-field">
                        <label htmlFor="inviteCode">Invite Code</label>
                        <input
                            id="inviteCode"
                            type="text"
                            name="inviteCode"
                            placeholder="Enter your invite code"
                            value={formData.inviteCode}
                            onChange={handleChange}
                            required
                        />
                        <span className="auth-hint">Contact your admin to get an invite code</span>
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading || toast}>
                        {loading ? <><span className="auth-spinner" /> Creating account...</> : 'Create Driver Account'}
                    </button>
                </form>

                <p className="auth-switch">
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>

            {/* Copyright */}
            <p className="auth-copyright">© {new Date().getFullYear()} LOVELISTICS. All rights reserved.</p>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
                *, *::before, *::after { box-sizing: border-box; }

                .auth-page {
                    min-height: 100vh;
                    background: #eef0f5;
                    background-image:
                        radial-gradient(ellipse at 65% 0%, rgba(13,31,79,0.07) 0%, transparent 65%),
                        radial-gradient(ellipse at 0% 100%, rgba(232,97,10,0.05) 0%, transparent 60%);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem 1.25rem 1.5rem;
                    font-family: 'Inter', system-ui, sans-serif;
                }

                .auth-card {
                    background: #ffffff;
                    border-radius: 20px;
                    padding: 3rem 2.75rem;
                    width: 100%;
                    max-width: 440px;
                    box-shadow:
                        0 0 0 1px rgba(13,31,79,0.055),
                        0 4px 8px rgba(13,31,79,0.04),
                        0 20px 56px rgba(13,31,79,0.10);
                }

                .auth-copyright {
                    margin: 1.25rem 0 0;
                    font-size: 0.72rem;
                    color: #b0bcd4;
                    text-align: center;
                    letter-spacing: 0.2px;
                }

                .auth-brand { text-align: center; margin-bottom: 1.75rem; }
                .auth-logo {
                    width: 90px; height: 90px; object-fit: contain;
                    display: block; margin: 0 auto 1rem;
                    border-radius: 14px;
                    box-shadow: 0 2px 12px rgba(13,31,79,0.12);
                }
                .auth-brand-name {
                    display: block;
                    font-weight: 900; font-size: 1.2rem;
                    color: #0d1f4f; letter-spacing: 3px; line-height: 1;
                    margin-bottom: 0.55rem;
                }
                .auth-tagline {
                    font-size: 0.78rem; font-weight: 400;
                    color: #94a3b8; margin: 0; letter-spacing: 0.2px;
                }

                .auth-divider {
                    height: 1px;
                    background: linear-gradient(90deg, transparent, #e2e8f0 25%, #e2e8f0 75%, transparent);
                    margin-bottom: 1.6rem;
                }

                .auth-badge-row { text-align: center; margin-bottom: 1.5rem; }
                .auth-role-badge {
                    display: inline-flex; align-items: center; gap: 0.4rem;
                    background: rgba(232,97,10,0.08);
                    color: #e8610a;
                    font-size: 0.7rem; font-weight: 700;
                    padding: 0.3rem 1.1rem;
                    border-radius: 999px;
                    letter-spacing: 0.8px; text-transform: uppercase;
                    border: 1px solid rgba(232,97,10,0.18);
                }

                .auth-title {
                    font-size: 1rem; font-weight: 700;
                    color: #0d1f4f; margin: 0 0 1.75rem;
                    line-height: 1.4; letter-spacing: -0.15px;
                }

                .auth-error {
                    display: flex; align-items: center; gap: 0.5rem;
                    background: #fff5f5; border: 1px solid #fed7d7;
                    color: #c53030; padding: 0.7rem 1rem;
                    border-radius: 10px; font-size: 0.82rem; font-weight: 500;
                    margin-bottom: 1.25rem;
                }
                .auth-error-dot {
                    width: 7px; height: 7px; border-radius: 50%;
                    background: #fc8181; flex-shrink: 0;
                }

                .auth-field { margin-bottom: 1.1rem; }
                .auth-field label {
                    display: block; font-size: 0.79rem; font-weight: 600;
                    color: #374151; margin-bottom: 0.45rem; letter-spacing: 0.1px;
                }
                .auth-field input {
                    width: 100%; padding: 0.72rem 1rem;
                    border: 1.5px solid #e2e8f0; border-radius: 10px;
                    font-size: 0.9rem; font-family: 'Inter', system-ui, sans-serif;
                    color: #0d1f4f; background: #f8fafc; outline: none;
                    transition: border-color 0.18s, background 0.18s, box-shadow 0.18s;
                }
                .auth-field input:focus {
                    border-color: #0d1f4f; background: #fff;
                    box-shadow: 0 0 0 3px rgba(13,31,79,0.07);
                }
                .auth-field input::placeholder { color: #b0bcd4; }

                .auth-hint {
                    display: block; font-size: 0.73rem;
                    color: #94a3b8; margin-top: 0.35rem;
                }

                .auth-pw-wrap { position: relative; }
                .auth-pw-wrap input { padding-right: 2.75rem; }
                .auth-pw-toggle {
                    position: absolute; right: 0.85rem; top: 50%;
                    transform: translateY(-50%);
                    background: none; border: none; cursor: pointer;
                    color: #94a3b8; display: flex; align-items: center;
                    padding: 0; transition: color 0.15s;
                }
                .auth-pw-toggle:hover { color: #0d1f4f; }

                .auth-btn {
                    width: 100%; background: #0d1f4f; color: #fff;
                    border: none; border-radius: 11px; padding: 0.82rem;
                    font-size: 0.93rem; font-weight: 700;
                    font-family: 'Inter', system-ui, sans-serif;
                    cursor: pointer; display: flex; align-items: center;
                    justify-content: center; gap: 0.5rem; letter-spacing: 0.2px;
                    margin-top: 0.5rem;
                    transition: background 0.18s, transform 0.15s, box-shadow 0.18s;
                    box-shadow: 0 2px 8px rgba(13,31,79,0.18);
                }
                .auth-btn:hover:not(:disabled) {
                    background: #162660;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 20px rgba(13,31,79,0.24);
                }
                .auth-btn:active:not(:disabled) { transform: translateY(0); }
                .auth-btn:disabled { opacity: 0.65; cursor: not-allowed; }

                .auth-spinner {
                    width: 15px; height: 15px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-top-color: #fff; border-radius: 50%;
                    animation: authSpin 0.65s linear infinite; flex-shrink: 0;
                }
                @keyframes authSpin { to { transform: rotate(360deg); } }

                .auth-switch {
                    text-align: center; font-size: 0.82rem;
                    color: #94a3b8; margin: 1.5rem 0 0;
                }
                .auth-switch a {
                    color: #e8610a; font-weight: 600;
                    text-decoration: none; transition: opacity 0.15s;
                }
                .auth-switch a:hover { opacity: 0.7; }

                .auth-toast {
                    position: fixed; top: 1.5rem; left: 50%;
                    transform: translateX(-50%);
                    background: #0d1f4f; color: #fff;
                    padding: 0.85rem 1.5rem; border-radius: 12px;
                    font-size: 0.88rem; font-weight: 600;
                    display: flex; align-items: center; gap: 0.6rem;
                    box-shadow: 0 8px 24px rgba(13,31,79,0.25);
                    z-index: 9999; white-space: nowrap;
                    animation: toastIn 0.3s ease;
                }
                @keyframes toastIn {
                    from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
                    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
                }

                @media (max-width: 480px) {
                    .auth-card { padding: 2.25rem 1.5rem; border-radius: 16px; }
                    .auth-brand-name { font-size: 1.05rem; }
                }
            `}</style>
        </div>
    );
};

export default Register;