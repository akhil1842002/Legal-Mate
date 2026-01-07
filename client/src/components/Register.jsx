import { useState } from 'react';
import { Form, Button, Card, Alert, Container, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import LegalHeroImage from './LegalHeroImage';
import API_URL from '../config';

const Register = ({ onLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('public');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role }),
            });

            const data = await response.json();

            if (response.ok) {
                navigate('/login');
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch (err) {
            setError('Server error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container fluid className="vh-100 d-flex align-items-center bg-body-tertiary">
            <Row className="w-100 justify-content-center align-items-center g-0">
                 {/* Left Side: SVG / branding */}
                 <Col md={6} lg={5} className="d-none d-md-flex flex-column align-items-center justify-content-center p-5">
                    <LegalHeroImage />
                    <h2 className="mt-4 fw-bold text-success">Join Law Mate</h2>
                    <p className="text-muted text-center lead">Get instant access to comprehensive Indian legal resources.</p>
                </Col>

                {/* Right Side: Register Form */}
                <Col md={6} lg={5}>
                    <Card className="shadow-lg border-0 rounded-4">
                        <Card.Body className="p-5 position-relative">
                            <div className="position-absolute top-0 start-0 p-4">
                                <Button 
                                    variant="link" 
                                    className="text-decoration-none text-muted p-0 d-flex align-items-center gap-2"
                                    onClick={() => navigate('/')}
                                >
                                    <FaArrowLeft size={12} /> <span className="small fw-bold text-success">HOME</span>
                                </Button>
                            </div>

                            <div className="mb-4 text-center">
                                <h3 className="fw-bold">Create Account</h3>
                                <p className="text-muted">Start your journey today</p>
                            </div>

                            {error && <Alert variant="danger">{error}</Alert>}
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Full Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        className="py-2"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Email Address</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="py-2"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="py-2"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label>I am a...</Form.Label>
                                    <Form.Select value={role} onChange={(e) => setRole(e.target.value)} className="py-2">
                                        <option value="public">Public Citizen</option>
                                        <option value="police">Police Officer</option>
                                    </Form.Select>
                                </Form.Group>

                                <Button variant="success" type="submit" size="lg" className="w-100 mb-3 shadow-sm" disabled={loading}>
                                    {loading ? 'Creating Account...' : 'Register'}
                                </Button>
                            </Form>
                            <div className="text-center mt-3">
                                <span className="text-muted">Already have an account? </span>
                                <Link to="/login" className="text-decoration-none fw-bold">Login here</Link>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Register;
