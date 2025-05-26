import React from 'react';
import { Container, Navbar, Nav, Dropdown } from 'react-bootstrap';
import { FiUser, FiLogOut, FiCalendar, FiHome, FiInbox, FiPackage, FiBell } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import NotificationsDropdown from './NotificationsDropdown';
import { useNotification } from '../store/NotificationContext';

const VendorNavbar = () => {
  const navigate = useNavigate();
  const { unreadCount } = useNotification();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/signout', { state: { fromVendor: true } });
  };

  return (
    <Navbar bg="light-purple" expand="lg" style={{ backgroundColor: '#e2d4f0' }}>
      <Container>
        <Navbar.Brand className="d-flex align-items-center">
          <img
            src={logo}
            height="60"
            className="d-inline-block align-top me-2"
            alt="WedBricks Logo"
          />
          <span className="fw-bold" style={{ color: '#6f42c1', fontSize: '1.5rem', fontFamily: 'cursive' }}>
            WedBricks
          </span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link onClick={() => navigate('/vendor-dashboard')}>
              <FiHome className='me-1' /> Dashboard
            </Nav.Link>
            <Nav.Link onClick={() => navigate('/vendor-packages')}>
              <FiPackage className="me-1" /> Packages
            </Nav.Link>
            <Nav.Link onClick={() => navigate('/vendor-bookings')}>
              <FiCalendar className="me-1" /> Bookings
            </Nav.Link>
            <Nav.Link onClick={() => navigate('/vendor-chats')}>
              <FiInbox className='me-1' /> Messages
            </Nav.Link>

            <Dropdown align="end">
              <Dropdown.Toggle 
                as={Nav.Link} 
                className="position-relative mx-2"
                style={{ textDecoration: 'none', border: 'none' }}
              >
                <FiBell className="me-1" />
                Notifications
                {unreadCount > 0 && (
                  <span
                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                    style={{
                      fontSize: '0.6rem',
                      padding: '4px 6px',
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </Dropdown.Toggle>
              <Dropdown.Menu
                style={{
                  backgroundColor: '#fff',
                  marginTop: '10px',
                  maxHeight: '400px',
                  overflowY: 'auto'
                }}
              >
                <NotificationsDropdown />
              </Dropdown.Menu>
            </Dropdown>

            <Dropdown align="end">
              <Dropdown.Toggle 
                variant="link" 
                id="profile-dropdown"
                style={{ 
                  color: '#6f42c1', 
                  textDecoration: 'none',
                  border: 'none'
                }}
              >
                <FiUser size={20} />
              </Dropdown.Toggle>

              <Dropdown.Menu style={{ backgroundColor: '#fff', marginTop: '10px' }}>
                <Dropdown.Item 
                  onClick={() => navigate('/vendor-profile-editable')}
                  style={{ color: '#6f42c1' }}
                >
                  Profile
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item 
                  onClick={handleLogout}
                  style={{ color: '#6f42c1' }}
                >
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default VendorNavbar;
