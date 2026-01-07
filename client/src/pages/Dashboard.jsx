import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, ListGroup, Badge, Button, Modal } from 'react-bootstrap';
import { FaRobot, FaFileContract, FaSearch, FaHistory, FaCheckCircle, FaEdit, FaBalanceScale, FaTrash } from 'react-icons/fa';
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
    const userRole = JSON.parse(localStorage.getItem('user'))?.role?.toLowerCase() || 'public';
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                const response = await fetch(`${API_URL}/api/stats/dashboard`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
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
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                const response = await fetch(`${API_URL}/api/queries`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    setSavedQueries(data);
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
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await fetch(`${API_URL}/api/queries/${deleteId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`
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
        { title: 'Total Searches', count: stats.totalSearches, icon: <FaSearch />, color: 'primary', roles: ['admin', 'police', 'public'] },
        { title: 'Documents Drafted', count: stats.documentsDrafted, icon: <FaFileContract />, color: 'success', roles: ['admin', 'police'] },
        { title: 'Filed FIRs', count: stats.totalFiledDocs, icon: <FaCheckCircle />, color: 'info', roles: ['admin', 'police'] },
        { title: 'Documents Analyzed', count: stats.totalAnalyzed, icon: <FaBalanceScale />, color: 'danger', roles: ['admin', 'police', 'public'] },
        { title: 'Saved Queries', count: stats.savedQueries, icon: <FaHistory />, color: 'warning', roles: ['admin', 'police', 'public'] },
    ];

    const filteredStatCards = statCards.filter(card => card.roles.includes(userRole));

    return (
        <Container className="py-4">
            <h2 className="mb-4">Dashboard Overview</h2>
            <Row className={`g-3 row-cols-1 row-cols-sm-2 row-cols-md-3 ${userRole === 'public' ? 'row-cols-lg-3' : 'row-cols-lg-5'}`}>
                {filteredStatCards.map((stat, idx) => (
                    <Col key={idx}>
                        <Card className={`text-center h-100 border-0 shadow-sm border-top border-4 border-${stat.color}`}>
                            <Card.Body className="p-3">
                                <div className={`h3 text-${stat.color} mb-2`}>{stat.icon}</div>
                                <h6 className="text-muted text-uppercase x-small fw-bold mb-1" style={{fontSize: '0.7rem'}}>{stat.title}</h6>
                                <p className="h4 fw-bold mb-0">{stat.count}</p>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
            
            <Row className="mt-5">
                <Col md={8}>
                    {userRole !== 'public' && (
                        <Card className="shadow-sm border-0 mb-4">
                            <Card.Header className="py-3 border-bottom">
                                <h5 className="mb-0 fw-bold">Recent Activity</h5>
                            </Card.Header>
                            <Card.Body className="p-0">
                                <div style={{ height: '400px', overflowY: 'auto' }}>
                                    {stats.recentActivity.length > 0 ? (
                                        <ListGroup variant="flush">
                                            {stats.recentActivity.map((activity, idx) => (
                                                <ListGroup.Item key={idx} className="py-3 px-4 bg-transparent border-0 border-bottom">
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div className="d-flex align-items-center">
                                                            <div className={`p-2 rounded-circle bg-body-secondary text-${activity.action.includes('Filed') ? 'success' : 'warning'} me-3`}>
                                                                {activity.action.includes('Filed') ? <FaCheckCircle /> : <FaEdit />}
                                                            </div>
                                                            <div>
                                                                <div className="fw-bold">{activity.action}: {activity.identifier}</div>
                                                                <small className="text-muted">{activity.description}</small>
                                                            </div>
                                                        </div>
                                                        <small className="text-muted">
                                                            {new Date(activity.timestamp).toLocaleDateString('en-IN')}
                                                        </small>
                                                    </div>
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    ) : (
                                        <div className="text-center py-5">
                                            <p className="text-muted">No data to show</p>
                                        </div>
                                    )}
                                </div>
                            </Card.Body>
                        </Card>
                    )}

                    {/* Saved Queries Section */}
                    <Card className="shadow-sm border-0 mt-4">
                        <Card.Header className="py-3 border-bottom d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold">Saved Searches</h5>
                            <Badge bg="warning" text="dark">{savedQueries.length}</Badge>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <div style={{ height: '400px', overflowY: 'auto' }}>
                                {queriesLoading ? (
                                    <div className="text-center py-4">
                                        <Spinner animation="border" size="sm" variant="warning" />
                                    </div>
                                ) : savedQueries.length > 0 ? (
                                    <ListGroup variant="flush">
                                        {savedQueries.map((q) => (
                                            <ListGroup.Item 
                                                key={q._id} 
                                                action 
                                                className="py-3 px-4 bg-transparent d-flex justify-content-between align-items-center border-0 border-bottom"
                                                onClick={() => handleRunQuery(q.query, q.law)}
                                            >
                                                <div className="d-flex align-items-center">
                                                    <div className="p-2 rounded bg-body-secondary text-primary me-3">
                                                        <FaHistory />
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold">{q.title}</div>
                                                        <small className="text-muted">Law: {q.law.toUpperCase()}</small>
                                                    </div>
                                                </div>
                                                <Button 
                                                    variant="link" 
                                                    className="text-danger p-0 border-0"
                                                    onClick={(e) => handleDeleteQuery(q._id, e)}
                                                >
                                                    <FaTrash />
                                                </Button>
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
                <Col md={4}>
                    <Card className="shadow-sm border-0 bg-primary text-white h-100">
                        <Card.Body className="d-flex flex-column justify-content-center text-center">
                            <FaRobot size={48} className="mb-3 mx-auto" />
                            <h4>AI Assistant Ready</h4>
                            <p className="small opacity-75">Need help with legal sections or FIR analysis? Our AI is here to help.</p>
                            <Button 
                                variant="light" 
                                className="mt-3 fw-bold"
                                onClick={() => navigate('/chat')}
                            >
                                Start Chat
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Dashboard;
