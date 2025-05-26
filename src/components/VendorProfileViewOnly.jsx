import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Button,
  Alert,
  Form,
  Card,
} from "react-bootstrap";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiGlobe,
  FiStar,
  FiClock,
  FiAward,
} from "react-icons/fi";
import axios from "axios";
import Carousel from "react-bootstrap/Carousel";
import { jwtDecode } from "jwt-decode";

const VendorProfileViewOnly = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [chatAlert, setChatAlert] = useState(null);
  const [reviewAlert, setReviewAlert] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vendorData, setVendorData] = useState(null);
  const [vendorServices, setVendorServices] = useState([]);
  const [specificService, setSpecificService] = useState(null);
  const serviceId = location.state?.serviceId; // Get service ID from navigation state

  const vendorId = location.state?.vendorId;

  // const userId = location.state?.userId;


  let userId;
  const token = localStorage.getItem("token");
  if (token) {
    const decoded = jwtDecode(token);
    userId = decoded.id || decoded._id;
  }
  // Fetch vendor data
  useEffect(() => {
    const fetchVendorData = async () => {
      if (!vendorId) return;
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/vendors/${vendorId}`
        );
        console.log("Full vendor response:", response.data); 
        setVendorData(response.data.data);
         // Add error boundary
      if (!response.data.data) {
        throw new Error("Vendor not found");
      }
      } catch (error) {
        console.error("Error fetching vendor data:", error);
      }
    };
    fetchVendorData();
  }, [vendorId]);
  useEffect(() => {
    const fetchSpecificService = async () => {
      if (!serviceId || !vendorId) return;
      
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/services/${serviceId}`
        );
        
        // Properly handle both populated vendor objects and raw IDs
        const serviceVendorId = response.data.data.vendor?._id 
          ? response.data.data.vendor._id.toString()
          : response.data.data.vendor.toString();
  
        const currentVendorId = vendorId.toString();
  
        console.log("Service validation:", {
          serviceVendorId,
          currentVendorId,
          match: serviceVendorId === currentVendorId
        });
  
        if (serviceVendorId !== currentVendorId) {
          throw new Error(`Service belongs to vendor ${serviceVendorId} but page is for ${currentVendorId}`);
        }
  
        setSpecificService(response.data.data);
      } catch (error) {
        console.error("Error fetching service:", error);
        setError({
          type: 'danger',
          message: error.message || 'Failed to load service details'
        });
        setSpecificService(null);
      }
    };
    fetchSpecificService();
  }, [serviceId, vendorId]);

  // Fetch vendor services
  useEffect(() => {
    const fetchVendorServices = async () => {
      if (!vendorId) return;
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/services?vendorId=${vendorId}`
        );
        setVendorServices(response.data);
      } catch (error) {
        console.error("Error fetching services:", error);
        setVendorServices([]);
      }
    };
    fetchVendorServices();
  }, [vendorId]);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/reviews/${vendorId}`
        );
        setReviews(response.data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setReviews([]);
      }
    };
    if (vendorId) fetchReviews();
  }, [vendorId]);

  const handleStartChat = async () => {
    if (!userId || !vendorId) {
      setChatAlert("❌ Missing userId or vendorId");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ userId, vendorId }),
      });

      const data = await res.json();

      if (res.ok) {
        const chatId = data._id;
        setChatAlert(`✅ Chat started with ${vendorData?.name || "Vendor"}`);
        setTimeout(() => {
          setChatAlert(null);
          navigate(`/chat/${chatId}`, {
            state: {
              chatId,
              currentUser: { _id: userId },
              vendorId: vendorId,
            },
          });
        }, 1000);
      } else {
        setChatAlert(`❌ ${data.error || "Chat creation failed"}`);
      }
    } catch (err) {
      console.error("Chat start error:", err);
      setChatAlert("❌ Server error, try again");
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewAlert(null);
    try {
      // Validate rating
      if (rating < 1 || rating > 5) {
        throw new Error("Please select a valid rating (1-5)");
      }
      // Get and validate token
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Please log in to submit a review");
      }

      // Verify user role
      const decoded = jwtDecode(token);
      if (decoded.role !== "user") {
        throw new Error("Only regular users can submit reviews");
      } // Validate vendor ID
      if (!vendorId) {
        throw new Error("Vendor information is missing");
      }

      setIsSubmitting(true);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/reviews`,
        {
          rating,
          comment,
          vendorId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setReviews([response.data, ...reviews]);
      setRating(0);
      setComment("");
      setReviewAlert({
        type: "success",
        message: "✅ Review submitted successfully",
      });
    } catch (error) {
      console.error("Review submission error:", error);
      const message =
        error.response?.data?.error ||
        error.message ||
        "Failed to submit review";
      setReviewAlert({ type: "danger", message: `❌ ${message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating) => {
    return Array(5)
      .fill()
      .map((_, i) => (
        <FiStar
          key={i}
          className={i < rating ? "text-warning" : "text-muted"}
          style={{ cursor: "pointer" }}
          onClick={() => setRating(i + 1)}
        />
      ));
  };
  const renderServiceDetails = () => {
    if (!specificService)
      return <Alert variant="info">Loading service details...</Alert>;

    // Common details for all services
    const commonDetails = (
      <>
        <p>
          <strong>Price:</strong> PKR {specificService.price}
        </p>
        <p>
          <strong>Location:</strong> {specificService.location}
        </p>
        <p>
          <strong>Category:</strong> {specificService.category}
        </p>
      </>
    );

    // Category-specific details
    const categorySpecificDetails = () => {
      switch (specificService.category.toLowerCase()) {
        case "photography":
          return (
            <>
              <p>
                <strong>Photography Type:</strong>{" "}
                {specificService.photographyType}
              </p>
              <p>
                <strong>Photographers:</strong>{" "}
                {specificService.numPhotographers}
              </p>
              <p>
                <strong>Coverage Duration:</strong>{" "}
                {specificService.coverageDuration} hours
              </p>
              {specificService.additionalPhotographyServices?.length > 0 && (
                <div className="mt-3">
                  <h5>Additional Services</h5>
                  <ul>
                    {specificService.additionalPhotographyServices.map(
                      (service, index) => (
                        <li key={index}>{service}</li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </>
          );

        case "car":
          return (
            <>
              <p>
                <strong>Car Model:</strong> {specificService.carModel}
              </p>
              <p>
                <strong>Car Type:</strong> {specificService.carType}
              </p>
              <p>
                <strong>Seating Capacity:</strong>{" "}
                {specificService.seatingCapacity}
              </p>
              {specificService.additionalCarServices?.length > 0 && (
                <div className="mt-3">
                  <h5>Additional Services</h5>
                  <ul>
                    {specificService.additionalCarServices.map(
                      (service, index) => (
                        <li key={index}>{service}</li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </>
          );

        case "venue":
          return (
            <>
              <p>
                <strong>Capacity:</strong> {specificService.capacityMin}-
                {specificService.capacityMax} people
              </p>
              <p>
                <strong>Hall Types:</strong>{" "}
                {specificService.hallTypes?.join(", ")}
              </p>
              <p>
                <strong>Pricing Structure:</strong>{" "}
                {specificService.pricingStructure}
              </p>
            </>
          );

        case "catering":
          return (
            <>
              <p>
                <strong>Cuisine Type:</strong> {specificService.cuisineType}
              </p>
              <p>
                <strong>Service Type:</strong> {specificService.serviceType}
              </p>
              <p>
                <strong>Guests Capacity:</strong> {specificService.minGuests}-
                {specificService.maxGuests}
              </p>
            </>
          );

        default:
          return null;
      }
    };

    return (
      <Card className="mb-4">
        <Carousel
          interval={1000} // Rotate every 3 seconds (3000ms)
          pause="hover" // Pause on hover
          fade // Use fade transition
          indicators={specificService.images.length > 1} // Show indicators only if multiple images
          controls={specificService.images.length > 1}
        >
          {specificService.images.map((image, index) => (
            <Carousel.Item key={index}>
              <div
                style={{
                  height: "400px",
                  overflow: "hidden",
                  position: "relative",
                  background: "#f8f9fa",
                }}
              >
                <img
                  className="d-block w-100"
                  src={`${import.meta.env.VITE_API_URL}${image.url}`}
                  alt={`Service preview ${index + 1}`}
                  style={{
                    position: "absolute",
                    top: "50%",
                    transform: "translateY(-50%)",
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/800x400?text=Image+Not+Found";
                  }}
                />
              </div>
            </Carousel.Item>
          ))}
        </Carousel>

        <Card.Body>
          <Card.Title className="h2 mb-3">{specificService.name}</Card.Title>
          <Card.Subtitle className="mb-3 text-muted">
            {specificService.category} Service
          </Card.Subtitle>

          <Card.Text className="lead mb-4">
            {specificService.description}
          </Card.Text>

          <div className="service-details">
            <h4 className="mb-3">Service Details</h4>
            <Row>
              <Col md={6}>{commonDetails}</Col>
              <Col md={6}>{categorySpecificDetails()}</Col>
            </Row>

            {/* Portfolio Section */}
            {specificService.portfolio?.length > 0 && (
              <div className="mt-4">
                <h4>Portfolio</h4>
                <Row>
                  {specificService.portfolio.map((image, index) => (
                    <Col md={4} key={index} className="mb-3">
                      <img
                        src={`${import.meta.env.VITE_API_URL}${image.url}`}
                        alt={`Portfolio ${index + 1}`}
                        className="img-fluid rounded"
                        style={{ height: "200px", objectFit: "cover" }}
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/400x300?text=Image+Not+Found";
                        }}
                      />
                    </Col>
                  ))}
                </Row>
              </div>
            )}
          </div>
        </Card.Body>
      </Card>
    );
  };
  return (
    <Container className="my-5" style={{ maxWidth: "1200px" }}>
      {chatAlert && <Alert variant="info">{chatAlert}</Alert>}
      {reviewAlert && (
        <Alert
          variant={reviewAlert.type}
          onClose={() => setReviewAlert(null)}
          dismissible
        >
          {reviewAlert.message}
        </Alert>
      )}

      {vendorData && (
        <div
          className="mb-4 p-4"
          style={{ backgroundColor: "#f8f9fa", borderRadius: "10px" }}
        >
          <Row className="align-items-center">
            <Col md={8}>
              <div className="d-flex align-items-center">
                <div
                  className="rounded-circle overflow-hidden"
                  style={{ width: "100px", height: "100px" }}
                >
                  <img
                    src={`${import.meta.env.VITE_API_URL}/${vendorData.logo.replace(
                      /\\/g,
                      "/"
                    )}`}
                    alt="Vendor Logo"
                    className="img-fluid h-100 w-100"
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div className="ms-5 ">
                  <h3 style={{ color: "#6f42c1" }}>
                    {vendorData.ownerName?.charAt(0).toUpperCase() +
                      vendorData.ownerName?.slice(1).toLowerCase()}
                  </h3>
                  <h6>
                    {vendorData.businessName?.charAt(0).toUpperCase() +
                      vendorData.businessName?.slice(1).toLowerCase()}
                  </h6>
                  <h6 style={{ color: "blue" }}>{vendorData.email}</h6>
                  <h6 style={{ color: "blue" }}>{vendorData.phone}</h6>
                  
                  <div className="mt-3">
  <span style={{ color: '#6f42c1', fontWeight: '500' }}>Other Services: </span>
  <span style={{ color: '#000000', fontSize: '1rem' }}>
    {vendorData.services && vendorData.services.length > 0 
      ? vendorData.services
          .map(service => 
            service.charAt(0).toUpperCase() + service.slice(1).toLowerCase()
          )
          .join(', ')
          .replace(/, ([^,]*)$/, ' and $1')
      : 'No services listed'}
  </span>
</div>
  
{/* 
                  <div className="d-flex align-items-center">
                    <FiStar className="text-warning me-1" />
                    <span>
                      {vendorData.rating} ({vendorData.reviewCount} reviews)
                    </span>
                  </div> */}
                </div>
              </div>
            </Col>
            <Col md={4} className="text-md-end mt-3 mt-md-0">
              <Button
                variant="success"
                style={{ backgroundColor: "#198754", borderColor: "#198754" }}
                onClick={handleStartChat}
              >
                Connect Now
              </Button>
            </Col>
          </Row>
        </div>
      )}

      <Row>
        <Col lg={12}>
          {vendorData && (
            <>
              <div
                className="mb-4 p-4"
                style={{ backgroundColor: "#f8f9fa", borderRadius: "10px" }}
              >
                <h4 style={{ color: "#6f42c1" }}>About Us</h4>
                <p>
                  We are dedicated to making your wedding planning experience
                  seamless and memorable.To provide exceptional wedding planning
                  services that exceed expectations, creating magical moments
                  that couples will cherish for a lifetime. To be the most
                  trusted and innovative wedding planning service worldwide,
                  recognized for our creativity, attention to detail, and
                  personalized approach to each couple's unique love story.
                </p>
              </div>
              <div
                className="mb-4 p-4"
                style={{ backgroundColor: "#f8f9fa", borderRadius: "10px" }}
              >
                <h4 style={{ color: "#6f42c1" }}>Service details</h4>
                {renderServiceDetails()}
              </div>
            </>
          )}

          <div
            className="mb-4 p-4"
            style={{ backgroundColor: "#f8f9fa", borderRadius: "10px" }}
          >
            <h4 style={{ color: "#6f42c1" }}>Write a Review</h4>
            <Form onSubmit={handleReviewSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Your Rating</Form.Label>
                <div>{renderStars(rating)}</div>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Your Review</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience..."
                />
              </Form.Group>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                style={{ backgroundColor: "#6f42c1", borderColor: "#6f42c1" }}
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>
            </Form>
          </div>

          <div
            className="mb-4 p-4"
            style={{ backgroundColor: "#f8f9fa", borderRadius: "10px" }}
          >
            <h4 style={{ color: "#6f42c1" }}>Reviews</h4>
            {reviews.length === 0 ? (
              <p>No reviews yet. Be the first to review!</p>
            ) : (
              reviews.map((review, index) => (
                <Card key={index} className="mb-3">
                  <Card.Body>
                    <div className="d-flex align-items-center mb-2">
                      {Array(5)
                        .fill()
                        .map((_, i) => (
                          <FiStar
                            key={i}
                            className={
                              i < review.rating ? "text-warning" : "text-muted"
                            }
                          />
                        ))}
                    </div>
                    <Card.Text>
                      {review.comment || "No comment provided"}
                    </Card.Text>
                    <Card.Subtitle className="text-muted">
                      By {review.user?.fullName || "Anonymous"} on{" "}
                      {new Date(review.createdAt).toLocaleDateString()}
                    </Card.Subtitle>
                  </Card.Body>
                </Card>
              ))
            )}
          </div>
        </Col>

        {/* <Col lg={4}>
          <div className="p-4" style={{ backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
            <Button
              variant="success"
              className="w-100 mt-2"
              onClick={handleStartChat}
            >
              Connect Now
            </Button>
          </div>
        </Col> */}
      </Row>
    </Container>
  );
};

export default VendorProfileViewOnly;
