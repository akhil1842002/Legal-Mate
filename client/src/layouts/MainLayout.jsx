import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Offcanvas, Button, Badge, Dropdown } from 'react-bootstrap';
import { FaBars, FaHome, FaRobot, FaSearch, FaFileAlt, FaPen, FaHistory, FaSignOutAlt, FaChevronLeft, FaChevronRight, FaUserCircle, FaUser, FaCog, FaFolder } from 'react-icons/fa';

const MainLayout = ({ user, onLogout, theme, setTheme }) => {
    const [showSidebar, setShowSidebar] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();

    const handleClose = () => setShowSidebar(false);
    const handleShow = () => setShowSidebar(true);
    const toggleCollapse = () => setCollapsed(!collapsed);

    const handleLogout = () => {
        onLogout();
        navigate('/');
    }

    const navItems = [
        { path: '/', name: 'Dashboard', icon: <FaHome />, roles: ['admin', 'police', 'public'] },
        { path: '/chat', name: 'Chat Assistant', icon: <FaRobot />, roles: ['admin', 'police', 'public'] },
        { path: '/analysis', name: 'Document Analysis', icon: <FaSearch />, roles: ['admin', 'police', 'public'] },
        { path: '/generator', name: 'Document Generator', icon: <FaFileAlt />, roles: ['admin', 'police'] },
        { path: '/fir-history', name: 'FIR History', icon: <FaFolder />, roles: ['admin', 'police'] },
        { path: '/saved-queries', name: 'Saved Searches', icon: <FaHistory />, roles: ['admin', 'police', 'public'] },
        { path: '/admin', name: 'Admin Panel', icon: <FaCog />, adminOnly: true },
    ];

    const filteredNavItems = navItems.filter(item => 
        (item.adminOnly ? user.isAdmin : (!item.roles || item.roles.includes(user.role.toLowerCase())))
    );

    const SidebarContent = ({ isCompact, onToggle }) => (
        <div className="d-flex flex-column h-100">
            <div className={`p-3 mb-2 d-flex align-items-center ${isCompact ? 'justify-content-center' : 'justify-content-between'}`}>
                {!isCompact && <span className="fs-4 fw-bold text-primary text-truncate">Legal Mate</span>}
                {isCompact && <span className="fs-4 fw-bold text-primary">LM</span>}
                
                {onToggle && (
                    <Button variant="link" size="sm" className="text-muted p-0 d-none d-md-block" onClick={onToggle}>
                        {isCompact ? <FaChevronRight /> : <FaChevronLeft />}
                    </Button>
                )}
            </div>
            
            <Nav className="flex-column flex-grow-1 px-2">
                {filteredNavItems.map((item) => (
                    <NavLink 
                        key={item.path} 
                        to={item.path} 
                        className={({ isActive }) => 
                            `nav-link d-flex align-items-center mb-2 rounded ${isActive ? 'bg-primary text-white' : 'text-body hover-bg-body-secondary'} ${isCompact ? 'justify-content-center px-1 py-3' : 'px-3 py-2'}`
                        }
                        onClick={handleClose}
                        title={isCompact ? item.name : ''}
                        style={{ transition: 'all 0.2s' }}
                    >
                        <span className={`${isCompact ? '' : 'me-3'} fs-5`}>{item.icon}</span>
                        {!isCompact && <span className="text-truncate">{item.name}</span>}
                    </NavLink>
                ))}
            </Nav>

            {/* Sidebar Footer removed as profile is now in Navbar */}
        </div>
    );

    return (
        <div className="d-flex vh-100 overflow-hidden">
            {/* Desktop Sidebar */}
            <div 
                className="d-none d-md-block bg-body shadow-sm border-end" 
                style={{ 
                    width: collapsed ? '80px' : '280px', 
                    minWidth: collapsed ? '80px' : '280px', 
                    transition: 'width 0.3s ease-in-out' 
                }}
            >
                <SidebarContent isCompact={collapsed} onToggle={toggleCollapse} />
            </div>

            {/* Mobile Sidebar (Offcanvas) */}
            <Offcanvas show={showSidebar} onHide={handleClose}>
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title className="fw-bold text-primary">Legal Mate</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="p-0">
                    <SidebarContent isCompact={false} />
                </Offcanvas.Body>
            </Offcanvas>

            {/* Main Content Area */}
            <div className="flex-grow-1 d-flex flex-column h-100 overflow-auto bg-body-tertiary">
                {/* Top Navbar */}
                <Navbar bg="body" className="shadow-sm px-3 sticky-top">
                    <Container fluid>
                        <div className="d-flex align-items-center w-100">
                            <Button variant="link" className="p-0 me-3 text-body d-md-none" onClick={handleShow}>
                                <FaBars size={24} />
                            </Button>
                            
                            <Dropdown className="ms-auto" align="end">
                                <Dropdown.Toggle variant="link" id="dropdown-profile" className="text-body p-0 border-0 d-flex align-items-center text-decoration-none">
                                    <div className="d-none d-md-block text-end me-2">
                                        <div className="fw-bold small">{user.name}</div>
                                        <div className="text-muted small" style={{fontSize: '10px'}}>{user.isAdmin ? 'ADMIN' : user.role.toUpperCase()}</div>
                                    </div>
                                    <FaUserCircle size={32} className="text-primary"/>
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    <Dropdown.Header className="d-md-none">Signed in as <strong>{user.name}</strong></Dropdown.Header>
                                    <Dropdown.Item as={NavLink} to="/profile"><FaUser className="me-2"/> My Profile</Dropdown.Item>
                                    <Dropdown.Item as={NavLink} to="/settings"><FaCog className="me-2"/> Settings</Dropdown.Item>
                                    <Dropdown.Divider />
                                    <Dropdown.Item onClick={handleLogout} className="text-danger"><FaSignOutAlt className="me-2"/> Logout</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    </Container>
                </Navbar>

                {/* Page Content */}
                <main className="flex-grow-1">
                    <Outlet context={{ theme, setTheme }} />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
