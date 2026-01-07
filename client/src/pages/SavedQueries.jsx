import { useState, useEffect } from 'react';
import { Container, Card, ListGroup, Button, Badge, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import { FaHistory, FaTrash, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config';

const SavedQueries = () => {
    const [queries, setQueries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    
    // Pagination state
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const navigate = useNavigate();

    useEffect(() => {
        fetchQueries();
    }, [page, limit]);

    const fetchQueries = async () => {
        setLoading(true);
        setError(null);
        try {
            const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'));
            if (!user?.token) return;

            const response = await fetch(`${API_URL}/api/queries?page=${page}&limit=${limit}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setQueries(data.queries);
                setTotalPages(data.pages);
                setTotalCount(data.total);
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

    const PaginationControls = ({ currentPage, totalPages, totalItems, onPageChange, limit, onLimitChange }) => {
        if (totalItems === 0) return null;

        return (
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4 gap-3 bg-body-tertiary p-3 rounded-4">
                <div className="text-muted small">
                    Showing <strong>{(currentPage - 1) * limit + 1}</strong> to <strong>{Math.min(currentPage * limit, totalItems)}</strong> of <strong>{totalItems}</strong> searches
                </div>
                
                <div className="d-flex align-items-center gap-3">
                    <div className="d-flex align-items-center gap-2">
                        <span className="small text-muted">Rows:</span>
                        <Form.Select 
                            size="sm" 
                            className="w-auto border-0 bg-light rounded-pill px-3"
                            value={limit}
                            onChange={(e) => {
                                onLimitChange(Number(e.target.value));
                                onPageChange(1);
                            }}
                        >
                            {[5, 10, 25, 50].map(l => <option key={l} value={l}>{l}</option>)}
                        </Form.Select>
                    </div>

                    <div className="d-flex gap-1">
                        <Button 
                            variant="light" 
                            size="sm" 
                            disabled={currentPage === 1}
                            onClick={() => onPageChange(currentPage - 1)}
                            className="rounded-circle"
                        >
                            &laquo;
                        </Button>
                        
                        {[...Array(totalPages)].map((_, i) => {
                            const p = i + 1;
                            if (totalPages > 5) {
                                if (p !== 1 && p !== totalPages && Math.abs(p - currentPage) > 1) {
                                    if (p === 2 || p === totalPages - 1) return <span key={p} className="mx-1 text-muted">...</span>;
                                    return null;
                                }
                            }

                            return (
                                <Button 
                                    key={p}
                                    variant={currentPage === p ? 'primary' : 'light'} 
                                    size="sm"
                                    onClick={() => onPageChange(p)}
                                    className="rounded-pill px-3"
                                >
                                    {p}
                                </Button>
                            );
                        })}

                        <Button 
                            variant="light" 
                            size="sm" 
                            disabled={currentPage === totalPages || totalPages === 0}
                            onClick={() => onPageChange(currentPage + 1)}
                            className="rounded-circle"
                        >
                            &raquo;
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        setDeleteId(id);
        setShowConfirm(true);
    };

    const confirmDelete = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'));
            if (!user?.token) return;

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

            {!loading && queries.length > 0 && (
                <PaginationControls 
                    currentPage={page}
                    totalPages={totalPages}
                    totalItems={totalCount}
                    limit={limit}
                    onPageChange={setPage}
                    onLimitChange={setLimit}
                />
            )}

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
