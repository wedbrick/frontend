import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, ListGroup, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';

const VendorPackages = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [packageName, setPackageName] = useState('');
  const [discount, setDiscount] = useState('');
  const [packages, setPackages] = useState([]);

  // Fetch both services and packages
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [servicesResponse, packagesResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/services/vendor`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/packages`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (servicesResponse.data.success) {
          // Group services by category
          const groupedServices = servicesResponse.data.data.reduce((acc, service) => {
            const category = service.category.charAt(0).toUpperCase() + service.category.slice(1);
            if (!acc[category]) {
              acc[category] = [];
            }
            acc[category].push(service);
            return acc;
          }, {});

          setServices(Object.entries(groupedServices).map(([category, services]) => ({
            category,
            services
          })));
        }

        if (packagesResponse.data.success) {
          setPackages(packagesResponse.data.data);
        }
      } catch (err) {
        setError('Failed to fetch data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddService = (service) => {
    setSelectedServices([...selectedServices, service]);
  };

  const calculateTotalPrice = () => {
    return selectedServices.reduce((total, service) => total + service.price, 0);
  };

  const handleDiscountChange = (e) => {
    const value = e.target.value;
    // Only update if the value is empty or a valid number
    if (value === '' || (!isNaN(value) && Number(value) >= 0)) {
      setDiscount(value);
    }
  };

  const calculateDiscountedPrice = () => {
    const total = calculateTotalPrice();
    // Convert empty string to 0 for calculation
    const discountValue = discount === '' ? 0 : Number(discount);
    return total - (total * (discountValue / 100));
  };

  const handleCreatePackage = async () => {
    if (!packageName || selectedServices.length === 0) return;

    try {
      const token = localStorage.getItem('token');
      const payload = {
        name: packageName,
        services: selectedServices.map(service => ({
          serviceId: service._id,
          name: service.name,
          description: service.description,
          category: service.category,
          price: service.price,
          location: service.location,
          imageUrl: service.imageUrl
        })),
        originalPrice: calculateTotalPrice(),
        discountedPrice: calculateDiscountedPrice(),
        discount: discount === '' ? 0 : Number(discount),
        vendor: JSON.parse(localStorage.getItem('vendor'))._id
      };

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/packages`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setPackages([...packages, response.data.data]);
        setSelectedServices([]);
        setPackageName('');
        setDiscount('');
      }
    } catch (err) {
      console.error('Error creating package:', err);
      // Handle error appropriately
    }
  };

  const handleDeletePackage = async (packageId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${import.meta.env.VITE_API_URL}/api/packages/${packageId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        // Remove the deleted package from state
        setPackages(packages.filter(pkg => pkg._id !== packageId));
      }
    } catch (err) {
      console.error('Error deleting package:', err);
      // You might want to show an error message to the user
      setError('Failed to delete package');
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4" style={{ color: '#6f42c1', fontSize: '1.75rem' }}>Package Builder</h2>
      
      <Row>
        <Col md={6}>
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <h3 className="mb-3" style={{ fontSize: '1.25rem', color: '#495057' }}>Available Services</h3>
              {services.map(({ category, services }) => (
                <div key={category} className="mb-4">
                  <h4 style={{ 
                    fontSize: '1.1rem', 
                    color: '#6f42c1', 
                    borderBottom: '2px solid #e9ecef',
                    paddingBottom: '0.5rem',
                    marginBottom: '1rem'
                  }}>
                    {category}
                  </h4>
                  {services.map((service) => (
                    <div 
                      key={service._id} 
                      className="d-flex justify-content-between align-items-center mb-2 p-2"
                      style={{ 
                        backgroundColor: '#f8f9fa',
                        borderRadius: '6px'
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '0.95rem' }}>{service.name}</span>
                        <br />
                        <small className="text-muted" style={{ fontSize: '0.85rem' }}>
                          {service.location}
                        </small>
                      </div>
                      <div className="d-flex align-items-center">
                        <span className="me-3" style={{ fontSize: '0.95rem', color: '#495057' }}>
                          PKR {service.price}
                        </span>
                        <Button 
                          variant="outline-primary"
                          size="sm"
                          className="rounded-circle"
                          style={{ width: '28px', height: '28px', padding: '0' }}
                          onClick={() => handleAddService(service)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <h3 className="mb-3" style={{ fontSize: '1.25rem', color: '#495057' }}>Selected Services</h3>
              {selectedServices.length === 0 ? (
                <p className="text-muted" style={{ fontSize: '0.95rem' }}>No services selected</p>
              ) : (
                <ListGroup variant="flush">
                  {selectedServices.map((service) => (
                    <ListGroup.Item key={service._id} className="px-0">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <span style={{ fontSize: '0.95rem' }}>{service.name}</span>
                          <br />
                          <small className="text-muted" style={{ fontSize: '0.85rem' }}>
                            {service.location}
                          </small>
                        </div>
                        <span style={{ fontSize: '0.95rem', color: '#495057' }}>
                          PKR {service.price}
                        </span>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}

              <Form className="mt-4">
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontSize: '0.9rem', color: '#495057' }}>
                    Package Name
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter package name"
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value)}
                    size="sm"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label style={{ fontSize: '0.9rem', color: '#495057' }}>
                    Discount (%)
                  </Form.Label>
                  <Form.Control
                    type="number"
                    value={discount}
                    onChange={handleDiscountChange}
                    size="sm"
                    placeholder="Enter discount"
                  />
                </Form.Group>

                <div className="mb-3 p-2" style={{ backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.95rem' }}>
                    Total Price: <span className="fw-bold">${calculateTotalPrice().toFixed(2)}</span>
                  </div>
                  <div style={{ fontSize: '0.95rem', color: '#28a745' }}>
                    Discounted Price: <span className="fw-bold">${calculateDiscountedPrice().toFixed(2)}</span>
                  </div>
                </div>

                <Button 
                  variant="primary" 
                  onClick={handleCreatePackage}
                  className="w-100"
                  size="sm"
                  style={{ 
                    backgroundColor: '#6f42c1', 
                    border: 'none',
                    transition: 'background-color 0.3s ease',
                    ':hover': {
                      backgroundColor: '#5a32a3'
                    }
                  }}
                >
                  Create Package
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <div className="mt-4">
        <h3 className="mb-3" style={{ fontSize: '1.25rem', color: '#495057' }}>Your Packages</h3>
        {packages.map((pkg) => (
          <Card key={pkg._id} className="mb-3 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h4 style={{ fontSize: '1.1rem', color: '#6f42c1' }}>{pkg.name}</h4>
                  {pkg.discount > 0 && (
                    <p className="mb-1" style={{ fontSize: '0.95rem' }}>
                      Original Price: <span style={{ textDecoration: 'line-through' }}>${pkg.originalPrice}</span>
                    </p>
                  )}
                  <p className="mb-1" style={{ fontSize: '0.95rem' }}>
                   Discounted Price: <span className="fw-bold">${pkg.discountedPrice}</span>
                    {pkg.discount > 0 && <span className="ms-2 text-success">({pkg.discount}% off)</span>}
                  </p>
                  <p className="text-muted mb-2" style={{ fontSize: '0.85rem' }}>
                    Created: {new Date(pkg.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Button 
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleDeletePackage(pkg._id)}
                >
                  Delete
                </Button>
              </div>

              <h5 className="mt-3 mb-2" style={{ fontSize: '1rem', color: '#495057' }}>
                Included Services:
              </h5>
              <Row>
                {pkg.services.map((service) => (
                  <Col md={6} key={service.serviceId}>
                    <Card className="bg-light mb-2">
                      <Card.Body className="p-2">
                        <div className="d-flex align-items-center mb-2">
                          {service.imageUrl && (
                            <img 
                              src={`${import.meta.env.VITE_API_URL}${service.imageUrl}`}
                              alt={service.name}
                              style={{ 
                                width: '50px', 
                                height: '50px', 
                                objectFit: 'cover',
                                borderRadius: '4px',
                                marginRight: '10px'
                              }}
                            />
                          )}
                          <div>
                            <h6 style={{ fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                              {service.name}
                            </h6>
                            <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
                              {service.category.charAt(0).toUpperCase() + service.category.slice(1)}
                            </p>
                          </div>
                        </div>
                        <p className="mb-1" style={{ fontSize: '0.85rem' }}>Price: ${service.price}</p>
                        <p className="mb-1" style={{ fontSize: '0.85rem' }}>
                          Location: {service.location}
                        </p>
                        <p className="mb-0" style={{ fontSize: '0.85rem' }}>
                          {service.description}
                        </p>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        ))}
      </div>
    </Container>
  );
};

export default VendorPackages; 