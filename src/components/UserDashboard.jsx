import React, { useState, useEffect } from "react";
import {Navbar,Container,Nav,Form,Button,Row,Col,Card,Spinner,Alert, Modal, Carousel, Dropdown,
} from "react-bootstrap";
import {FiSearch, FiFilter, FiLogOut, FiUser, FiCameraOff,} from "react-icons/fi";
import { FaCar, FaUtensils, FaPhotoVideo, FaHome } from "react-icons/fa";
import { BsStars } from "react-icons/bs";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import defaultServiceImage from "../assets/g1.jpg";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { BsSortDown, BsSortUpAlt } from "react-icons/bs";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [services, setServices] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("services");
  const [bookings, setBookings] = useState([]);
  const [isBooking, setIsBooking] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingMessage, setBookingMessage] = useState("");
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [isLoadingVendors, setIsLoadingVendors] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 7);
    defaultDate.setHours(10, 0, 0, 0);
    return defaultDate;
  });

  const [filters, setFilters] = useState({
    price: [0, 10000],
    location: "",
    rating: 0,
    sortBy: "price_asc",
    serviceTypes: [],
    dateRange: {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  });

  const location = useLocation();
  const [userId, setUserId] = useState("");

  useEffect(() => {
    if (location.state?.userId) {
      setUserId(location.state.userId);
      console.log("✅ Received userId from login:", location.state.userId);
    } else {
      console.warn("⚠️ No userId received in props!");
    }
  }, [location.state]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        console.log("Fetching services...");
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/services`);

        if (!response.ok) {
          throw new Error("Failed to fetch services");
        }

        const responseData = await response.json();
        console.log("API Response:", responseData);

        if (responseData.success && Array.isArray(responseData.data)) {
          console.log("Setting services:", responseData.data);
          setServices(responseData.data);
          // After setServices(responseData.data);
console.log("Sample service vendor data:", responseData.data[0]?.vendor);
        } else {
          setError("Invalid response format from server");
        }
      } catch (err) {
        console.error("Error fetching services:", err);
        setError(err.message);
      } finally {
        setIsLoadingServices(false);
      }
    };

    fetchServices();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/signout");
  };

  const handleViewDetails = (service) => {
    const vendorId = service.vendor?._id 
    ? service.vendor._id.toString() 
    : service.vendor?.toString();

  // Add validation
  if (!vendorId) {
    console.error("No vendor ID found for service:", service._id);
    return;
  }

  console.log("Navigating with:", {
    vendorId,
    serviceVendor: service.vendor,
    serviceId: service._id
  });
    navigate(`/vendor-profile/${vendorId}`, {
      state: {
        userId: userId,
        vendorId: vendorId,
        // vendorId: service.vendor,
        serviceId: service._id, // Pass the service ID
      },
    });
  };

  const handleBookNow = (service) => {
    setSelectedService(service);
    setShowBookingModal(true);
  };

  const fetchUserBookings = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/bookings`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setBookings(response.data);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/bookings/${bookingId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      fetchUserBookings();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel booking");
    }
  };

  useEffect(() => {
    fetchUserBookings();
  }, []);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    console.log("Filter changed to:", filter); // Debugging to confirm filter change
  };
  const [approvedVendorIds, setApprovedVendorIds] = useState([]);

// Fetch approved vendors when component mounts
useEffect(() => {
  const fetchApprovedVendors = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/vendors?isApproved=true`);
      const data = await response.json();
      if (data.success) {
        const ids = data.data.map(vendor => vendor._id.toString());
        console.log('Approved Vendor IDs:', ids);
        setApprovedVendorIds(ids);
      }
    } catch (err) {
      console.error('Error fetching approved vendors:', err);
    }
    finally {
      setIsLoadingVendors(false); // Add this line
    }
  };
  fetchApprovedVendors();
}, []);

  // Ensure your filteredServices logic is correct (this part looks fine but verify case sensitivity)
  // Simplified filtered services logic
  const filteredServices = services
    .filter((service) => {
    
    // First check vendor approval using populated data
    if (!service.vendor?.isApproved) {
      return false;
    }
      // Search filter
      const matchesSearch =
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.category.toLowerCase().includes(searchQuery.toLowerCase());

      // Price filter
      const matchesPrice =
        service.price >= filters.price[0] && service.price <= filters.price[1];

      // Location filter
      const matchesLocation = service.location
        .toLowerCase()
        .includes(filters.location.toLowerCase());

      // Service type filter
      const matchesServiceType =
        filters.serviceTypes.length === 0 ||
        filters.serviceTypes.includes(service.category.toLowerCase());

      return (
        matchesSearch && matchesPrice && matchesLocation && matchesServiceType
      );
    })
    .sort((a, b) => {
      if (filters.sortBy === "price_asc") return a.price - b.price;
      if (filters.sortBy === "price_desc") return b.price - a.price;
      return 0;
    });
    const handleConfirmBooking = async () => {
      try {
        setIsBooking(true);
  
        if (!selectedService || !selectedService._id) {
          throw new Error("Invalid service selected");
        }
  
        if (!selectedDate) {
          throw new Error("Please select a booking date");
        }
  
        // Clone the selected date and set time to 10:00 AM
        const bookingDate = new Date(selectedDate);
        bookingDate.setHours(10, 0, 0, 0);
  
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/bookings`,
          {
            serviceId: selectedService._id,
            bookingDate: bookingDate.toISOString(),
            notes: "I would like to book this service",
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );
  
        if (!response.data || !response.data.booking) {
          throw new Error("Invalid response from server");
        }
  
        setBookings((prevBookings) => {
          const bookingsArray = Array.isArray(prevBookings) ? prevBookings : [];
          return [...bookingsArray, response.data.booking];
        });
  
        const successMessage = `Successfully booked ${
          selectedService.name
        } for ${bookingDate.toLocaleDateString()}`;
        setBookingMessage(successMessage);
        setBookingSuccess(true);
  
        setTimeout(() => {
          setShowBookingModal(false);
          setSelectedService(null);
          setBookingSuccess(false);
          setBookingMessage("");
        }, 2000);
      } catch (error) {
        console.error("Booking failed:", error);
        let errorMessage;
  
        if (error.response?.status === 409) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to book service. Please try again.";
        }
  
        setBookingMessage(errorMessage);
        setBookingSuccess(false);
  
        setTimeout(() => {
          setShowBookingModal(false);
          setSelectedService(null);
          setBookingSuccess(false);
          setBookingMessage("");
        }, 3000);
      } finally {
        setIsBooking(false);
      }
    };

  return (
    <>
      <Container className="mt-5">
        {/* Heading */}
        <div className="text-center mb-4">
          <h1 className="fw-bold" style={{ color: "#6f42c1" }}>
            Discover Your Services
          </h1>
          <p className="text-muted">
            Find and book the best service for your special occasions
          </p>
        </div>

        {/* Search and Browse */}
        <Row className="justify-content-center mb-5">
          <Col md={8}>
            <div className="position-relative">
              <Form.Control
                type="search"
                placeholder="Search for services..."
                className="rounded-pill ps-5"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ height: "50px" }}
              />
              <FiSearch
                className="position-absolute top-50 start-0 translate-middle-y ms-3"
                style={{ color: "#6f42c1" }}
              />
            </div>
          </Col>
        </Row>
        <Row>
          {/* Filters Sidebar */}
          <Col md={3}>
            <Card className="p-3 shadow-sm sticky-top" style={{ top: "1rem" }}>
              <h5 className="mb-3 text-primary">
                <FiFilter className="me-2" />
                Filters
              </h5>

              <Form.Group className="mb-4">
                <Form.Label>Sort By</Form.Label>
                <Form.Select
                  value={filters.sortBy}
                  onChange={(e) =>
                    setFilters({ ...filters, sortBy: e.target.value })
                  }
                >
                  <option value="price_asc">
                    <BsSortDown /> Price: Low to High
                  </option>
                  <option value="price_desc">
                    <BsSortUpAlt /> Price: High to Low
                  </option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>
                  Price Range (PKR{filters.price[0]} - PKR{filters.price[1]}+)
                </Form.Label>
                <Form.Range
                  min="0"
                  max="100000"
                  step="100"
                  value={filters.price[1]}
                  onChange={(e) =>
                    setFilters({ ...filters, price: [0, e.target.value] })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Location</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter location"
                  value={filters.location}
                  onChange={(e) =>
                    setFilters({ ...filters, location: e.target.value })
                  }
                />
              </Form.Group>

              {/* Updated Service Types with All and Other */}
              <Form.Group className="mb-4">
                <Form.Label>Service Types</Form.Label>
                <Form.Check
                  type="checkbox"
                  label="All Services"
                  checked={filters.serviceTypes.length === 0}
                  onChange={(e) => {
                    if (e.target.checked)
                      setFilters({ ...filters, serviceTypes: [] });
                  }}
                />
                {[
                  "photography",
                  "catering",
                  "car",
                  "venue",
                  "other",
                ].map((type) => (
                  <Form.Check
                    key={type}
                    type="checkbox"
                    label={type.charAt(0).toUpperCase() + type.slice(1)}
                    checked={filters.serviceTypes.includes(type)}
                    onChange={(e) => {
                      const types = [...filters.serviceTypes];
                      const value = type.toLowerCase();
                      if (e.target.checked) {
                        types.push(value);
                      } else {
                        const index = types.indexOf(value);
                        if (index >= 0) types.splice(index, 1);
                      }
                      setFilters({ ...filters, serviceTypes: types });
                    }}
                  />
                ))}
              </Form.Group>
              <Button
                variant="outline-primary"
                className="w-100"
                onClick={() =>
                  setFilters({
                    price: [0, 100000],
                    location: "",
                    rating: 0,
                    sortBy: "price_asc",
                    serviceTypes: [],
                    dateRange: {
                      startDate: new Date(),
                      endDate: new Date(),
                      key: "selection",
                    },
                  })
                }
              >
                Reset Filters
              </Button>
            </Card>
          </Col>
          {/* Service Filters */}
          <Col md={9}>
            {/* Main Content Area */}
            <Row>
              {/* Services List */}
              <Col md={showFilters ? 9 : 12}>
                {isLoadingServices ? (
                  <div className="text-center my-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2">Loading services...</p>
                  </div>
                ) : error ? (
                  <Alert variant="danger" className="text-center">
                    Error loading services: {error}
                  </Alert>
                ) : filteredServices.length === 0 ? (
                  <div className="text-center my-5">
                    <p>No services found matching your criteria</p>
                    <Button
                      variant="outline-primary"
                      onClick={() => {
                        setActiveFilter("all");
                        setFilters({
                          price: [0, 100000],
                          location: "",
                          rating: 0,
                        });
                      }}
                    >
                      Reset Filters
                    </Button>
                  </div>
                ) : (
                  <Row>
                    {filteredServices.map((service) => (
                      <Col md={4} key={service._id} className="mb-4">
                        <Card
                          className="h-100 shadow-sm hover-shadow"
                          style={{
                            borderRadius: "15px",
                            transition: "all 0.3s ease",
                            border: "none",
                          }}
                        >
                          {service.images && service.images.length > 0 ? (
                            <div
                              style={{
                                height: "200px",
                                borderTopLeftRadius: "15px",
                                borderTopRightRadius: "15px",
                                overflow: "hidden",
                              }}
                            >
                              <Carousel
                                indicators={service.images.length > 1}
                                controls={service.images.length > 1}
                                interval={2000} // Rotate every 2 seconds
                                pause={false}
                              >
                                {service.images.map((image, index) => (
                                  <Carousel.Item key={index}>
                                    <Card.Img
                                      variant="top"
                                      src={`${import.meta.env.VITE_API_URL}${image.url}`}
                                      alt={`${service.name} - Image ${
                                        index + 1
                                      }`}
                                      style={{
                                        height: "200px",
                                        objectFit: "cover",
                                        width: "100%",
                                      }}
                                    />
                                  </Carousel.Item>
                                ))}
                              </Carousel>
                            </div>
                          ) : (
                            <div
                              style={{
                                height: "200px",
                                backgroundColor: "#f8f9fa",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderTopLeftRadius: "15px",
                                borderTopRightRadius: "15px",
                              }}
                            >
                              <FiCameraOff size={40} className="text-muted" />
                            </div>
                          )}
                          <Card.Body className="d-flex flex-column">
                            <Card.Title
                              className="mb-3 fw-bold"
                              style={{ color: "#6f42c1" }}
                            >
                              {service.name}
                            </Card.Title>
                            <Card.Text>
                              <div className="mb-2">
                                <span className="fw-semibold">
                                  PKR {service.price}
                                </span>
                              </div>
                              <div className="mb-2">
                                <span>{service.location}</span>
                              </div>
                              <div className="mb-3">
                                <span
                                  className="badge"
                                  style={{
                                    backgroundColor: "#e2d4f0",
                                    color: "#6f42c1",
                                    padding: "8px 12px",
                                    borderRadius: "20px",
                                  }}
                                >
                                  {service.category}
                                </span>
                              </div>
                              <div
                                className="text-muted small mb-3"
                                style={{
                                  display: "-webkit-box",
                                  WebkitLineClamp: "2",
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                  lineHeight: "1.5",
                                }}
                              >
                                {service.description}
                              </div>
                            </Card.Text>
                            <div className="d-flex gap-2 mt-auto">
                              <Button
                                variant="outline-primary"
                                className="flex-grow-1 rounded-pill"
                                style={{
                                  borderColor: "#6f42c1",
                                  color: "#6f42c1",
                                  transition: "all 0.3s ease",
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    "#6f42c1";
                                  e.currentTarget.style.color = "white";
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    "transparent";
                                  e.currentTarget.style.color = "#6f42c1";
                                }}
                                onClick={() => handleViewDetails(service)} // Pass the entire service object
                              >
                                View Details
                              </Button>
                              <Button
                                variant="primary"
                                className="flex-grow-1 rounded-pill"
                                style={{
                                  backgroundColor: "#6f42c1",
                                  borderColor: "#6f42c1",
                                  transition: "all 0.3s ease",
                                }}
                                onClick={() => handleBookNow(service)}
                              >
                                Book Now
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>

      {/* Updated Booking Confirmation Modal */}
      <Modal show={showBookingModal} onHide={() => setShowBookingModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {bookingSuccess ? "Booking Successful!" : "Confirm Booking"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {bookingSuccess ? (
            <Alert variant="success" className="mb-0">
              {bookingMessage}
            </Alert>
          ) : bookingMessage ? (
            <Alert variant="danger" className="mb-3">
              {bookingMessage}
            </Alert>
          ) : (
            selectedService && (
              <>
                <p>Are you sure you want to book this service?</p>
                <div className="mb-3">
                  <strong>Service:</strong> {selectedService.name}
                </div>
                <div className="mb-3">
                  <strong>Price:</strong> PKR {selectedService.price}
                </div>
                <div className="mb-3">
                  <strong>Location:</strong> {selectedService.location}
                </div>
                <div className="mb-3">
                  <strong>Select Booking Date:</strong>
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    minDate={new Date()}
                    dateFormat="MMMM d, yyyy"
                    excludeDates={[
                      new Date(2024, 0, 1), // Example: exclude New Year
                    ]}
                    filterDate={(date) => {
                      // Disable weekends
                      return date.getDay() !== 0 && date.getDay() !== 6;
                    }}
                    className="form-control mt-2"
                    popperPlacement="bottom"
                  />
                  <small className="text-muted">
                    Available time slots: 10:00 AM - 6:00 PM
                  </small>
                </div>
              </>
            )
          )}
        </Modal.Body>
        <Modal.Footer>
          {!bookingSuccess && !bookingMessage && (
            <>
              <Button
                variant="secondary"
                onClick={() => setShowBookingModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmBooking}
                disabled={isBooking}
                style={{ backgroundColor: "#6f42c1", borderColor: "#6f42c1" }}
              >
                {isBooking ? "Booking..." : "Confirm Booking"}
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>

      {/* Add this CSS to your stylesheet or in a style tag */}
      <style>
        {`
        .hover-shadow:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(111, 66, 193, 0.1) !important;
        }
           .react-datepicker-wrapper {
          width: 100%;
        }
        .react-datepicker__header {
          background-color: #6f42c1;
          color: white;
        }
        .react-datepicker__current-month {
          color: white;
        }
        .react-datepicker__day--selected {
          background-color: #6f42c1;
        }
        .react-datepicker__day--keyboard-selected {
          background-color: #6f42c1;
        }
        .react-datepicker__time-container {
          width: 120px;
        }
        .react-datepicker__navigation--next {
          border-left-color: #ccc;
        }
        .react-datepicker__navigation--previous {
          border-right-color: #ccc;
        }
      `}
      </style>
    </>
  );
};

export default UserDashboard;
