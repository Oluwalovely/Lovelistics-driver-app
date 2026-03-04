import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerDriver } from '../services/api';
import logo from '../assets/logo.png';

const Register = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: '', email: '', phone: '', password: '', inviteCode: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(false);

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
            setTimeout(() => {
                navigate('/login');
            }, 2500);
        } catch (err) {
            setError(err.response?.data?.message || 'Error creating account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">

            {toast && (
                <div className="auth-toast">
                    <span>✅</span>
                    <span>Driver account created! Redirecting to login...</span>
                </div>
            )}

            <div className="auth-card">
                <div className="auth-brand">
                    <img src={logo} alt="LOVELISTICS" className="auth-logo" />
                    <span className="auth-brand-name">LOVELISTICS</span>
                    <p className="auth-tagline">Delivering Trust, On Time. Every Ting.</p>
                </div>

                <div className="auth-divider" />
                <div className="auth-role-badge">🚗 Driver Registration</div>
                <h6 className="auth-title">Create your driver account</h6>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="auth-field">
                        <label>Full Name</label>
                        <input type="text" name="fullName" placeholder="John Doe" value={formData.fullName} onChange={handleChange} required />
                    </div>
                    <div className="auth-field">
                        <label>Email Address</label>
                        <input type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required />
                    </div>
                    <div className="auth-field">
                        <label>Phone Number</label>
                        <input type="text" name="phone" placeholder="08012345678" value={formData.phone} onChange={handleChange} required />
                    </div>
                    <div className="auth-field">
                        <label>Password</label>
                        <input type="password" name="password" placeholder="Min 6 characters" value={formData.password} onChange={handleChange} required />
                    </div>
                    <div className="auth-field">
                        <label>Invite Code</label>
                        <input type="text" name="inviteCode" placeholder="Enter your invite code" value={formData.inviteCode} onChange={handleChange} required />
                        <span className="auth-hint">Contact your admin to get an invite code</span>
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading || toast}>
                        {loading && <span className="auth-spinner" />}
                        {loading ? 'Creating account...' : 'Create Driver Account'}
                    </button>
                </form>

                <p className="auth-switch">
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>

            <style>{`
                .auth-page { min-height: 100vh; background: #f4f6fb; display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
                .auth-card { background: #fff; border-radius: 16px; padding: 2rem; width: 100%; max-width: 420px; box-shadow: 0 4px 24px rgba(13,31,79,0.08); }
                .auth-brand { text-align: center; margin-bottom: 1rem; }
                .auth-logo { width: 64px; height: 64px; object-fit: contain; display: block; margin: 0 auto 0.5rem; }
                .auth-brand-name { display: block; font-weight: 900; font-size: 1.15rem; color: #0d1f4f; letter-spacing: 1.5px; }
                .auth-tagline { font-size: 0.78rem; color: #6b7a99; margin: 0.25rem 0 0; }
                .auth-divider { height: 1px; background: #e8edf7; margin: 1.25rem 0; }
                .auth-role-badge { display: inline-block; background: rgba(232,97,10,0.1); color: #e8610a; font-size: 0.8rem; font-weight: 700; padding: 0.3rem 0.9rem; border-radius: 999px; margin-bottom: 0.75rem; }
                .auth-title { font-weight: 700; color: #0d1f4f; margin-bottom: 1.25rem; font-size: 1rem; }
                .auth-error { background: #fff0f0; border: 1px solid #ffc5c5; color: #c0392b; padding: 0.6rem 0.9rem; border-radius: 8px; font-size: 0.85rem; margin-bottom: 1rem; }
                .auth-field { margin-bottom: 1rem; }
                .auth-field label { display: block; font-size: 0.82rem; font-weight: 600; color: #0d1f4f; margin-bottom: 0.4rem; }
                .auth-field input { width: 100%; padding: 0.65rem 0.9rem; border: 1px solid #dde2ef; border-radius: 10px; font-size: 0.9rem; color: #0d1f4f; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
                .auth-field input:focus { border-color: #0d1f4f; }
                .auth-hint { font-size: 0.75rem; color: #6b7a99; margin-top: 0.3rem; display: block; }
                .auth-btn { width: 100%; background: #0d1f4f; color: #fff; border: none; border-radius: 10px; padding: 0.75rem; font-size: 0.95rem; font-weight: 700; cursor: pointer; margin-top: 0.5rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: background 0.2s; }
                .auth-btn:hover { background: #162660; }
                .auth-btn:disabled { opacity: 0.7; cursor: not-allowed; }
                .auth-spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: authSpin 0.7s linear infinite; flex-shrink: 0; }
                @keyframes authSpin { to { transform: rotate(360deg); } }
                .auth-switch { text-align: center; font-size: 0.85rem; color: #6b7a99; margin-top: 1rem; margin-bottom: 0; }
                .auth-switch a { color: #e8610a; font-weight: 600; text-decoration: none; }
                .auth-switch a:hover { text-decoration: underline; }
                .auth-toast { position: fixed; top: 1.5rem; left: 50%; transform: translateX(-50%); background: #0d1f4f; color: #fff; padding: 0.85rem 1.5rem; border-radius: 12px; font-size: 0.9rem; font-weight: 600; display: flex; align-items: center; gap: 0.6rem; box-shadow: 0 8px 24px rgba(13,31,79,0.25); z-index: 9999; animation: toastIn 0.3s ease; }
                @keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(-10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
            `}</style>
        </div>
    );
};

export default Register;