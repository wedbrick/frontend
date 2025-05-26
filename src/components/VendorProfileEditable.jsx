import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Button, Alert, Form } from "react-bootstrap";
import { FiMail, FiPhone, FiEdit } from "react-icons/fi";
import "bootstrap/dist/css/bootstrap.min.css";
import "./VendorProfileEditable.css"; // Import custom CSS

const VendorProfileEditable = ({ vendorId: propVendorId }) => {
  const [vendor, setVendor] = useState(null);
  const [isEditing, setIsEditing] = useState(true); // Default to edit mode
  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    description: "",
    logo: null, // Store file object
    services: [],
    portfolio: [],
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Get vendorId from prop or local storage
  const vendorId = propVendorId || JSON.parse(localStorage.getItem("vendor"))?._id;

  // Fetch vendor data on component mount
  useEffect(() => {
    const fetchVendor = async () => {
      if (!vendorId) {
        setError("Vendor ID is missing. Please log in or provide a valid vendor ID.");
        return;
      }
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/vendors/${vendorId}`);
        console.log("Vendor API Response:", response.data);
        if (!response.data.data) {
          throw new Error("Vendor not found");
        }
        setVendor(response.data.data);
        setFormData({
          businessName: response.data.data.businessName || "",
          ownerName: response.data.data.ownerName || "",
          email: response.data.data.email || "",
          phone: response.data.data.phone || "",
          description: response.data.data.description || "",
          logo: response.data.data.logo || null,
          services: response.data.data.services || [],
          portfolio: response.data.data.portfolio || [],
        });
      } catch (err) {
        console.error("Error fetching vendor:", err.response?.data, err.message);
        setError(err.response?.data?.error || err.message || "Failed to fetch vendor data");
      }
    };
    fetchVendor();
  }, [vendorId]);

  // Handle input changes for text fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "services" || name === "portfolio") {
      setFormData({
        ...formData,
        [name]: value.split(",").map((item) => item.trim()),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Handle file input change for logo
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        logo: file, // Store file object
      });
    }
  };

  // Handle form submission with file upload
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("businessName", formData.businessName);
      formDataToSend.append("ownerName", formData.ownerName);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("services", formData.services.join(","));
      formDataToSend.append("portfolio", formData.portfolio.join(","));
      if (formData.logo instanceof File) {
        formDataToSend.append("logo", formData.logo);
      }

      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/vendors/${vendorId}/details`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setVendor(response.data.data);
      setSuccess("Profile updated successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error updating vendor:", err.response?.data, err.message);
      setError(err.response?.data?.error || "Failed to update profile");
    }
  };

  // Handle cancel (reset form to original vendor data)
  const handleCancel = () => {
    setFormData({
      businessName: vendor.businessName || "",
      ownerName: vendor.ownerName || "",
      email: vendor.email || "",
      phone: vendor.phone || "",
      description: vendor.description || "",
      logo: vendor.logo || null,
      services: vendor.services || [],
      portfolio: vendor.portfolio || [],
    });
    setError("");
  };

  // Render loading or error state
  if (!vendor && error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!vendor) {
    return <Container className="my-5 text-center">Loading...</Container>;
  }

  return (
    <Container className="my-5" style={{ maxWidth: "1200px" }}>
      {error && (
        <Alert variant="danger" onClose={() => setError("")} dismissible>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" onClose={() => setSuccess("")} dismissible>
          {success}
        </Alert>
      )}

      <Card className="mb-4 p-4 border-no" >
        <h2 className="mb-4 text-center" style={{ color: "#6f42c1", fontWeight: "bold" }}>
          Vendor Profile
        </h2>
        <Row>
          {/* Left Side: Logo */}
          <Col md={3} className="text-center">
            <div className="logo-container position-relative border rounded-circle overflow-hidden d-flex justify-content-center align-items-center" style={{ width: "150px", height: "150px", margin: "0 auto" }}>
              {vendor.logo && (
                <img
                  src={
                    formData.logo instanceof File
                      ? URL.createObjectURL(formData.logo)
                      : `${import.meta.env.VITE_API_URL}/${vendor.logo.replace(/\\/g, "/")}`
                  }
                  alt="Vendor Logo"
                  className="rounded-circle img-fluid"
                  style={{ width: "150px", height: "150px", objectFit: "cover" }}
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/150?text=Logo";
                  }}
                />
              )}
            </div>
            <Form.Group className="mt-3">
              <Form.Label>Upload New Logo</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </Form.Group>
          </Col>

          {/* Right Side: Vendor Information Form */}
          <Col md={9}>
            <Form onSubmit={handleSubmit}>
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Business Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Owner Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Phone</Form.Label>
                    <Form.Control
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Services (comma-separated)</Form.Label>
                    <Form.Control
                      type="text"
                      name="services"
                      value={formData.services.join(", ")}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Portfolio (comma-separated)</Form.Label>
                    <Form.Control
                      type="text"
                      name="portfolio"
                      value={formData.portfolio.join(", ")}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  style={{ backgroundColor: "#6f42c1", borderColor: "#6f42c1" }}
                >
                  Save Changes
                </Button>
              </div>
            </Form>
          </Col>
        </Row>
      </Card>
    </Container>
  );
};

export default VendorProfileEditable;