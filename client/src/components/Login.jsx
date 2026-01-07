import { useState } from 'react';
import { Form, Button, Card, Alert, Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import LegalHeroImage from './LegalHeroImage';
import API_URL from '../config';

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState(null);

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, rememberMe }),
            });

            const data = await response.json();

            if (response.ok) {
                onLogin(data, rememberMe);
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            console.error('Login Error:', err);
            setError('Network error: Unable to connect to server. Is it running?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container fluid className="vh-100 d-flex align-items-center bg-light">
            <Row className="w-100 justify-content-center align-items-center g-0">
                {/* Left Side: SVG / branding */}
                <Col md={6} lg={5} className="d-none d-md-flex flex-column align-items-center justify-content-center p-5">
                    <LegalHeroImage />
                    <h2 className="mt-4 fw-bold text-primary">Your AI Legal Assistant</h2>
                    <p className="text-muted text-center lead">Seamlessly search IPC, CrPC, and more with natural language.</p>
                </Col>

                {/* Right Side: Login Form */}
                <Col md={6} lg={5}>
                    <Card className="shadow-lg border-0 rounded-4">
                        <Card.Body className="p-5">
                            <div className="mb-4 text-center">
                                <h3 className="fw-bold">Welcome Back</h3>
                                <p className="text-muted">Please login to continue</p>
                            </div>
                            
                            {error && <Alert variant="danger">{error}</Alert>}
                            <Form onSubmit={handleSubmit}>
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

                                <Form.Group className="mb-4">
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

                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <div className="form-check">
                                        <input 
                                            className="form-check-input" 
                                            type="checkbox" 
                                            id="remember" 
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                        />
                                        <label className="form-check-label text-muted small" htmlFor="remember">Remember me</label>
                                    </div>
                                    <Link to="/forgot-password" className="text-decoration-none small fw-bold">Forgot Password?</Link>
                                </div>

                                <Button variant="primary" type="submit" size="lg" className="w-100 mb-3 shadow-sm" disabled={loading}>
                                    {loading ? 'Logging in...' : 'Login'}
                                </Button>
                            </Form>
                            <div className="text-center mt-3">
                                <span className="text-muted">New to Legal Mate? </span>
                                <Link to="/register" className="text-decoration-none fw-bold">Create Account</Link>
                            </div>
                        
                            <div className="text-center mt-4">
                                <Button variant="outline-secondary" size="sm" onClick={() => onLogin({ name: 'Test User', email: 'test@example.com', role: 'police', _id: 'dev123' })}>
                                    ⚡ Dev Mode: Quick Access
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Login;
