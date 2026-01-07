import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, ListGroup, Badge, Button, Modal } from 'react-bootstrap';
import { FaRobot, FaFileContract, FaSearch, FaHistory, FaCheckCircle, FaEdit, FaBalanceScale, FaTrash, FaUsers, FaPen } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [savedQueries, setSavedQueries] = useState([]);
    const [queriesLoading, setQueriesLoading] = useState(true);
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    
    // Helper to get user from either storage (consistent with App.jsx)
    const getStoredUser = () => JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'));
    const user = getStoredUser();
    const userRole = user?.role?.toLowerCase() || 'public';
    
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            const currentUser = getStoredUser();
            if (!currentUser?.token) return;

            try {
                const response = await fetch(`${API_URL}/api/stats/dashboard`, {
                    headers: {
                        'Authorization': `Bearer ${currentUser.token}`
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    setStats(data);
                } else {
                    setError(data.message || 'Failed to fetch dashboard data');
                }
            } catch (err) {
                console.error('Dashboard fetch error:', err);
                setError('Could not connect to server');
            } finally {
                setLoading(false);
            }
        };

        const fetchQueries = async () => {
            const currentUser = getStoredUser();
            if (!currentUser?.token) return;

            try {
                const response = await fetch(`${API_URL}/api/queries`, {
                    headers: {
                        'Authorization': `Bearer ${currentUser.token}`
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    setSavedQueries(data.queries || []);
                }
            } catch (err) {
                console.error('Queries fetch error:', err);
            } finally {
                setQueriesLoading(false);
            }
        };

        fetchStats();
        fetchQueries();
    }, []);

    const handleDeleteQuery = async (id, e) => {
        if (e) e.stopPropagation();
        setDeleteId(id);
        setShowConfirm(true);
    };

    const confirmDelete = async () => {
        try {
            const currentUser = getStoredUser();
            if (!currentUser?.token) return;
            
            const response = await fetch(`${API_URL}/api/queries/${deleteId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${currentUser.token}`
                }
            });

            if (response.ok) {
                // Update local list
                setSavedQueries(prev => prev.filter(q => q._id !== deleteId));
                // Update stats count immediately
                setStats(prev => ({
                    ...prev,
                    savedQueries: Math.max(0, (prev.savedQueries || 0) - 1)
                }));
            }
        } catch (err) {
            console.error('Delete query error:', err);
        } finally {
            setShowConfirm(false);
            setDeleteId(null);
        }
    };

    const handleRunQuery = (query, law) => {
        navigate(`/chat?q=${encodeURIComponent(query)}&law=${law}`);
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted">Loading your dashboard...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-4">
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    const statCards = [
        { title: stats.global ? 'Total Platform Searches' : 'Total Searches', count: stats.totalSearches, icon: <FaSearch />, color: 'primary' },
        { title: stats.global ? 'Global Documents Drafted' : 'Documents Drafted', count: stats.documentsDrafted, icon: <FaFileContract />, color: 'success', roles: ['admin', 'police'] },
        { title: stats.global ? 'Global Filed FIRs' : 'Filed FIRs', count: stats.totalFiledDocs, icon: <FaCheckCircle />, color: 'info', roles: ['admin', 'police'] },
        { title: stats.global ? 'Global Documents Analyzed' : 'Documents Analyzed', count: stats.totalAnalyzed, icon: <FaBalanceScale />, color: 'danger' },
        { title: stats.global ? 'Total Saved Queries' : 'Saved Queries', count: stats.savedQueries, icon: <FaHistory />, color: 'warning' },
    ];

    // Add Total Users card for admins
    if (stats.global) {
        statCards.push({ title: 'Total Platform Users', count: stats.totalUsers, icon: <FaUsers />, color: 'secondary' });
    }

    const filteredStatCards = statCards.filter(card => 
        !card.roles || card.roles.includes(userRole)
    );

    const StatCard = ({ title, count, icon, color }) => (
        <Col>
            <Card className="h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                <Card.Body className="p-4">
                    <div className="d-flex align-items-center mb-3">
                        <div className={`p-3 rounded-4 bg-${color} bg-opacity-10 text-${color} me-3`}>
                            {icon}
                        </div>
                        <h6 className="text-muted mb-0 fw-bold">{title}</h6>
                    </div>
                    <h2 className="mb-0 fw-bold">{count || 0}</h2>
                </Card.Body>
            </Card>
        </Col>
    );

    return (
        <Container fluid className="py-4 px-4 min-vh-100">
            {/* Header Section */}
            <div className={`d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3`}>
                <div>
                    <h2 className="fw-bold mb-1">
                        {stats.global ? 'Global Management Overview' : `Welcome Back, ${user.name}!`}
                    </h2>
                    <p className="text-muted mb-0">
                        {stats.global ? 'Real-time analytics across the entire platform' : 'Here is what is happening with your legal research today.'}
                    </p>
                </div>
                <div className="d-flex gap-2">
                    <Button 
                        variant="outline-primary" 
                        className="rounded-pill px-4 py-2 shadow-sm d-flex align-items-center gap-2"
                        onClick={() => navigate('/chat')}
                    >
                        <FaRobot size={14} /> AI Assistant
                    </Button>
                    {userRole !== 'public' && (
                        <Button 
                            variant="primary" 
                            className="rounded-pill px-4 py-2 shadow-sm d-flex align-items-center gap-2"
                            onClick={() => navigate('/generator')}
                        >
                            <FaPen size={14} /> New FIR Draft
                        </Button>
                    )}
                </div>
            </div>

            {/* Stats Overview */}
            <Row className={`row-cols-1 row-cols-md-2 row-cols-lg-${stats.global ? 3 : (user.role === 'public' ? 3 : filteredStatCards.length)} g-4 mb-5`}>
                {filteredStatCards.map((card, idx) => (
                    <StatCard key={idx} {...card} />
                ))}
            </Row>

            <Row className="g-4">
                {/* Left Column: Recent Activity */}
                {!(userRole === 'public' && !stats.global) && (
                    <Col lg={8}>
                        <Card className="border-0 shadow-sm rounded-4 h-100">
                            <Card.Body className="p-4">
                                <h5 className="fw-bold mb-4 d-flex align-items-center">
                                    <span className="p-2 rounded-3 bg-primary bg-opacity-10 text-primary me-3">
                                        <FaHistory size={18} />
                                    </span>
                                    {stats.global ? 'Platform-Wide Activity' : 'Recent Activity'}
                                </h5>
                                <div className="activity-timeline" style={{ maxHeight: '450px', overflowY: 'auto', paddingRight: '10px' }}>
                                    {stats.recentActivity && stats.recentActivity.length > 0 ? (
                                        stats.recentActivity.map((activity, idx) => (
                                            <div key={idx} className="d-flex mb-4 last-child-mb-0">
                                                <div className="me-3 position-relative">
                                                    <div className="p-2 rounded-circle bg-body text-primary border position-relative z-index-1">
                                                        {activity.type === 'FIR' ? <FaFileContract size={14} /> : <FaSearch size={14} />}
                                                    </div>
                                                    {idx !== stats.recentActivity.length - 1 && (
                                                        <div className="position-absolute h-100 border-start border-2 start-50 translate-middle-x top-100" style={{marginTop: '-8px'}}></div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="d-flex align-items-center gap-2 mb-1">
                                                        <span className="fw-bold small">{activity.action}</span>
                                                        <Badge bg="light" text="dark" className="fw-normal border small">{activity.identifier}</Badge>
                                                    </div>
                                                    <p className="text-muted small mb-1">{activity.description}</p>
                                                    <small className="text-muted" style={{fontSize: '11px'}}>
                                                        {new Date(activity.timestamp).toLocaleString()}
                                                    </small>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-5">
                                            <p className="text-muted mb-0 italic">No recent activity to show.</p>
                                        </div>
                                    )}
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                )}

                {/* Right Column: Saved Searches (or full width if activity hidden) */}
                <Col lg={(!stats.global && user.role === 'public') ? 12 : 4}>
                    <Card className="shadow-sm border-0 rounded-4 h-100">
                        <Card.Header className="py-3 border-bottom d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold">{stats.global ? 'Platform-Wide Searches' : 'Saved Searches'}</h5>
                            <Badge bg="warning" text="dark">{stats.global ? (stats.savedQueries || 0) : (savedQueries.length)}</Badge>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <div style={{ height: '400px', overflowY: 'auto' }}>
                                {queriesLoading ? (
                                    <div className="text-center py-4">
                                        <Spinner animation="border" size="sm" variant="warning" />
                                    </div>
                                ) : (stats.global ? stats.recentQueries : savedQueries).length > 0 ? (
                                    <ListGroup variant="flush">
                                        {(stats.global ? stats.recentQueries : savedQueries).map((q) => (
                                            <ListGroup.Item 
                                                key={q._id} 
                                                action 
                                                as="div"
                                                className="py-3 px-4 bg-transparent d-flex justify-content-between align-items-center border-0 border-bottom"
                                                onClick={() => handleRunQuery(q.query, q.law)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div className="d-flex align-items-center">
                                                    <div className="p-2 rounded bg-body-secondary text-primary me-3">
                                                        <FaHistory />
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold">{q.title}</div>
                                                        <small className="text-muted">
                                                            Law: {q.law.toUpperCase()} 
                                                            {stats.global && q.user && ` • By ${q.user.name}`}
                                                        </small>
                                                    </div>
                                                </div>
                                                {!stats.global && (
                                                    <Button 
                                                        variant="link" 
                                                        className="text-danger p-0 border-0"
                                                        onClick={(e) => handleDeleteQuery(q._id, e)}
                                                    >
                                                        <FaTrash />
                                                    </Button>
                                                )}
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                ) : (
                                    <div className="text-center py-4 text-muted">
                                        <small>No data to show</small>
                                    </div>
                                )}
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Delete Confirmation Modal */}
                    <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered size="sm">
                        <Modal.Body className="text-center py-4">
                            <FaTrash size={48} className="text-danger mb-3 opacity-50" />
                            <h5 className="mb-3">Delete Saved Search?</h5>
                            <p className="text-muted small mb-4">Are you sure you want to remove this search from your library?</p>
                            <div className="d-flex gap-2 justify-content-center">
                                <Button variant="light" onClick={() => setShowConfirm(false)}>Cancel</Button>
                                <Button variant="danger" onClick={confirmDelete}>Delete</Button>
                            </div>
                        </Modal.Body>
                    </Modal>
                </Col>
            </Row>
        </Container>
    );
};

export default Dashboard;
