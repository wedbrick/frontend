import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link, useNavigate } from 'react-router-dom';
import { BiArrowToLeft } from 'react-icons/bi';
import axios from 'axios';
import signupImage from '../assets/5.jpg'; // Update path to your image

const VendorRegistration = () => {
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    service: '',
    description: '',
    acceptTerms: false
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('businessName', formData.businessName);
      formDataToSend.append('ownerName', formData.ownerName);
      formDataToSend.append('email', formData.email.toLowerCase());
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('service', formData.service);
      formDataToSend.append('description', formData.description);
      if (logoFile) {
        formDataToSend.append('logo', logoFile);
      }

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/vendor/signup `, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('vendor', JSON.stringify(response.data.vendor));
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        navigate('/vendor-dashboard');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="d-flex p-0" style={{ minHeight: '100vh' }}>
      <Row className="g-0 w-100">
        {/* Left Side Image Section */}
        <Col md={6} className="d-none d-md-block position-relative">
          <div
            style={{
              backgroundImage: `url(${signupImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              height: '100%',
              position: 'relative'
            }}
          >
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(rgba(111, 66, 193, 0.3), rgba(51, 23, 117, 0.5))'
            }}></div>

            <div className="text-white position-absolute top-50 start-50 translate-middle text-center px-3"
              style={{
                width: '90%',
                maxWidth: '800px'
              }}
            >
              <h1 className="display-4 fw-bold mb-4" style={{
                fontFamily: "'Playfair Display', serif",
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
              }}>
                Join Wedbrick Vendors
              </h1>
              <p className="lead fs-5" style={{
                lineHeight: '1.6',
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
              }}>
                Showcase your services to thousands of couples planning their dream weddings. 
                Get access to premium leads, business tools, and marketing support.
              </p>
            </div>
          </div>
        </Col>

        {/* Right Side Form Section */}
        <Col md={6} className="d-flex align-items-center justify-content-center">
          <Card style={{ 
            width: '90%', 
            maxWidth: '800px', 
            padding: '2rem',
            border: 'none',
            backgroundColor: 'transparent'
          }}>
            <Card.Body className="p-0">
              <div className="text-left mb-4">
                <Link 
                  to="/signup" 
                  className="d-flex align-items-center gap-2 text-black text-decoration-none hover-purple"
                >
                  <BiArrowToLeft />
                  Switch to User Register
                </Link>
              </div>

              <h2 className="text-center mb-4" style={{ color: '#6f42c1' }}>Vendor Registration</h2>
              
              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="businessName">
                      <Form.Label>Business Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="ownerName">
                      <Form.Label>Owner Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="ownerName"
                        value={formData.ownerName}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="email">
                      <Form.Label>Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="phone">
                      <Form.Label>Phone Number</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="password">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength={6}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="confirmPassword">
                      <Form.Label>Confirm Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3" controlId="service">
                  <Form.Label>Service</Form.Label>
                  <Form.Select
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a service</option>
                    <option value="marquee">Venue</option>
                    <option value="catering">Catering</option>
                    <option value="photography">Photography</option>
                    <option value="car">Car Rental</option>
                    <option value="other">Other</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3" controlId="description">
                  <Form.Label>Business Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="logo">
                  <Form.Label>Business Logo</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                  />
                  {logoPreview && (
                    <div className="mt-2">
                      <img 
                        src={logoPreview} 
                        alt="Logo preview" 
                        style={{ maxWidth: '150px', maxHeight: '150px' }} 
                        className="img-thumbnail"
                      />
                    </div>
                  )}
                </Form.Group>

                <Form.Group className="mb-3" controlId="acceptTerms">
                  <Form.Check
                    type="checkbox"
                    label="I accept the terms and conditions"
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <div className="d-grid mb-3">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    size="lg" 
                    style={{ 
                      backgroundColor: '#6f42c1', 
                      borderColor: '#6f42c1',
                      fontSize: '1.1rem'
                    }}
                    disabled={loading}
                  >
                    {loading ? 'Registering...' : 'Register as Vendor'}
                  </Button>
                </div>

                <div className="text-center">
                  <p>Already have an account? <Link to="/vendor-login" style={{color: '#6f42c1' }}>Sign In</Link></p>
                </div>
                <div className="text-end mb-3">
              <Link to="/signup">
                <Button 
                  style={{ 
                    color: '#6f42c1', 
                    backgroundColor: 'transparent', 
                    border: 'none', 
                    width: '100%', 
                    marginTop: '10px',
                    transition: 'background-color 0.3s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >             
                  Switch to User Account
                </Button>
              </Link>
            </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default VendorRegistration;