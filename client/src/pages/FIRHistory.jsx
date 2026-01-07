import { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button, Form, Row, Col, Spinner, Alert, Modal } from 'react-bootstrap';
import { FaEye, FaEdit, FaTrash, FaFilePdf, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config';
import { generateFIRPDF } from '../utils/firPDFGenerator';

const FIRHistory = () => {
    const [firs, setFirs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedFIR, setSelectedFIR] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [pagination, setPagination] = useState({
        totalCount: 0,
        totalPages: 1,
        currentPage: 1,
        limit: 10
    });
    const navigate = useNavigate();

    useEffect(() => {
        fetchFIRs(1); // Reset to first page when filter or limit changes
    }, [filterStatus, pagination.limit]);

    const fetchFIRs = async (page = pagination.currentPage) => {
        setLoading(true);
        setError(null);
        try {
            const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'));
            if (!user?.token) return;
            const token = user.token;

            let url = `${API_URL}/api/fir?page=${page}&limit=${pagination.limit}`;
            if (filterStatus !== 'all') {
                url += `&status=${filterStatus}`;
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (response.ok) {
                setFirs(data.firs);
                setPagination(data.pagination);
            } else {
                setError(data.message || 'Failed to fetch FIRs');
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    const viewFIR = async (id) => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'));
            if (!user?.token) return;
            const token = user.token;

            const response = await fetch(`${API_URL}/api/fir/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (response.ok) {
                setSelectedFIR(data);
                setShowModal(true);
            } else {
                setError(data.message || 'Failed to fetch FIR details');
            }
        } catch (err) {
            console.error('View error:', err);
            setError('Failed to load FIR details');
        }
    };

    const downloadPDF = (fir) => {
        try {
            const pdf = generateFIRPDF(fir);
            const fileName = `FIR_${fir.firNumber}_${fir.complainant.name.replace(/\s+/g, '_')}.pdf`;
            pdf.save(fileName);
        } catch (err) {
            console.error('PDF error:', err);
            setError('Failed to generate PDF');
        }
    };

    const deleteFIR = (id) => {
        setDeleteId(id);
        setShowConfirm(true);
    };

    const confirmDelete = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'));
            if (!user?.token) return;
            const token = user.token;

            const response = await fetch(`${API_URL}/api/fir/${deleteId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                fetchFIRs(); // Refresh list
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to delete FIR');
            }
        } catch (err) {
            console.error('Delete error:', err);
            setError('Failed to delete FIR');
        } finally {
            setShowConfirm(false);
            setDeleteId(null);
        }
    };

    const getStatusBadge = (status) => {
        const variants = {
            draft: 'secondary',
            filed: 'primary',
            under_investigation: 'warning',
            closed: 'success'
        };
        return <Badge bg={variants[status] || 'secondary'}>{status.replace('_', ' ').toUpperCase()}</Badge>;
    };

    return (
        <Container className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>FIR History</h2>
                <Button variant="primary" onClick={() => navigate('/generator')}>
                    <FaPlus className="me-2" />
                    Create New FIR
                </Button>
            </div>

            {/* Filters */}
            <Card className="mb-4">
                <Card.Body>
                    <Row>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Filter by Status</Form.Label>
                                <Form.Select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                >
                                    <option value="all">All FIRs</option>
                                    <option value="draft">Drafts</option>
                                    <option value="filed">Filed</option>
                                    <option value="under_investigation">Under Investigation</option>
                                    <option value="closed">Closed</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Items per page</Form.Label>
                                <Form.Select
                                    value={pagination.limit}
                                    onChange={(e) => setPagination(prev => ({ ...prev, limit: parseInt(e.target.value) }))}
                                >
                                    <option value="5">5 per page</option>
                                    <option value="10">10 per page</option>
                                    <option value="25">25 per page</option>
                                    <option value="50">50 per page</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={4} className="d-flex align-items-end">
                            <div className="text-muted pb-2">
                                Total: <strong>{pagination.totalCount}</strong> FIR(s)
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Error Alert */}
            {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

            {/* Loading */}
            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3 text-muted">Loading FIRs...</p>
                </div>
            ) : firs.length === 0 ? (
                <Card className="text-center py-5">
                    <Card.Body>
                        <h5 className="text-muted">No data to show</h5>
                        <p className="text-muted">Create your first FIR to get started</p>
                        <Button variant="primary" onClick={() => navigate('/generator')}>
                            <FaPlus className="me-2" />
                            Create FIR
                        </Button>
                    </Card.Body>
                </Card>
            ) : (
                <Card>
                    <Card.Body className="p-0">
                        <Table responsive hover className="mb-0">
                            <thead className="bg-body-secondary text-body">
                                <tr>
                                    <th>FIR No.</th>
                                    <th>Complainant</th>
                                    <th>Offence</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {firs.map((fir) => (
                                    <tr key={fir._id}>
                                        <td>
                                            <strong>{fir.firNumber || 'DRAFT'}</strong>
                                            {fir.status === 'draft' && (
                                                <div className="small text-muted">{fir.completionPercentage || 0}% Complete</div>
                                            )}
                                        </td>
                                        <td>{fir.complainant?.name || '---'}</td>
                                        <td>{fir.incident?.natureOfOffence || '---'}</td>
                                        <td>{fir.registrationDate ? new Date(fir.registrationDate).toLocaleDateString('en-IN') : '---'}</td>
                                        <td>{getStatusBadge(fir.status)}</td>
                                        <td>
                                            <div className="d-flex gap-2">
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    onClick={() => viewFIR(fir._id)}
                                                    title="View Details"
                                                >
                                                    <FaEye />
                                                </Button>
                                                {fir.status === 'draft' && (
                                                    <Button
                                                        variant="outline-warning"
                                                        size="sm"
                                                        onClick={() => navigate(`/generator?edit=${fir._id}`)}
                                                        title="Edit Draft"
                                                    >
                                                        <FaEdit />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="outline-success"
                                                    size="sm"
                                                    onClick={() => downloadPDF(fir)}
                                                    title="Download PDF"
                                                >
                                                    <FaFilePdf />
                                                </Button>
                                                {fir.status === 'draft' && (
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => deleteFIR(fir._id)}
                                                        title="Delete Draft"
                                                    >
                                                        <FaTrash />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card.Body>
                    <Card.Footer className="bg-white d-flex justify-content-between align-items-center">
                        <div className="text-muted small">
                            Showing page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalCount} total)
                        </div>
                        <div className="d-flex gap-2">
                            <Button
                                variant="outline-primary"
                                size="sm"
                                disabled={pagination.currentPage === 1}
                                onClick={() => fetchFIRs(pagination.currentPage - 1)}
                            >
                                Previous
                            </Button>
                            
                            {/* Smart Pagination with Ellipses */}
                            {(() => {
                                const pages = [];
                                const total = pagination.totalPages;
                                const current = pagination.currentPage;
                                const delta = 1; // Number of pages to show around current
                                
                                for (let i = 1; i <= total; i++) {
                                    if (
                                        i === 1 || // Always show first
                                        i === total || // Always show last
                                        (i >= current - delta && i <= current + delta) // Show around current
                                    ) {
                                        pages.push(
                                            <Button
                                                key={i}
                                                variant={current === i ? 'primary' : 'outline-primary'}
                                                size="sm"
                                                onClick={() => fetchFIRs(i)}
                                            >
                                                {i}
                                            </Button>
                                        );
                                    } else if (
                                        (i === 2 && current > delta + 2) || // Ellipsis after 1
                                        (i === total - 1 && current < total - delta - 1) // Ellipsis before last
                                    ) {
                                        pages.push(<span key={i} className="px-2 align-self-end text-muted pb-1">...</span>);
                                    }
                                }
                                return pages;
                            })()}

                            <Button
                                variant="outline-primary"
                                size="sm"
                                disabled={pagination.currentPage === pagination.totalPages}
                                onClick={() => fetchFIRs(pagination.currentPage + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    </Card.Footer>
                </Card>
            )}

            {/* View Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>FIR Details - {selectedFIR?.firNumber}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedFIR && (
                        <div>
                            <h6 className="border-bottom pb-2 mb-3">Basic Information</h6>
                            <Row className="mb-3">
                                <Col md={6}><strong>FIR Number:</strong> {selectedFIR.firNumber || <span className="text-muted">Not Filed Yet (Draft)</span>}</Col>
                                <Col md={6}><strong>Status:</strong> {getStatusBadge(selectedFIR.status)}</Col>
                                <Col md={6}><strong>Police Station:</strong> {selectedFIR.policeStation?.name || '---'}</Col>
                                <Col md={6}><strong>District:</strong> {selectedFIR.policeStation?.district || '---'}</Col>
                                {selectedFIR.status === 'draft' && (
                                    <Col md={12} className="mt-2">
                                        <strong>Completion:</strong> {selectedFIR.completionPercentage || 0}%
                                        <div className="progress mt-1" style={{ height: '10px' }}>
                                            <div 
                                                className="progress-bar bg-info" 
                                                role="progressbar" 
                                                style={{ width: `${selectedFIR.completionPercentage || 0}%` }}
                                            ></div>
                                        </div>
                                    </Col>
                                )}
                            </Row>

                            <h6 className="border-bottom pb-2 mb-3">Complainant</h6>
                            <Row className="mb-3">
                                <Col md={6}><strong>Name:</strong> {selectedFIR.complainant?.name || '---'}</Col>
                                <Col md={6}><strong>Mobile:</strong> {selectedFIR.complainant?.mobile || '---'}</Col>
                                <Col md={6}><strong>Father/Husband Name:</strong> {selectedFIR.complainant?.fatherName || '---'}</Col>
                                <Col md={6}><strong>Age:</strong> {selectedFIR.complainant?.age || '---'}</Col>
                                <Col md={12}><strong>Address:</strong> {selectedFIR.complainant?.address || '---'}</Col>
                            </Row>

                            <h6 className="border-bottom pb-2 mb-3">Incident Details</h6>
                            <Row className="mb-3">
                                <Col md={6}><strong>Date of Occurrence:</strong> {selectedFIR.incident?.dateOfOccurrence ? new Date(selectedFIR.incident.dateOfOccurrence).toLocaleDateString('en-IN') : '---'}</Col>
                                <Col md={6}><strong>Time:</strong> {selectedFIR.incident?.timeOfOccurrence || '---'}</Col>
                                <Col md={12}><strong>Place of Occurrence:</strong> {selectedFIR.incident?.placeOfOccurrence || '---'}</Col>
                                <Col md={12}><strong>Nature of Offence:</strong> {selectedFIR.incident?.natureOfOffence || '---'}</Col>
                            </Row>

                            <h6 className="border-bottom pb-2 mb-3">Legal Sections</h6>
                            {selectedFIR.legalSections.length > 0 ? (
                                <ul>
                                    {selectedFIR.legalSections.map((section, idx) => (
                                        <li key={idx}>
                                            <Badge bg="primary" className="me-2">{section.act}</Badge>
                                            Section {section.section} - {section.title}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted">No sections added</p>
                            )}

                            <h6 className="border-bottom pb-2 mb-3">Complaint</h6>
                            <p style={{ whiteSpace: 'pre-wrap' }}>{selectedFIR.complaint}</p>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="success" onClick={() => downloadPDF(selectedFIR)}>
                        <FaFilePdf className="me-2" />
                        Download PDF
                    </Button>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered size="sm">
                <Modal.Body className="text-center py-4">
                    <FaTrash size={48} className="text-danger mb-3 opacity-50" />
                    <h5 className="mb-3">Delete FIR Draft?</h5>
                    <p className="text-muted small mb-4">Are you sure you want to remove this FIR record? This action cannot be undone.</p>
                    <div className="d-flex gap-2 justify-content-center">
                        <Button variant="light" onClick={() => setShowConfirm(false)}>Cancel</Button>
                        <Button variant="danger" onClick={confirmDelete}>Delete</Button>
                    </div>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default FIRHistory;
