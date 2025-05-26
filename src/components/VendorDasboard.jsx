import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert, Modal } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FiCalendar, FiDollarSign, FiUsers, FiPackage, FiLogOut } from 'react-icons/fi';
import axios from 'axios';
import { Carousel } from 'react-bootstrap';

const VendorDashboard = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteServiceId, setDeleteServiceId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const revenueData = [
    { name: 'Jan', revenue: 4000 },
    { name: 'Feb', revenue: 3000 },
    { name: 'Mar', revenue: 2000 },
    { name: 'Apr', revenue: 2780 },
    { name: 'May', revenue: 1890 },
    { name: 'Jun', revenue: 2390 },
  ];

  // Authentication check and data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const vendor = JSON.parse(localStorage.getItem('vendor'));

        if (!token || !vendor) {
          navigate('/vendor-login');
          return;
        }

        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const servicesResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/services/vendor`);
        setServices(Array.isArray(servicesResponse.data.data) ? servicesResponse.data.data : []);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('vendor');
          navigate('/vendor-login');
        } else {
          setError(err.response?.data?.message || 'Failed to load data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('vendor');
    delete axios.defaults.headers.common['Authorization'];
    navigate('/signout');
  };

  const handleDeleteClick = (serviceId) => {
    setDeleteServiceId(serviceId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/services/${deleteServiceId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMessage('Service deleted successfully!');
      setServices(services.filter(service => service._id !== deleteServiceId));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete service');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setDeleteServiceId(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteServiceId(null);
  };

  const DeleteConfirmationModal = () => (
    <Modal show={showDeleteModal} onHide={handleCancelDelete} centered>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Delete</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure you want to delete this service? This action cannot be undone.
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCancelDelete} disabled={isDeleting}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleConfirmDelete} disabled={isDeleting}>
          {isDeleting ? 'Deleting...' : 'Confirm Delete'}
        </Button>
      </Modal.Footer>
    </Modal>
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed': return <Badge bg="success">Confirmed</Badge>;
      case 'Pending': return <Badge bg="warning">Pending</Badge>;
      case 'Completed': return <Badge bg="info">Completed</Badge>;
      default: return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          Error loading dashboard: {error}
          <div className="mt-2">
            <Button variant="primary" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <>
      <Container fluid className="p-4 mt-3">
        <h1 className="mb-4 text-center" style={{ color: '#6f42c1' }}>
          Vendor Dashboard
        </h1>

        {successMessage && (
          <Alert variant="success" onClose={() => setSuccessMessage('')} dismissible>
            {successMessage}
          </Alert>
        )}

        {/* Services Section */}
        <section id="services" className="mb-5">
          <Row className="mb-4">
            <Col>
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <Card.Title>Your Services</Card.Title>
                    <Button
                      variant="purple"
                      size="md"
                      onClick={() => navigate('/add-service')}
                      style={{ backgroundColor: '#7851a9', borderColor: '#7851a9', color: '#fff' }}
                    >
                      Add Service
                    </Button>
                  </div>
                  {loading ? (
                    <div className="text-center my-5">
                      <Spinner animation="border" variant="primary" />
                    </div>
                  ) : error ? (
                    <Alert variant="danger">{error}</Alert>
                  ) : (
                    <>
                      {!services || services.length === 0 ? (
                        <Alert variant="info">
                          You haven't added any services yet. Click "Add Service" to get started.
                        </Alert>
                      ) : (
                        <Row>
                          {Array.isArray(services) ? (
                            services.map((service) => (
                              <Col md={4} key={service._id} className="mb-3">
                                <Card className="shadow-sm h-100">
                                  {service.images && service.images.length > 0 && (
                                    <div style={{ height: '200px', overflow: 'hidden' }}>
                                      <Carousel
                                        indicators={service.images.length > 1}
                                        controls={service.images.length > 1}
                                        interval={1000}
                                      >
                                        {service.images.map((img, index) => (
                                          <Carousel.Item key={index}>
                                            <Card.Img
                                              variant="top"
                                              src={`${import.meta.env.VITE_API_URL}${img.url}`}
                                              style={{
                                                height: '200px',
                                                objectFit: 'cover',
                                                width: '100%'
                                              }}
                                              alt={`${service.name} - ${index + 1}`}
                                            />
                                          </Carousel.Item>
                                        ))}
                                      </Carousel>
                                    </div>
                                  )}
                                  <Card.Body>
                                    <div className="d-flex justify-content-between">
                                      <h5>{service.name}</h5>
                                      <span className="text-purple" style={{ color: '#7851a9' }}>
                                        ${service.price}
                                      </span>
                                    </div>
                                    <p className="text-muted mb-0">{service.description}</p>
                                    <div className="mt-2">
                                      <small className="text-muted">
                                        Category: {service.category} | Location: {service.location}
                                      </small>
                                    </div>
                                    <div className="d-flex justify-content-end mt-3">
                                      <Button
                                        variant="danger"
                                        onClick={() => handleDeleteClick(service._id)}
                                        disabled={isDeleting}
                                        style={{ borderRadius: '20px', width: '100px' }}
                                      >
                                        Delete
                                      </Button>
                                    </div>
                                  </Card.Body>
                                </Card>
                              </Col>
                            ))
                          ) : (
                            <Alert variant="warning">
                              Error loading services. Please refresh the page.
                            </Alert>
                          )}
                        </Row>
                      )}
                    </>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </section>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal />

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col md={3}>
            <Card className="shadow-sm border-0">
              <Card.Body>
                <Card.Title className="text-muted small">Total Revenue</Card.Title>
                <div className="d-flex justify-content-between align-items-center">
                  <h3>$12,450</h3>
                  <FiDollarSign size={24} className="text-purple" style={{ color: '#7851a9' }} />
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="shadow-sm border-0">
              <Card.Body>
                <Card.Title className="text-muted small">Upcoming Bookings</Card.Title>
                <div className="d-flex justify-content-between align-items-center">
                  <h3>8</h3>
                  <FiCalendar size={24} style={{ color: '#7851a9' }} />
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="shadow-sm border-0">
              <Card.Body>
                <Card.Title className="text-muted small">Total Services</Card.Title>
                <div className="d-flex justify-content-between align-items-center">
                  <h3>{services.length}</h3>
                  <FiPackage size={24} style={{ color: '#7851a9' }} />
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="shadow-sm border-0">
              <Card.Body>
                <Card.Title className="text-muted small">New Clients</Card.Title>
                <div className="d-flex justify-content-between align-items-center">
                  <h3>5</h3>
                  <FiUsers size={24} style={{ color: '#7851a9' }} />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Revenue Chart */}
        <section id="revenue">
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body>
              <Card.Title>Revenue Overview</Card.Title>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="revenue" fill="#7851a9" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </section>
      </Container>

      <style jsx>{`
        .carousel-indicators [data-bs-target] {
          background-color: rgba(120, 81, 169, 0.5);
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin: 0 4px;
        }

        .carousel-indicators .active {
          background-color: #7851a9 !important;
        }

        .carousel-control-prev-icon,
        .carousel-control-next-icon {
          background-color: rgba(120, 81, 169, 0.7);
          border-radius: 50%;
          padding: 10px;
          background-size: 60%;
        }

        .carousel-control-prev,
        .carousel-control-next {
          width: 5%;
        }
      `}</style>
    </>
  );
};

export default VendorDashboard;