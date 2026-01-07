import { useState, useEffect } from 'react';
import { Form, Button, Card, Spinner, Alert, Row, Col, Container } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { FaSearch, FaSave, FaRobot } from 'react-icons/fa';
import API_URL from '../config';

const ChatAssistant = () => {
    const [query, setQuery] = useState('')
    const [law, setLaw] = useState('ipc')
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [searched, setSearched] = useState(false)
    const [error, setError] = useState(null)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const qParam = searchParams.get('q');
        const lawParam = searchParams.get('law');
        
        if (qParam) {
            setQuery(qParam);
            if (lawParam) setLaw(lawParam);
            // Trigger search with fresh params
            const performInitialSearch = async () => {
                setLoading(true);
                setSearched(true);
                setResults([]);
                setError(null);
                try {
                    const response = await fetch(`${API_URL}/search?law=${lawParam || law}&q=${encodeURIComponent(qParam)}`);
                    const data = await response.json();
                    if (data.results) {
                        setResults(data.results);
                    } else {
                        setError(data.error || "An unexpected error occurred.");
                    }
                } catch (error) {
                    console.error("Initial search failed:", error);
                    setError("Failed to connect to the server.");
                } finally {
                    setLoading(false);
                }
            };
            performInitialSearch();
        }
    }, [searchParams]);

    const handleSearch = async (e) => {
        e.preventDefault()
        if (!query) return

        setLoading(true)
        setSearched(true)
        setResults([])
        setError(null)
        setSaved(false)

        try {
            const response = await fetch(`${API_URL}/search?law=${law}&q=${encodeURIComponent(query)}`)
            const data = await response.json()
            if (data.results) {
                setResults(data.results)
            } else {
                setError(data.error || "An unexpected error occurred.")
            }
        } catch (error) {
            console.error("Search failed:", error)
            setError("Failed to connect to the server.")
        } finally {
            setLoading(false)
        }
    }

    const handleSaveQuery = async () => {
        if (!query || saving) return;

        setSaving(true);
        setSaveMessage(null);
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await fetch(`${API_URL}/api/queries`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    query,
                    law,
                    title: query.substring(0, 40)
                })
            });

            if (response.ok) {
                setSaved(true);
                // Search query is now persistent
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to save query');
            }
        } catch (err) {
            console.error('Save query error:', err);
            setError('Failed to save query');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Container className="py-4">
            <h2 className="mb-4">Chat Assistant</h2>
            <Card className="shadow-sm mb-4 border-0">
                <Card.Body>
                    <Form onSubmit={handleSearch}>
                        <Row className="align-items-center">
                            <Col md={3} className="mb-3 mb-md-0">
                                <Form.Group controlId="lawSelect">
                                    <Form.Select
                                        value={law}
                                        onChange={(e) => setLaw(e.target.value)}
                                        className="py-2"
                                    >
                                        <option value="ipc">IPC</option>
                                        <option value="mv_act">MVA</option>
                                        <option value="cpc">CPC</option>
                                        <option value="crpc">CrPC</option>
                                        <option value="iea">IEA</option>
                                        <option value="hma">HMA</option>
                                        <option value="ida">IDA</option>
                                        <option value="nia">NIA</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6} className="mb-3 mb-md-0">
                                <Form.Control
                                    type="text"
                                    placeholder="Describe your legal issue..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="py-2"
                                />
                            </Col>
                            <Col md={3} className="d-flex gap-2">
                                <Button variant="primary" type="submit" className="flex-grow-1 py-2" disabled={loading}>
                                    {loading ? <Spinner as="span" animation="border" size="sm" /> : <><FaSearch className="me-2" /> Ask</>}
                                </Button>
                                {searched && (
                                    <Button 
                                        variant={saved ? "success" : "outline-success"} 
                                        className="py-2 d-flex align-items-center" 
                                        onClick={handleSaveQuery}
                                        disabled={saving || saved}
                                        title={saved ? "Search saved" : "Save this search"}
                                    >
                                        {saving ? <Spinner as="span" animation="border" size="sm" /> : (saved ? <FaCheckCircle /> : <FaSave />)}
                                        {saved && <span className="ms-2">Saved</span>}
                                    </Button>
                                )}
                            </Col>
                        </Row>
                    </Form>
                </Card.Body>
            </Card>


            {loading && (
                    <div className="d-flex justify-content-center my-4">
                        <Spinner animation="border" role="status" variant="primary">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    </div>
            )}

            {error && <Alert variant="danger">{error}</Alert>}

            {searched && !loading && !error && (
                <div className="d-grid gap-3">
                    {results.length > 0 ? (
                        results.map((result, index) => (
                            <Card key={index} className="shadow-sm border-0 border-start border-4 border-primary">
                                <Card.Body>
                                    <Card.Title className="h5 mb-2">
                                        Section {result.section || 'N/A'}: {result.title}
                                    </Card.Title>
                                    <Card.Subtitle className="mb-3 text-muted small">
                                        Relevance Score: {(result.score * 100).toFixed(1)}%
                                    </Card.Subtitle>
                                    <Card.Text style={{ whiteSpace: 'pre-wrap' }}>
                                        {result.description}
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        ))
                    ) : (
                        <p className="text-center text-muted">No relevant sections found.</p>
                    )}
                </div>
            )}
        </Container>
    );
};

export default ChatAssistant;
