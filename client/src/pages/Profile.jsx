import { useState } from 'react';
import { Container, Card, Form, Row, Col, Badge, Button } from 'react-bootstrap';
import { FaUserCircle, FaEnvelope, FaIdBadge, FaShieldAlt } from 'react-icons/fa';
import API_URL from '../config';

const Profile = () => {
    const getStoredUser = () => JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
    const [user, setUser] = useState(getStoredUser());
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user.name || '',
        email: user.email || ''
    });
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setMessage(null);
        setError(null);
        setLoading(true);

        try {
            const currentUser = getStoredUser();
            const token = currentUser.token;
            if (!token) {
                setError('Authentication session expired. Please login again.');
                return;
            }

            const response = await fetch(`${API_URL}/api/users/profile`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Profile updated successfully');
                setIsEditing(false);
                setUser(data);
                if (localStorage.getItem('user')) {
                    localStorage.setItem('user', JSON.stringify(data));
                } else {
                    sessionStorage.setItem('user', JSON.stringify(data));
                }
            } else {
                setError(data.message || 'Update failed');
            }
        } catch (err) {
            setError('Server error.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-4">
            <Row className="justify-content-center">
                <Col md={8} lg={6}>
                    <h2 className="mb-4">My Profile</h2>
                    <Card className="shadow-sm border-0">
                        <Card.Body className="p-4">
                            <div className="text-center mb-4">
                                <FaUserCircle size={80} className="text-primary mb-3" />
                                <h3 className="fw-bold">{user.name || 'User'}</h3>
                                <Badge bg={user.role === 'police' ? 'danger' : 'info'} className="px-3 py-2">
                                    {(user.role || 'public').toUpperCase()}
                                </Badge>
                            </div>

                            {message && <div className="alert alert-success">{message}</div>}
                            {error && <div className="alert alert-danger">{error}</div>}

                            <Form onSubmit={handleUpdate}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-muted small fw-bold"><FaUserCircle className="me-2"/> FULL NAME</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        name="name"
                                        value={isEditing ? formData.name : user.name || ''} 
                                        onChange={handleChange}
                                        readOnly={!isEditing} 
                                        className={!isEditing ? "bg-body-secondary" : ""} 
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="text-muted small fw-bold"><FaEnvelope className="me-2"/> EMAIL ADDRESS</Form.Label>
                                    <Form.Control 
                                        type="email" 
                                        name="email"
                                        value={isEditing ? formData.email : user.email || ''} 
                                        onChange={handleChange}
                                        readOnly={!isEditing} 
                                        className={!isEditing ? "bg-body-secondary" : ""} 
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="text-muted small fw-bold"><FaShieldAlt className="me-2"/> ROLE & PERMISSIONS</Form.Label>
                                    <Form.Control type="text" value={user.role === 'police' ? 'Police Access (Restricted)' : 'Public Access (Standard)'} readOnly className="bg-body-secondary" />
                                </Form.Group>
                                
                                <Form.Group className="mb-4">
                                    <Form.Label className="text-muted small fw-bold"><FaIdBadge className="me-2"/> USER ID</Form.Label>
                                    <Form.Control type="text" value={user._id || 'N/A'} readOnly className="bg-body-secondary mono-font" style={{fontFamily: 'monospace'}} />
                                </Form.Group>

                                <div className="d-grid gap-2">
                                    {!isEditing ? (
                                        <Button variant="outline-primary" onClick={(e) => { e.preventDefault(); setIsEditing(true); }}>Edit Profile</Button>
                                    ) : (
                                        <>
                                            <Button variant="primary" type="submit" disabled={loading}>
                                                {loading ? 'Saving...' : 'Save Changes'}
                                            </Button>
                                            <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
                                        </>
                                    )}
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Profile;
