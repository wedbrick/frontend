import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Badge, Alert, Spinner, Button, Toast } from 'react-bootstrap';
import { FiCalendar, FiUser, FiPackage, FiDollarSign, FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import axios from 'axios';
import socket from '../utils/socket';
import { toast } from 'react-toastify';

const VendorBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchBookings();

    // Connect to socket
    socket.connect();

    // Get vendor ID from localStorage
    const vendor = JSON.parse(localStorage.getItem('vendor') || '{}');
    const vendorId = vendor._id;

    if (vendorId) {
      // Register vendor for socket notifications
      socket.emit('registerVendor', vendorId);

      // Listen for booking updates
      socket.on('bookingUpdated', (updatedBooking) => {
        // Update the booking in state
        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking._id === updatedBooking._id ? updatedBooking : booking
          )
        );

        // Show toast notification
        toast.success(`Booking ${updatedBooking.status} successfully!`);
      });
    }

    // Cleanup on unmount
    return () => {
      socket.off('bookingUpdated');
      socket.disconnect();
    };
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/bookings/vendor-bookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setBookings(response.data.bookings);
      } else {
        setError('Failed to fetch bookings');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      confirmed: 'success',
      cancelled: 'danger',
      completed: 'info',
    };
    return <Badge bg={variants[status] || 'secondary'}>{status.toUpperCase()}</Badge>;
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = newStatus === 'confirmed' ? 'confirm' : 'cancel';

      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/bookings/${endpoint}/${bookingId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Show a success message
        const message =
          newStatus === 'confirmed'
            ? 'Booking confirmed successfully! The user has been notified.'
            : 'Booking cancelled. The user has been notified.';

        // Show toast notification
        toast.success(message);

        // Refresh bookings
        fetchBookings();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update booking status';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const renderBookingCard = (booking) => {
    const isPackage = booking.type === 'package';

    return (
      <Col md={6} lg={4} key={booking._id} className="mb-4">
        <Card className="h-100 shadow-sm">
          <Card.Body>
            <Card.Title className="d-flex justify-content-between align-items-center mb-3">
              <span>{booking.name}</span>
              {getStatusBadge(booking.status)}
            </Card.Title>

            <div className="booking-details p-3 bg-light rounded mb-3">
              <div className="d-flex align-items-center mb-2">
                <FiUser className="me-2 text-primary" />
                <span>{booking.user.fullName}</span>
              </div>
              <div className="d-flex align-items-center mb-2">
                <FiPhone className="me-2 text-success" />
                <span>{booking.user.phoneNumber}</span>
              </div>
              <div className="d-flex align-items-center mb-2">
                <FiMail className="me-2 text-info" />
                <span>{booking.user.email}</span>
              </div>
              <div className="d-flex align-items-center mb-2">
                <FiCalendar className="me-2 text-warning" />
                <span>{booking.formattedDate}</span>
              </div>
              <div className="d-flex align-items-center mb-2">
                <FiDollarSign className="me-2 text-danger" />
                <span>PKR {booking.price}</span>
              </div>
              {!isPackage && (
                <div className="d-flex align-items-center">
                  <FiMapPin className="me-2 text-secondary" />
                  <span>{booking.service.location}</span>
                </div>
              )}
            </div>

            {isPackage && (
              <div className="included-services mb-3">
                <h6 className="mb-2">Included Services:</h6>
                <ul className="list-unstyled">
                  {booking.services.map((service) => (
                    <li key={service._id} className="mb-1">
                      • {service.name} - ${service.price}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {booking.status === 'pending' && (
              <div className="d-flex gap-2">
                <Button
                  variant="success"
                  size="sm"
                  className="flex-grow-1"
                  onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                >
                  Confirm
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  className="flex-grow-1"
                  onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                >
                  Cancel
                </Button>
              </div>
            )}
          </Card.Body>
        </Card>
      </Col>
    );
  };

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  const serviceBookings = bookings.filter((booking) => booking.type === 'service');
  const packageBookings = bookings.filter((booking) => booking.type === 'package');

  return (
    <Container className="my-5">
      <h2 className="mb-4">Bookings ({bookings.length})</h2>

      {bookings.length === 0 ? (
        <Alert variant="info">No bookings available at this time.</Alert>
      ) : (
        <>
          {/* Package Bookings Section */}
          <div className="mb-5">
            <h3 className="mb-4">
              <FiPackage className="me-2" />
              Package Bookings ({packageBookings.length})
            </h3>
            <Row>{packageBookings.map((booking) => renderBookingCard(booking))}</Row>
          </div>

          {/* Service Bookings Section */}
          <div className="mb-5">
            <h3 className="mb-4">
              <FiUser className="me-2" />
              Service Bookings ({serviceBookings.length})
            </h3>
            <Row>{serviceBookings.map((booking) => renderBookingCard(booking))}</Row>
          </div>
        </>
      )}
    </Container>
  );
};

export default VendorBookings;