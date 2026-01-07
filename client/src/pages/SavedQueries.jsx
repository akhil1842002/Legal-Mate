import { useState, useEffect } from 'react';
import { Container, Card, ListGroup, Button, Badge, Spinner, Alert, Modal } from 'react-bootstrap';
import { FaHistory, FaTrash, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config';

const SavedQueries = () => {
    const [queries, setQueries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchQueries();
    }, []);

    const fetchQueries = async () => {
        setLoading(true);
        setError(null);
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await fetch(`${API_URL}/api/queries`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setQueries(data);
            } else {
                setError(data.message || 'Failed to fetch saved searches');
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
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
                setQueries(prev => prev.filter(q => q._id !== deleteId));
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to delete search');
            }
        } catch (err) {
            console.error('Delete error:', err);
            setError('Failed to delete search');
        } finally {
            setShowConfirm(false);
            setDeleteId(null);
        }
    };

    const handleRun = (query, law) => {
        navigate(`/chat?q=${encodeURIComponent(query)}&law=${law}`);
    };

    return (
        <Container className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Saved Searches</h2>
                <Button variant="primary" onClick={() => navigate('/chat')}>
                    <FaSearch className="me-2" />
                    New Search
                </Button>
            </div>

            {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

            <Card className="shadow-sm border-0">
                <Card.Body className="p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-3 text-muted">Loading your saved searches...</p>
                        </div>
                    ) : queries.length === 0 ? (
                        <div className="text-center py-5">
                            <FaHistory size={48} className="text-muted mb-3 opacity-25" />
                            <h5 className="text-muted">No data to show</h5>
                            <p className="text-muted small">Your saved legal queries will appear here.</p>
                            <Button variant="outline-primary" size="sm" onClick={() => navigate('/chat')}>
                                Start Searching
                            </Button>
                        </div>
                    ) : (
                        <ListGroup variant="flush">
                            {queries.map((q) => (
                                <ListGroup.Item 
                                    key={q._id} 
                                    action 
                                    className="py-3 px-4 bg-transparent d-flex justify-content-between align-items-center"
                                    onClick={() => handleRun(q.query, q.law)}
                                >
                                    <div className="d-flex align-items-center">
                                        <div className="p-3 rounded bg-body-secondary text-primary me-3">
                                            <FaHistory />
                                        </div>
                                        <div>
                                            <div className="fw-bold fs-5 mb-1">{q.title}</div>
                                            <div className="d-flex gap-2 align-items-center">
                                                <Badge bg="info">{q.law.toUpperCase()}</Badge>
                                                <small className="text-muted">Saved on {new Date(q.createdAt).toLocaleDateString('en-IN')}</small>
                                            </div>
                                            <div className="text-muted small mt-1 text-truncate" style={{maxWidth: '500px'}}>
                                                "{q.query}"
                                            </div>
                                        </div>
                                    </div>
                                    <Button 
                                        variant="outline-danger" 
                                        size="sm"
                                        onClick={(e) => handleDelete(q._id, e)}
                                        title="Remove search"
                                    >
                                        <FaTrash />
                                    </Button>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    )}
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
        </Container>
    );
};

export default SavedQueries;
