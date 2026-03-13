import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Package, Camera, Radio, Inbox, Truck, CheckCircle, User, Phone, Trash2 } from 'lucide-react';
import { getOrderById, updateOrderStatus, sendLocation, deleteOrder } from '../services/api';
import SidebarLayout from '../components/SidebarLayout';

const statusColor = {
    'pending': '#f5a623',
    'assigned': '#0d6efd',
    'picked-up': '#0d6efd',
    'in-transit': '#e8610a',
    'delivered': '#198754',
    'confirmed': '#198754',
    'cancelled': '#dc3545',
};

const nextStatus = {
    'assigned': { label: 'Mark as Picked Up', value: 'picked-up' },
    'picked-up': { label: 'Mark as In Transit', value: 'in-transit' },
    'in-transit': { label: 'Mark as Delivered', value: 'delivered' },
};

const OrderDetails = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [tracking, setTracking] = useState(false);
    const [lightboxImg, setLightboxImg] = useState(null);
    const trackingInterval = useRef(null);

    const fetchOrder = async () => {
        try {
            const res = await getOrderById(orderId);
            setOrder(res.data.data);
        } catch (err) {
            setError('Failed to load order');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
        return () => stopTracking();
    }, [orderId]);

    const startTracking = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }
        setTracking(true);
        setMessage('Live location sharing started');
        sendCurrentLocation();
        trackingInterval.current = setInterval(sendCurrentLocation, 10000);
    };

    const stopTracking = () => {
        setTracking(false);
        if (trackingInterval.current) {
            clearInterval(trackingInterval.current);
            trackingInterval.current = null;
        }
        setMessage('');
    };

    const sendCurrentLocation = () => {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    await sendLocation(orderId, {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        speed: position.coords.speed || 0,
                    });
                } catch (err) {
                    console.log('Location send failed', err);
                }
            },
            (err) => console.log('Geolocation error', err),
            { enableHighAccuracy: true }
        );
    };

    const handleUpdateStatus = async () => {
        const next = nextStatus[order.status];
        if (!next) return;
        setUpdating(true);
        setError('');
        try {
            await updateOrderStatus(orderId, next.value);
            setMessage(`Order marked as ${next.value}`);
            if (['picked-up', 'in-transit'].includes(next.value) && !tracking) {
                startTracking();
            }
            if (next.value === 'delivered') stopTracking();
            fetchOrder();
        } catch (err) {
            setError(err.response?.data?.message || 'Error updating status');
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await deleteOrder(orderId);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Error deleting order');
            setDeleting(false);
        }
    };

    if (loading) return (
        <>
            <SidebarLayout>
                <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
                    <div className="spinner-border" style={{ color: '#0d1f4f' }} />
                </div>
            </SidebarLayout>
        </>
    );

    if (!order) return (
        <>
            <SidebarLayout>
                <div className="container py-4">
                    <div className="alert alert-danger">{error || 'Order not found'}</div>
                </div>
            </SidebarLayout>
        </>
    );

    const next = nextStatus[order.status];

    return (
        <>
            <SidebarLayout>
                <div className="container py-4">
                    <div className="row justify-content-center">
                        <div className="col-md-7">

                            <button className="btn btn-link p-0 mb-3 text-muted" onClick={() => navigate('/dashboard')}>
                                ← Back to Orders
                            </button>

                            {message && <div className="alert alert-success py-2 small">{message}</div>}
                            {error && <div className="alert alert-danger py-2 small">{error}</div>}

                            {/* Header */}
                            <div className="card border-0 shadow-sm mb-3" style={{ borderRadius: 14 }}>
                                <div className="card-body d-flex justify-content-between align-items-center">
                                    <div>
                                        <h5 className="fw-bold mb-0" style={{ color: '#0d1f4f' }}>#{order.trackingNumber}</h5>
                                        <small className="text-muted">Placed {new Date(order.createdAt).toLocaleDateString('en-GB')}</small>
                                    </div>
                                    <span className="badge fs-6" style={{ background: statusColor[order.status], color: '#fff' }}>
                                        {order.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            {/* Customer */}
                            <div className="card border-0 shadow-sm mb-3" style={{ borderRadius: 14 }}>
                                <div className="card-body">
                                    <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#0d1f4f' }}>
                                        <User size={16} /> Customer
                                    </h6>
                                    <p className="mb-1 small"><strong>Name:</strong> {order.customer?.fullName}</p>
                                    <p className="mb-0 small d-flex align-items-center gap-1">
                                        <Phone size={13} />
                                        <a href={`tel:${order.customer?.phone}`} style={{ color: '#e8610a' }}>
                                            {order.customer?.phone}
                                        </a>
                                    </p>
                                </div>
                            </div>

                            {/* Route */}
                            <div className="card border-0 shadow-sm mb-3" style={{ borderRadius: 14 }}>
                                <div className="card-body">
                                    <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#0d1f4f' }}>
                                        <MapPin size={16} /> Delivery Route
                                    </h6>
                                    <div className="d-flex gap-3">
                                        <div className="flex-fill p-3 rounded" style={{ background: '#f4f6fb' }}>
                                            <small className="text-muted d-block mb-1" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Pickup</small>
                                            <p className="mb-0 fw-semibold small">{order.pickupAddress?.street}</p>
                                            <small className="text-muted">{order.pickupAddress?.city}</small>
                                        </div>
                                        <div className="d-flex align-items-center text-muted">→</div>
                                        <div className="flex-fill p-3 rounded" style={{ background: '#f4f6fb' }}>
                                            <small className="text-muted d-block mb-1" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Delivery</small>
                                            <p className="mb-0 fw-semibold small">{order.deliveryAddress?.street}</p>
                                            <small className="text-muted">{order.deliveryAddress?.city}</small>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Package */}
                            <div className="card border-0 shadow-sm mb-3" style={{ borderRadius: 14 }}>
                                <div className="card-body">
                                    <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#0d1f4f' }}>
                                        <Package size={16} /> Package Details
                                    </h6>
                                    <div className="row g-2">
                                        <div className="col-6">
                                            <p className="mb-1 text-muted small">Description</p>
                                            <p className="mb-0 small">{order.packageDescription || 'N/A'}</p>
                                        </div>
                                        <div className="col-3">
                                            <p className="mb-1 text-muted small">Weight</p>
                                            <p className="mb-0 small">{order.weight} kg</p>
                                        </div>
                                        <div className="col-3">
                                            <p className="mb-1 text-muted small">Price</p>
                                            <p className="mb-0 fw-bold small" style={{ color: '#e8610a' }}>₦{order.price?.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Images */}
                            {order.images?.length > 0 && (
                                <div className="card border-0 shadow-sm mb-3" style={{ borderRadius: 14 }}>
                                    <div className="card-body">
                                        <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#0d1f4f' }}>
                                            <Camera size={16} /> Package Photos
                                        </h6>
                                        <div className="d-flex gap-3 flex-wrap">
                                            {order.images.map((img, i) => (
                                                <img
                                                    key={i}
                                                    src={img.url}
                                                    alt={`Package ${i + 1}`}
                                                    onClick={() => setLightboxImg(img.url)}
                                                    style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 10, border: '2px solid #e8edf7', cursor: 'pointer' }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* GPS Tracking */}
                            {['picked-up', 'in-transit'].includes(order.status) && (
                                <div className="card border-0 shadow-sm mb-3" style={{ borderRadius: 14, borderLeft: `4px solid ${tracking ? '#198754' : '#e8610a'}` }}>
                                    <div className="card-body d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 className="fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: '#0d1f4f' }}>
                                                <Radio size={16} /> Live Location Sharing
                                            </h6>
                                            <small className="text-muted">
                                                {tracking ? 'Your location is being shared with the customer' : 'Share your live location with the customer'}
                                            </small>
                                        </div>
                                        <button
                                            className="btn btn-sm fw-bold"
                                            onClick={tracking ? stopTracking : startTracking}
                                            style={{ background: tracking ? '#dc3545' : '#198754', color: '#fff', borderRadius: 8, minWidth: 80 }}
                                        >
                                            {tracking ? 'Stop' : 'Start'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Status update button */}
                            {next && (
                                <button
                                    className="btn w-100 fw-bold mb-2"
                                    onClick={handleUpdateStatus}
                                    disabled={updating}
                                    style={{ background: '#e8610a', color: '#fff', borderRadius: 10, padding: '0.8rem', fontSize: '1rem' }}
                                >
                                    {updating && <span className="spinner-border spinner-border-sm me-2" />}
                                    {updating ? 'Updating...' : (
                                        <span className="d-flex align-items-center justify-content-center gap-2">
                                            {next.value === 'picked-up' && <Inbox size={18} />}
                                            {next.value === 'in-transit' && <Truck size={18} />}
                                            {next.value === 'delivered' && <CheckCircle size={18} />}
                                            {next.label}
                                        </span>
                                    )}
                                </button>
                            )}

                            {order.status === 'delivered' && (
                                <div className="alert alert-success mt-2 text-center">
                                    Order delivered! Waiting for customer confirmation.
                                </div>
                            )}

                            {order.status === 'confirmed' && (
                                <div className="alert mt-2 text-center" style={{ background: '#d1e7dd', color: '#0a3622' }}>
                                    Order confirmed by customer. Great job!
                                </div>
                            )}

                            {/* Delete button */}
                            {['cancelled', 'confirmed'].includes(order.status) && (
                                <button
                                    className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 mt-2"
                                    style={{ borderRadius: 10 }}
                                    data-bs-toggle="modal"
                                    data-bs-target="#deleteModal"
                                >
                                    <Trash2 size={16} /> Delete Order
                                </button>
                            )}

                        </div>
                    </div>
                </div>

                {/* ── Delete Confirmation Modal ─────────────────────── */}
                <div className="modal fade" id="deleteModal" tabIndex="-1" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0" style={{ borderRadius: 16 }}>
                            <div className="modal-body text-center p-4">
                                <div style={{
                                    width: 60, height: 60,
                                    background: '#fff0f0',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 1rem',
                                }}>
                                    <Trash2 size={30} color="#dc3545" />
                                </div>
                                <h5 className="fw-bold mb-2" style={{ color: '#0d1f4f' }}>Delete Order?</h5>
                                <p className="text-muted small mb-4">
                                    This will permanently remove the order from your history. This cannot be undone.
                                </p>
                                <div className="d-flex gap-2 justify-content-center">
                                    <button
                                        className="btn btn-outline-secondary px-4"
                                        style={{ borderRadius: 10 }}
                                        data-bs-dismiss="modal"
                                    >
                                        Go Back
                                    </button>
                                    <button
                                        className="btn btn-danger px-4 fw-bold"
                                        style={{ borderRadius: 10 }}
                                        data-bs-dismiss="modal"
                                        onClick={handleDelete}
                                        disabled={deleting}
                                    >
                                        {deleting && <span className="spinner-border spinner-border-sm me-2" />}
                                        {deleting ? 'Deleting...' : 'Yes, Delete'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Lightbox ───────────────────────────────────────── */}
                {lightboxImg && (
                    <div
                        onClick={() => setLightboxImg(null)}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, cursor: 'zoom-out' }}
                    >
                        <img src={lightboxImg} alt="Full size" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 12 }} />
                    </div>
                )}
            </SidebarLayout>
        </>
    );
};

export default OrderDetails;