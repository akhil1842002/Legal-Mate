import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Navbar, Nav, Card } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { FaBalanceScale, FaUserShield, FaGavel, FaSearch, FaRobot, FaFileContract, FaHistory, FaFolderOpen, FaShieldAlt } from 'react-icons/fa';
import LegalHeroImage from '../components/LegalHeroImage';
import './Landing.css';

const Landing = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="landing-container">
            {/* Navigation */}
            <Navbar expand="lg" className="glass-nav fixed-top py-3">
                <Container>
                    <Navbar.Brand as={Link} to="/" className="fw-bold text-primary fs-3">
                        Legal <span className="text-accent">Mate</span>
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ms-auto align-items-center">
                            <Nav.Link onClick={() => scrollToSection('features')} className="mx-2 fw-semibold">Features</Nav.Link>
                            <Nav.Link onClick={() => scrollToSection('roles')} className="mx-2 fw-semibold">User Roles</Nav.Link>
                            {user ? (
                                <Button 
                                    variant="primary" 
                                    className="rounded-pill px-4 ms-lg-3 shadow-sm"
                                    onClick={() => navigate('/dashboard')}
                                >
                                    Go to Dashboard
                                </Button>
                            ) : (
                                <>
                                    <Nav.Link as={Link} to="/login" className="mx-2 fw-semibold">Login</Nav.Link>
                                    <Button 
                                        variant="primary" 
                                        className="rounded-pill px-4 ms-lg-3 shadow-sm"
                                        onClick={() => navigate('/register')}
                                    >
                                        Register
                                    </Button>
                                </>
                            )}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {/* Hero Section */}
            <section className="hero-section d-flex align-items-center">
                <Container>
                    <Row className="align-items-center">
                        <Col lg={6} className="animate-fade-up">
                            <div className="role-badge badge-public">Smart Legal Technology</div>
                            <h1 className="hero-title">Empowering Justice Through AI</h1>
                            <p className="lead text-muted mb-5 fs-4">
                                Law Mate is your comprehensive digital legal ecosystem. Whether you're a legal professional or a concerned citizen, our AI-powered tools simplify the complex world of Indian Penal Code and judicial procedures.
                            </p>
                            <div className="d-flex flex-column flex-sm-row gap-3">
                                <Button 
                                    variant="primary" 
                                    size="lg" 
                                    className="rounded-pill px-5 py-3 shadow w-100 w-sm-auto"
                                    onClick={() => navigate(user ? '/dashboard' : '/register')}
                                >
                                    Get Started Free
                                </Button>
                                <Button 
                                    variant="outline-primary" 
                                    size="lg" 
                                    className="rounded-pill px-5 py-3 w-100 w-sm-auto"
                                    onClick={() => scrollToSection('roles')}
                                >
                                    Learn More
                                </Button>
                            </div>
                        </Col>
                        <Col lg={6} className="d-none d-lg-block text-center floating">
                            <LegalHeroImage />
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Features Summary */}
            <section id="features" className="py-5 bg-white">
                <Container className="py-5">
                    <div className="section-header">
                        <h2 className="section-title text-primary">Powerful Capabilities</h2>
                        <p className="text-muted fs-5 mt-3">Advanced tools designed for accuracy, speed, and accessibility.</p>
                    </div>
                    <Row className="g-4">
                        <Col md={4}>
                            <div className="glass-card text-center h-100">
                                <div className="feature-icon"><FaRobot /></div>
                                <h4 className="fw-bold mb-3">AI Legal Chat</h4>
                                <p className="text-muted">Ask questions in natural language and receive citations from the latest legal codes instantly.</p>
                            </div>
                        </Col>
                        <Col md={4}>
                            <div className="glass-card text-center h-100">
                                <div className="feature-icon"><FaSearch /></div>
                                <h4 className="fw-bold mb-3">Document Analysis</h4>
                                <p className="text-muted">Upload legal documents for instant summarization and identification of relevant penal sections.</p>
                            </div>
                        </Col>
                        <Col md={4}>
                            <div className="glass-card text-center h-100">
                                <div className="feature-icon"><FaHistory /></div>
                                <h4 className="fw-bold mb-3">Unified Database</h4>
                                <p className="text-muted">Access a synchronized database of IPC and modern penal codes with cross-references.</p>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Roles Section - Specific User Value */}
            <section id="roles" className="py-5 bg-light">
                <Container className="py-5">
                    <div className="section-header">
                        <h2 className="section-title text-primary">Tailored for Every Stakeholder</h2>
                        <p className="text-muted fs-5 mt-3">We provide specialized tools for different members of the legal system.</p>
                    </div>
                    <Row className="g-5">
                        {/* Public User */}
                        <Col lg={6}>
                            <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden">
                                <div className="bg-primary p-4 text-white text-center">
                                    <FaBalanceScale size={60} className="mb-3" />
                                    <h3 className="fw-bold">For Public Users</h3>
                                    <p className="mb-0">Legal Empowerment for Citizens</p>
                                </div>
                                <Card.Body className="p-4">
                                    <ul className="list-unstyled">
                                        <li className="d-flex mb-3">
                                            <div className="text-primary me-3 mt-1"><FaShieldAlt /></div>
                                            <div>
                                                <h6 className="fw-bold mb-1">Know Your Rights</h6>
                                                <p className="text-muted small">Easily search for any legal section using everyday language to understand your rights and protections.</p>
                                            </div>
                                        </li>
                                        <li className="d-flex mb-3">
                                            <div className="text-primary me-3 mt-1"><FaGavel /></div>
                                            <div>
                                                <h6 className="fw-bold mb-1">AI Assistant Guidance</h6>
                                                <p className="text-muted small">Chat with our legal bot to clarify complex terminologies and find historical precedents.</p>
                                            </div>
                                        </li>
                                        <li className="d-flex">
                                            <div className="text-primary me-3 mt-1"><FaFolderOpen /></div>
                                            <div>
                                                <h6 className="fw-bold mb-1">Private Document Vault</h6>
                                                <p className="text-muted small">Securely save your inquiries and analysis reports for future reference during legal consultations.</p>
                                            </div>
                                        </li>
                                    </ul>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Police Officer */}
                        <Col lg={6}>
                            <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden">
                                <div className="bg-accent p-4 text-white text-center" style={{ backgroundColor: '#ff007f' }}>
                                    <FaUserShield size={60} className="mb-3" />
                                    <h3 className="fw-bold">For Police Officers</h3>
                                    <p className="mb-0">Modernizing Law Enforcement</p>
                                </div>
                                <Card.Body className="p-4">
                                    <ul className="list-unstyled">
                                        <li className="d-flex mb-3">
                                            <div className="text-accent me-3 mt-1" style={{ color: '#ff007f' }}><FaFileContract /></div>
                                            <div>
                                                <h6 className="fw-bold mb-1">Dynamic FIR Drafting</h6>
                                                <p className="text-muted small">Generate legally precise First Information Reports based on structured incident details with automatic section mapping.</p>
                                            </div>
                                        </li>
                                        <li className="d-flex mb-3">
                                            <div className="text-accent me-3 mt-1" style={{ color: '#ff007f' }}><FaHistory /></div>
                                            <div>
                                                <h6 className="fw-bold mb-1">Digital History Tracking</h6>
                                                <p className="text-muted small">Maintain a searchable, organized database of all drafted and filed reports for departmental oversight.</p>
                                            </div>
                                        </li>
                                        <li className="d-flex">
                                            <div className="text-accent me-3 mt-1" style={{ color: '#ff007f' }}><FaShieldAlt /></div>
                                            <div>
                                                <h6 className="fw-bold mb-1">Instant Law Lookup</h6>
                                                <p className="text-muted small">Rapidly verify sections and punishments on the field to ensure procedural accuracy during bookings.</p>
                                            </div>
                                        </li>
                                    </ul>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Footer */}
            <footer className="footer shadow-lg">
                <Container>
                    <Row className="g-4 mb-5">
                        <Col lg={4}>
                            <h3 className="fw-bold text-white mb-4">Law Mate</h3>
                            <p className="text-light opacity-75">
                                Modern technology for traditional justice. Building the future of legal research and enforcement in India.
                            </p>
                        </Col>
                        <Col lg={2} md={4}>
                            <h6 className="fw-bold text-white text-uppercase mb-4">Product</h6>
                            <ul className="list-unstyled">
                                <li className="mb-2"><Link to="/" className="footer-link">Home</Link></li>
                                <li className="mb-2"><span className="footer-link">AI Chat</span></li>
                                <li className="mb-2"><span className="footer-link">FIR Drafts</span></li>
                            </ul>
                        </Col>
                        <Col lg={2} md={4}>
                            <h6 className="fw-bold text-white text-uppercase mb-4">Support</h6>
                            <ul className="list-unstyled">
                                <li className="mb-2"><span className="footer-link">Documentation</span></li>
                                <li className="mb-2"><span className="footer-link">Help Center</span></li>
                                <li className="mb-2"><span className="footer-link">Terms of Service</span></li>
                            </ul>
                        </Col>
                        <Col lg={4} md={4}>
                            <h6 className="fw-bold text-white text-uppercase mb-4">Contact</h6>
                            <p className="text-light opacity-75 mb-1">Email: info@legalmate.ai</p>
                            <p className="text-light opacity-75">Phone: +91 000 000 0000</p>
                        </Col>
                    </Row>
                    <hr className="bg-light opacity-25" />
                    <div className="text-center py-4 text-light opacity-50 small">
                        © {new Date().getFullYear()} Law Mate. All rights reserved.
                    </div>
                </Container>
            </footer>
        </div>
    );
};

export default Landing;
