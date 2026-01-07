import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, ListGroup, Badge, ProgressBar, Spinner } from 'react-bootstrap';
import { FaFileAlt, FaBalanceScale, FaExclamationTriangle, FaCheckCircle, FaInfoCircle, FaMagic } from 'react-icons/fa';
import API_URL from '../config';

const DocumentAnalysis = () => {
    const [text, setText] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
            setText(''); // Clear text when file is selected
            setResults(null); // Clear previous results
            setError(null);
        } else {
            setError('Please select a valid PDF file.');
            e.target.value = null;
        }
    };

    const handleAnalyze = async () => {
        if (!file && (!text.trim() || text.length < 20)) {
            setError('Please enter at least 20 characters of legal text or upload a PDF for analysis.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            
            const formData = new FormData();
            if (file) {
                formData.append('file', file);
            } else {
                formData.append('text', text);
            }

            const response = await fetch(`${API_URL}/api/analysis`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                },
                body: formData
            });

            const data = await response.json();
            if (response.ok) {
                setResults(data);
                if (file) {
                    setText(data.text); // Show extracted text in the editor
                }
            } else {
                setError(data.message || 'Analysis failed');
            }
        } catch (err) {
            console.error('Analysis error:', err);
            setError('Connection failed. Please check if the server is running.');
        } finally {
            setLoading(false);
        }
    };

    const getScoreVariant = (score) => {
        if (score > 80) return 'success';
        if (score > 50) return 'warning';
        return 'danger';
    };

    const getInsightIcon = (type) => {
        switch (type) {
            case 'success': return <FaCheckCircle className="text-success me-2" />;
            case 'warning': return <FaExclamationTriangle className="text-warning me-2" />;
            case 'info': return <FaInfoCircle className="text-info me-2" />;
            case 'suggestion': return <FaMagic className="text-primary me-2" />;
            default: return <FaInfoCircle className="text-muted me-2" />;
        }
    };

    return (
        <Container className="py-4">
            <div className="d-flex align-items-center mb-4">
                <FaBalanceScale className="text-primary me-3 fs-3" />
                <h2 className="mb-0">Legal Document Analyzer</h2>
            </div>

            <Row className="g-4 flex-column">
                {/* Input Section - Now on Top */}
                <Col xs={12}>
                    <Card className="shadow-sm border-0">
                        <Card.Header className="py-3 border-bottom">
                            <h5 className="mb-0">Legal Narrative / Case Summary</h5>
                        </Card.Header>
                        <Card.Body className="d-flex flex-column" style={{ minHeight: '450px' }}>
                            <div className="mb-4 bg-body-secondary p-3 rounded border text-center">
                                <Form.Group controlId="formFile" className="mb-0">
                                    <div className="d-flex align-items-center justify-content-center gap-3">
                                        <Form.Label className="btn btn-outline-primary mb-0 fw-bold">
                                            Choose PDF File
                                            <Form.Control 
                                                type="file" 
                                                accept=".pdf" 
                                                onChange={handleFileChange}
                                                style={{ display: 'none' }}
                                            />
                                        </Form.Label>
                                        <div className="text-muted small text-truncate" style={{ maxWidth: '350px' }}>
                                            {file ? (
                                                <span className="fw-bold">
                                                    📄 {file.name}
                                                    <Button 
                                                        variant="link" 
                                                        className="text-danger p-0 ms-2"
                                                        onClick={() => { setFile(null); setText(''); setResults(null); }}
                                                    >
                                                        (Clear)
                                                    </Button>
                                                </span>
                                            ) : (
                                                'Select a legal document to begin analysis'
                                            )}
                                        </div>
                                    </div>
                                </Form.Group>
                            </div>

                            <Form.Group className="mb-3 flex-grow-1 d-flex flex-column">
                                <Form.Label className="text-muted small fw-bold text-uppercase d-flex justify-content-between">
                                    <span>{file ? 'Extracted Text from PDF' : 'Paste your draft FIR text or legal summary'}</span>
                                    {file && <Badge bg="info">Auto-Extracted</Badge>}
                                </Form.Label>
                                <Form.Control
                                    as="textarea"
                                    className="flex-grow-1 font-monospace"
                                    placeholder="Or type/paste your legal narrative here for analysis..."
                                    value={text}
                                    onChange={(e) => {
                                        setText(e.target.value);
                                        setResults(null); // Clear results when user types
                                        if (file) setFile(null); // Switch back to text mode if user types
                                    }}
                                    style={{ fontSize: '1rem', minHeight: '250px', resize: 'vertical', whiteSpace: 'pre-wrap' }}
                                />
                            </Form.Group>
                            <div className="d-grid mt-2">
                                <Button 
                                    variant="primary" 
                                    size="lg" 
                                    onClick={handleAnalyze}
                                    disabled={loading}
                                    className="py-3 fw-bold shadow-sm"
                                >
                                    {loading ? (
                                        <>
                                            <Spinner animation="border" size="sm" className="me-2" />
                                            Analyzing with Legal Engine...
                                        </>
                                    ) : (
                                        <>Analyze Document <span className="ms-1 small opacity-75">→</span></>
                                    )}
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Results Section - Now Below */}
                <Col xs={12}>
                    {!results && !loading ? (
                        <div className="py-5"></div> /* Empty space when no results */
                    ) : loading ? (
                        <Card className="border-0 shadow-sm d-flex align-items-center justify-content-center py-5">
                            <Spinner animation="grow" variant="primary" />
                            <p className="mt-3 text-muted fw-bold">Scanning Legal Databases...</p>
                        </Card>
                    ) : (
                        <div className="d-flex flex-column gap-4">
                            <Row className="g-4">
                                <Col lg={8}>
                                    {/* Executive Summary */}
                                    {results.summary && (
                                        <Card className="shadow-sm border-0 border-start border-4 border-primary h-100">
                                            <Card.Header className="py-3 border-bottom-0">
                                                <h5 className="mb-0 text-primary d-flex align-items-center fw-bold">
                                                    <FaInfoCircle className="me-2 text-primary" /> Case Summary
                                                </h5>
                                            </Card.Header>
                                            <Card.Body>
                                                <div className="bg-body-secondary p-4 rounded" style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                                                    {results.summary.split(/(\*\*.*?\*\*)/).map((part, i) => 
                                                        part.startsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : part
                                                    )}
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    )}
                                </Col>
                                <Col lg={4}>
                                    {/* Consistency Score */}
                                    <Card className="shadow-sm border-0 overflow-hidden h-100">
                                        <Card.Header className="border-bottom-0 pt-3">
                                            <h6 className="text-muted small fw-bold text-uppercase mb-0 text-center">Legal Consistency</h6>
                                        </Card.Header>
                                        <Card.Body className="text-center d-flex flex-column justify-content-center py-4">
                                            <h2 className={`display-3 fw-bold text-${getScoreVariant(results.score)} mb-2`}>
                                                {results.score}%
                                            </h2>
                                            <div className="px-4">
                                                <ProgressBar 
                                                    now={results.score} 
                                                    variant={getScoreVariant(results.score)} 
                                                    className="mt-3" 
                                                    style={{ height: '12px' }}
                                                />
                                            </div>
                                            <p className="text-muted small mt-4 px-3">
                                                Alignment rating between narrative and legal sections.
                                            </p>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>

                            <Row className="g-4">
                                <Col lg={6}>
                                    {/* Analysis Insights */}
                                    <Card className="shadow-sm border-0 h-100">
                                        <Card.Header className="py-3 border-bottom">
                                            <h5 className="mb-0 fw-bold"><FaExclamationTriangle className="me-2 text-warning" /> Critical Insights</h5>
                                        </Card.Header>
                                        <ListGroup variant="flush">
                                            {results.insights.length > 0 ? (
                                                results.insights.map((insight, idx) => (
                                                    <ListGroup.Item key={idx} className="py-3 px-4 bg-transparent border-light">
                                                        <div className="d-flex align-items-start">
                                                            {getInsightIcon(insight.type)}
                                                            <div className="ms-2">
                                                                <div className="fw-bold d-flex align-items-center">
                                                                    {insight.title}
                                                                    <Badge bg={insight.type} className="ms-2" style={{ fontSize: '0.65rem' }}>
                                                                        {insight.type.toUpperCase()}
                                                                    </Badge>
                                                                </div>
                                                                <div className="text-muted small mt-1">
                                                                    {insight.description}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </ListGroup.Item>
                                                ))
                                            ) : (
                                                <ListGroup.Item className="text-center py-5 text-muted h4 opacity-50">
                                                    No anomalies detected.
                                                </ListGroup.Item>
                                            )}
                                        </ListGroup>
                                    </Card>
                                </Col>
                                <Col lg={6}>
                                    {/* Suggested Sections */}
                                    <Card className="shadow-sm border-0 h-100">
                                        <Card.Header className="py-3 border-bottom">
                                            <h5 className="mb-0 text-primary fw-bold"><FaMagic className="me-2" /> Suggested Legal Framework</h5>
                                        </Card.Header>
                                        <Card.Body className="p-0">
                                            <ListGroup variant="flush">
                                                {results.suggestedSections.map((s, idx) => (
                                                    <ListGroup.Item key={idx} className="py-3 px-4 border-light hover-bg-light transition-all">
                                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                                            <span className="fw-bold fs-5">{s.law} Section {s.section}</span>
                                                            <Badge bg="primary" pill className="px-3">{Math.round(s.score * 100)}% Match</Badge>
                                                        </div>
                                                        <div className="text-muted mt-2" style={{ fontSize: '0.85rem' }}>
                                                            {s.title || (s.description?.substring(0, 150) + '...')}
                                                        </div>
                                                    </ListGroup.Item>
                                                ))}
                                            </ListGroup>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </div>
                    )}
                    {error && <Alert variant="danger" className="mt-4 shadow-sm border-0">{error}</Alert>}
                </Col>
            </Row>

            <style>{`
                .border-dashed {
                    border: 2px dashed var(--bs-border-color);
                }
                .text-truncate-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;  
                    overflow: hidden;
                }
                .font-monospace {
                    font-family: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
                }
            `}</style>
        </Container>
    );
};

export default DocumentAnalysis;
