import React, { useState, useEffect } from 'react';
import { Card, Button, Container, Row, Col, Spinner, Alert, Carousel } from 'react-bootstrap';
import { FiCalendar, FiClock, FiMapPin, FiDollarSign, FiPackage, FiMusic, FiCameraOff } from 'react-icons/fi';
import axios from 'axios';
import socket from '../utils/socket';

const MyBookings = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookings, setBookings] = useState([]);
  // const baseURL = 'http://localhost:5000'; 

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/bookings`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        let bookings = response.data.bookings;

        // Fetch full service/package data if images or imageUrl are missing
        bookings = await Promise.all(
          bookings.map(async (booking) => {
            if (booking.type === 'service' && booking.service?._id && !booking.service?.images) {
              try {
                const serviceResponse = await axios.get(
                  `${import.meta.env.VITE_API_URL}/api/services/${booking.service._id}`
                );
                return { ...booking, service: serviceResponse.data.data };
              } catch (err) {
                console.error(`Failed to fetch service ${booking.service._id}:`, err);
                return booking;
              }
            } else if (booking.type === 'package' && booking.package?._id && !booking.package?.packageImages && !booking.package?.services?.every(s => s.imageUrl || s.images)) {
              try {
                const packageResponse = await axios.get(
                  `${import.meta.env.VITE_API_URL}/api/packages/${booking.package._id}`
                );
                return { ...booking, package: packageResponse.data.data };
              } catch (err) {
                console.error(`Failed to fetch package ${booking.package._id}:`, err);
                return booking;
              }
            }
            return booking;
          })
        );

        setBookings(bookings);
      } else {
        setError('Failed to fetch bookings');
      }
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch bookings');
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      const response = await axios.delete(`${import.meta.env.VITE_API_URL}/api/bookings/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        const cancelledBooking = bookings.find(b => b._id === bookingId);
        if (cancelledBooking) {
          socket.emit('bookingCancelledByUser', {
            userId: cancelledBooking.user?._id,
            vendorId: cancelledBooking.vendor?._id,
            bookingId: bookingId
          });
        }
        fetchBookings();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: { bg: 'warning', text: 'Pending Confirmation' },
      confirmed: { bg: 'success', text: 'Confirmed' },
      cancelled: { bg: 'danger', text: 'Cancelled' },
      completed: { bg: 'info', text: 'Completed' }
    };

    return (
      <span className={`badge bg-${statusStyles[status]?.bg || 'secondary'}`}>
        {statusStyles[status]?.text || status}
      </span>
    );
  };

  const renderImageSection = (entity, isPackage = false) => {
    if (isPackage) {
      return (
        <div
          style={{
            height: '200px',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
            overflow: 'hidden'
          }}
        >
          {entity.package?.packageImages?.length > 0 ? (
            <Carousel
              interval={3000}
              controls={entity.package.packageImages.length > 1}
              indicators={entity.package.packageImages.length > 1}
              className="package-carousel"
            >
              {entity.package.packageImages.map((image, index) => (
                <Carousel.Item key={index}>
                  <div className="position-relative">
                    <img
                      src={`${baseURL}${image.url}`}
                      alt={`${entity.package?.name || 'Package'} - Image ${index + 1}`}
                      style={{
                        height: '200px',
                        width: '100%',
                        objectFit: 'cover',
                        borderTopLeftRadius: '8px',
                        borderTopRightRadius: '8px'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div
                      className="no-image-placeholder"
                      style={{ display: 'none', height: '200px', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <FiCameraOff className="text-muted" size={40} />
                    </div>
                    <div className="service-name-overlay">
                      {entity.package?.name || 'Unnamed Package'}
                    </div>
                  </div>
                </Carousel.Item>
              ))}
            </Carousel>
          ) : (
            <Carousel
              interval={3000}
              controls={entity.package?.services?.length > 1}
              indicators={entity.package?.services?.length > 1}
              className="package-carousel"
            >
              {entity.package?.services?.map((service) => (
                <Carousel.Item key={service?._id || Math.random()}>
                  <div className="position-relative">
                    {service?.imageUrl || (service?.images?.length > 0) ? (
                      <>
                        <img
                          src={`${baseURL}${service.imageUrl || service.images[0].url}`}
                          alt={service?.name || 'Service image'}
                          style={{
                            height: '200px',
                            width: '100%',
                            objectFit: 'cover',
                            borderTopLeftRadius: '8px',
                            borderTopRightRadius: '8px'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div
                          className="no-image-placeholder"
                          style={{ display: 'none', height: '200px', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <FiCameraOff className="text-muted" size={40} />
                        </div>
                      </>
                    ) : (
                      <div className="no-image-placeholder">
                        <FiCameraOff className="text-muted" size={40} />
                      </div>
                    )}
                    <div className="service-name-overlay">
                      {service?.name || 'Unnamed Service'}
                    </div>
                  </div>
                </Carousel.Item>
              ))}
            </Carousel>
          )}
        </div>
      );
    }

    return (
      <>
        {entity.service?.images?.length > 0 ? (
          <Carousel
            interval={3000}
            controls={entity.service.images.length > 1}
            indicators={entity.service.images.length > 1}
          >
            {entity.service.images.map((image, index) => (
              <Carousel.Item key={index}>
                <div className="position-relative">
                  <Card.Img
                    variant="top"
                    src={`${baseURL}${image?.url}`}
                    alt={`${entity.service?.name || 'Service'} - Image ${index + 1}`}
                    style={{
                      height: '200px',
                      objectFit: 'cover',
                      borderTopLeftRadius: '8px',
                      borderTopRightRadius: '8px'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div
                    className="no-image-placeholder"
                    style={{ display: 'none', height: '200px', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <FiCameraOff className="text-muted" size={40} />
                  </div>
                </div>
              </Carousel.Item>
            ))}
          </Carousel>
        ) : (
          <div className="no-image-placeholder">
            <FiCameraOff className="text-muted" size={40} />
          </div>
        )}
      </>
    );
  };

  const renderBookingCard = (booking) => {
    const isPackageBooking = booking.type === 'package';
    const isServiceBooking = booking.type === 'service';

    return (
      <Col md={6} lg={4} key={booking._id} className="mb-4">
        <Card className="h-100 shadow-sm hover-card">
          {isServiceBooking && renderImageSection(booking)}
          {isPackageBooking && renderImageSection(booking, true)}

          <Card.Body>
            <div className="d-flex align-items-center mb-3">
              {isPackageBooking ? (
                <FiPackage className="me-2" style={{ color: '#6f42c1' }} />
              ) : (
                <FiMusic className="me-2" style={{ color: '#6f42c1' }} />
              )}
              <Card.Title className="h5 mb-0">
                {isPackageBooking
                  ? booking.package?.name || 'Unnamed Package'
                  : booking.service?.name || 'Unnamed Service'}
              </Card.Title>
            </div>

            <div className="booking-details">
              <div className="d-flex align-items-center mb-2">
                <FiDollarSign className="me-2 text-primary" />
                <span className="fw-bold">PKR {booking.price}</span>
              </div>

              {isPackageBooking && (
                <div className="package-services mb-2">
                  <small className="text-muted d-block mb-1">Included Services:</small>
                  {booking.package?.services?.map((service, index) => (
                    <div key={service?._id || index} className="d-flex align-items-center ms-2 mb-1">
                      <span className="bullet me-2">•</span>
                      <span>{service?.name || 'Unknown Service'}</span>
                    </div>
                  ))}
                </div>
              )}

              {isServiceBooking && (
                <div className="d-flex align-items-center mb-2">
                  <FiMapPin className="me-2 text-success" />
                  <span>{booking.service?.location || 'Location not specified'}</span>
                </div>
              )}

              <div className="d-flex align-items-center mb-2">
                <FiCalendar className="me-2 text-info" />
                <span>{booking.formattedDate}</span>
              </div>

              <div className="d-flex align-items-center mb-2">
                <FiClock className="me-2 text-warning" />
                <span>{getStatusBadge(booking.status)}</span>
              </div>

              <div className="mt-3">
                <small className="text-muted">
                  Notes: {booking.notes || 'No additional notes'}
                </small>
              </div>
            </div>

            {booking.status === 'pending' && (
              <Button
                variant="outline-danger"
                size="sm"
                className="w-100 mt-3"
                onClick={() => handleCancelBooking(booking._id)}
              >
                Cancel Booking
              </Button>
            )}
          </Card.Body>
        </Card>
      </Col>
    );
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading your bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="text-center">
        Error loading bookings: {error}
      </Alert>
    );
  }

  const serviceBookings = bookings.filter(booking => booking.type === 'service');
  const packageBookings = bookings.filter(booking => booking.type === 'package');

  return (
    <Container className="mt-5">
      <h2 className="mb-4 fw-bold" style={{ color: '#6f42c1' }}>
        My Bookings ({bookings.length})
      </h2>

      {bookings.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted">You haven't booked any services yet.</p>
        </div>
      ) : (
        <>
          <div className="mb-5">
            <h3 className="mb-4">
              <FiPackage className="me-2" />
              Package Bookings ({packageBookings.length})
            </h3>
            {packageBookings.length === 0 ? (
              <Alert variant="info">No package bookings available.</Alert>
            ) : (
              <Row>
                {packageBookings.map(booking => renderBookingCard(booking))}
              </Row>
            )}
          </div>

          <div className="mb-5">
            <h3 className="mb-4">
              <FiMusic className="me-2" />
              Service Bookings ({serviceBookings.length})
            </h3>
            {serviceBookings.length === 0 ? (
              <Alert variant="info">No service bookings available.</Alert>
            ) : (
              <Row>
                {serviceBookings.map(booking => renderBookingCard(booking))}
              </Row>
            )}
          </div>
        </>
      )}

      <style>
        {`
          .hover-card {
            transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
          }
          .hover-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 4px 15px rgba(0,0,0,0.1) !important;
          }
          .booking-details {
            background-color: #f8f9fa;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
          }
          .no-image-placeholder {
            height: 200px;
            background: #f8f9fa;
            display: flex;
            align-items: center;
            justify-content: center;
            border-top-left-radius: 8px;
            border-top-right-radius: 8px;
          }
          .no-image-placeholder svg {
            width: 40px;
            height: 40px;
            color: #6f42c1;
          }
          .package-services {
            background-color: white;
            padding: 0.5rem;
            border-radius: 4px;
            border: 1px solid #e9ecef;
          }
          .bullet {
            color: #6f42c1;
            font-size: 1.2em;
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

export default MyBookings;