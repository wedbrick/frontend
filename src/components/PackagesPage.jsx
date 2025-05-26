import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Row, Col, Card, Dropdown, Spinner, Alert, Modal, Carousel } from 'react-bootstrap';
import { FiSearch, FiCameraOff } from 'react-icons/fi';
import axios from 'axios';

const PackagesPage = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState('All Prices');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  // const baseURL = 'http://localhost:5000';

  const priceRanges = [
    { label: 'All Prices', min: 0, max: Infinity },
    { label: 'Under $100', min: 0, max: 99 },
    { label: '$100 - $500', min: 100, max: 500 },
    { label: '$500 - $1000', min: 501, max: 1000 },
    { label: 'Over $1000', min: 1001, max: Infinity }
  ];

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/packages`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        console.log('Packages API Response:', JSON.stringify(response.data.data, null, 2)); // Debug: Log API response

        // Fetch service images for services missing imageUrl or images
        const packagesWithImages = await Promise.all(
          response.data.data.map(async (pkg) => {
            if (!pkg.packageImages?.length && pkg.services.some(service => !service.imageUrl && !service.images?.length)) {
              const servicesWithImages = await Promise.all(
                pkg.services.map(async (service) => {
                  if (!service.imageUrl && !service.images?.length) {
                    try {
                      const serviceResponse = await axios.get(
                        `${import.meta.env.VITE_API_URL}/api/services/${service.serviceId}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                      );
                      console.log(`Fetched service ${service.serviceId}:`, serviceResponse.data.data); // Debug: Log service data
                      return { ...service, images: serviceResponse.data.data.images || [], imageUrl: serviceResponse.data.data.imageUrl };
                    } catch (err) {
                      console.error(`Failed to fetch service ${service.serviceId}:`, err);
                      return service;
                    }
                  }
                  return service;
                })
              );
              return { ...pkg, services: servicesWithImages };
            }
            return pkg;
          })
        );

        setPackages(packagesWithImages);
      } else {
        setError('No packages found');
      }
    } catch (err) {
      setError('Failed to fetch packages: ' + (err.response?.data?.message || err.message));
      console.error('Error fetching packages:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase());
    const selectedRange = priceRanges.find(range => range.label === priceFilter);
    const matchesPrice = pkg.discountedPrice >= selectedRange.min && pkg.discountedPrice <= selectedRange.max;
    return matchesSearch && matchesPrice;
  });

  const handleBookPackage = async (pkg) => {
    setSelectedPackage(pkg);
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async () => {
    try {
      setIsBooking(true);
      const token = localStorage.getItem('token');
      
      const defaultBookingDate = new Date();
      defaultBookingDate.setDate(defaultBookingDate.getDate() + 7);
      defaultBookingDate.setHours(10, 0, 0, 0);

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/bookings`, {
        packageId: selectedPackage._id,
        bookingDate: defaultBookingDate.toISOString(),
        notes: `Booking for package: ${selectedPackage.name}`
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setBookingSuccess(true);
        setBookingMessage(`Successfully booked package: ${selectedPackage.name}`);

        setTimeout(() => {
          setShowBookingModal(false);
          setSelectedPackage(null);
          setBookingSuccess(false);
          setBookingMessage('');
        }, 2000);
      }
    } catch (err) {
      console.error('Booking error:', err);
      if (err.response?.data?.booking) {
        const existingBooking = err.response.data.booking;
        const bookingDate = new Date(existingBooking.bookingDate).toLocaleDateString();
        setBookingMessage(
          `You already have a booking for this package (Status: ${existingBooking.status}) scheduled for ${bookingDate}. 
          Please check your bookings page for details.`
        );
      } else {
        setBookingMessage(err.response?.data?.message || 'Failed to book package. Please try again.');
      }
      setBookingSuccess(false);
    } finally {
      setIsBooking(false);
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
      <h2 className="mb-4" style={{ color: '#6f42c1' }}>Wedding Packages</h2>

      {/* Search and Filter Section */}
      <Row className="mb-4">
        <Col md={8}>
          <Form.Control
            type="search"
            placeholder="Search packages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
        <Col md={4}>
          <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" className="w-100">
              {priceFilter}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {priceRanges.map(range => (
                <Dropdown.Item 
                  key={range.label}
                  onClick={() => setPriceFilter(range.label)}
                >
                  {range.label}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </Col>
      </Row>

      {/* Packages Grid */}
      <Row>
        {filteredPackages.map((pkg) => {
          console.log(`Package ${pkg.name} Images:`, {
            packageImages: pkg.packageImages,
            services: pkg.services?.map(s => ({ name: s.name, imageUrl: s.imageUrl, images: s.images }))
          }); // Debug: Log image data for each package

          return (
            <Col md={6} lg={4} key={pkg._id} className="mb-4">
              <Card className="h-100 shadow-sm">
                <div style={{ height: '200px', borderTopLeftRadius: '8px', borderTopRightRadius: '8px', overflow: 'hidden' }}>
                  {pkg.packageImages?.length > 0 ? (
                    <Carousel
                      interval={3000}
                      controls={pkg.packageImages.length > 1}
                      indicators={pkg.packageImages.length > 1}
                    >
                      {pkg.packageImages.map((image, index) => (
                        <Carousel.Item key={index}>
                          <div className="position-relative">
                            <img
                              src={`${baseURL}${image.url}`}
                              alt={`${pkg.name} - Image ${index + 1}`}
                              style={{
                                height: '200px',
                                width: '100%',
                                objectFit: 'cover',
                                borderTopLeftRadius: '8px',
                                borderTopRightRadius: '8px'
                              }}
                              onError={(e) => {
                                console.error(`Failed to load package image: ${baseURL}${image.url}`); // Debug: Log image error
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div
                              className="no-image-placeholder"
                              style={{ display: 'none', height: '200px', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa' }}
                            >
                              <FiCameraOff className="text-muted" size={40} />
                            </div>
                          </div>
                        </Carousel.Item>
                      ))}
                    </Carousel>
                  ) : pkg.services?.some(service => service.imageUrl || service.images?.length > 0) ? (
                    <Carousel
                      interval={3000}
                      controls={pkg.services.filter(service => service.imageUrl || service.images?.length > 0).length > 1}
                      indicators={pkg.services.filter(service => service.imageUrl || service.images?.length > 0).length > 1}
                    >
                      {pkg.services
                        .filter(service => service.imageUrl || service.images?.length > 0)
                        .flatMap(service => {
                          const images = service.images?.length > 0
                            ? service.images
                            : service.imageUrl
                              ? [{ url: service.imageUrl }]
                              : [];
                          return images.map((image, index) => (
                            <Carousel.Item key={`${service.serviceId}-${index}`}>
                              <div className="position-relative">
                                <img
                                  src={`${baseURL}${image.url}`}
                                  alt={`${service.name || 'Service'} - Image ${index + 1}`}
                                  style={{
                                    height: '200px',
                                    width: '100%',
                                    objectFit: 'cover',
                                    borderTopLeftRadius: '8px',
                                    borderTopRightRadius: '8px'
                                  }}
                                  onError={(e) => {
                                    console.error(`Failed to load service image: ${baseURL}${image.url}`); // Debug: Log image error
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                                <div
                                  className="no-image-placeholder"
                                  style={{ display: 'none', height: '200px', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa' }}
                                >
                                  <FiCameraOff className="text-muted" size={40} />
                                </div>
                                <div className="service-name-overlay">
                                  {service.name || 'Unnamed Service'}
                                </div>
                              </div>
                            </Carousel.Item>
                          ));
                        })}
                    </Carousel>
                  ) : (
                    <div className="no-image-placeholder" style={{ height: '200px', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FiCameraOff className="text-muted" size={40} />
                    </div>
                  )}
                </div>
                <Card.Body>
                  <Card.Title style={{ color: '#6f42c1' }}>{pkg.name}</Card.Title>
                  
                  <div className="mb-3">
                    {pkg.discount > 0 && (
                      <div className="text-muted text-decoration-line-through">
                        ${pkg.originalPrice}
                      </div>
                    )}
                    <div className="h5 mb-0">
                      ${pkg.discountedPrice}
                      {pkg.discount > 0 && (
                        <span className="ms-2 badge bg-success">{pkg.discount}% OFF</span>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <h6>Included Services:</h6>
                    <ul className="list-unstyled">
                      {pkg.services.map((service) => (
                        <li key={service.serviceId} className="mb-2">
                          <div className="d-flex justify-content-between">
                            <span>• {service.name}</span>
                            <small className="text-muted">${service.price}</small>
                          </div>
                          <small className="text-muted d-block">
                            Location: {service.location}
                          </small>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-3">
                    <small className="text-muted">
                      Vendor: {pkg.vendor?.businessName || 'Unknown'}
                    </small>
                    <br />
                    <small className="text-muted">
                      Contact: {pkg.vendor?.phone || 'N/A'}
                    </small>
                  </div>

                  <Button 
                    variant="outline-primary" 
                    className="w-100 mt-3"
                    onClick={() => handleBookPackage(pkg)}
                  >
                    Book Now
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          );
        })}

        {filteredPackages.length === 0 && (
          <Col xs={12}>
            <Alert variant="info">
              No packages found matching your criteria.
            </Alert>
          </Col>
        )}
      </Row>

      {/* Booking Modal */}
      <Modal show={showBookingModal} onHide={() => setShowBookingModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Package Booking</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {bookingSuccess ? (
            <Alert variant="success">{bookingMessage}</Alert>
          ) : bookingMessage && bookingMessage.includes("already have a booking") ? (
            <Alert variant="warning">
              {bookingMessage}
            </Alert>
          ) : (
            <>
              <h5>{selectedPackage?.name}</h5>
              <p>Total Price: ${selectedPackage?.discountedPrice}</p>
              <h6>Services included:</h6>
              <ul>
                {selectedPackage?.services.map(service => (
                  <li key={service.serviceId}>
                    {service.name} - ${service.price}
                    <br />
                    <small className="text-muted">Location: {service.location}</small>
                  </li>
                ))}
              </ul>
              {bookingMessage && <Alert variant="danger">{bookingMessage}</Alert>}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowBookingModal(false)}
          >
            Close
          </Button>
          {!bookingMessage?.includes("already have a booking") && (
            <Button 
              variant="primary" 
              onClick={handleConfirmBooking}
              disabled={isBooking || bookingSuccess}
            >
              {isBooking ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Booking...
                </>
              ) : (
                'Confirm Booking'
              )}
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      <style>
        {`
          .no-image-placeholder svg {
            width: 40px;
            height: 40px;
            color: #6f42c1;
          }
          .service-name-overlay {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(transparent, rgba(0,0,0,0.7));
            color: white;
            padding: 8px;
            font-size: 0.9rem;
            text-align: center;
          }
          .carousel-indicators [data-bs-target] {
            background-color: #6f42c1;
          }
          .carousel .carousel-control-prev-icon,
          .carousel .carousel-control-next-icon {
            background-color: rgba(111, 66, 193, 0.5);
            border-radius: 50%;
            padding: 10px;
          }
        `}
      </style>
    </Container>
  );
};

export default PackagesPage;