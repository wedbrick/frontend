import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaCalendarAlt } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BiArrowToLeft } from 'react-icons/bi';
import signupImage from '../assets/5.jpg'; 

const SignUp = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    weddingDate: null,
    acceptTerms: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Keep all your existing handler functions exactly the same
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      weddingDate: date
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (!formData.acceptTerms) {
      setError('You must accept the terms and conditions');
      return;
    }

    try {
      setLoading(true);
      
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/signup`, {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        weddingDate: formData.weddingDate
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/user-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const CustomDateInput = React.forwardRef(({ value, onClick }, ref) => (
    <div className="input-group">
      <input
        type="text"
        className="form-control"
        value={value}
        onClick={onClick}
        ref={ref}
        placeholder="dd/mm/yyyy"
        readOnly
      />
      <span className="input-group-text" onClick={onClick} style={{ cursor: 'pointer' }}>
        <FaCalendarAlt />
      </span>
    </div>
  ));

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
            {/* Gradient Overlay */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(rgba(111, 66, 193, 0.3), rgba(51, 23, 117, 0.5))'
            }}></div>

            {/* Text Overlay */}
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
                Start Your Journey With Wedbrick
              </h1>
              <p className="lead fs-5" style={{
                lineHeight: '1.6',
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
              }}>
                Create your perfect wedding story with our curated network of vendors and planning tools. 
                Join thousands of couples who found their dream wedding partners through Wedbrick.
              </p>
            </div>
          </div>
        </Col>

        {/* Right Side Form Section */}
        <Col md={6} className="d-flex align-items-center justify-content-center bg-light">
          <Card style={{ 
            width: '100%', 
            maxWidth: '550px', 
            padding: '2rem',
            border: 'none',
            backgroundColor: 'transparent' 
          }}>
            <Card.Body>
              <div className="text-left mb-4">
                <Link 
                  to="/vendor-registration" 
                  className="d-flex align-items-center gap-2 text-black text-decoration-none hover-purple"
                >
                  <BiArrowToLeft />
                  Switch to Vendor Register
                </Link>
              </div>

              <Card.Title className="text-center mb-4" style={{ 
                color: '#6f42c1', 
                fontSize: '2rem',
                fontWeight: '600'
              }}>
                Create Your Wedbrick Account
              </Card.Title>
              
              {error && <Alert variant="danger" className="text-center">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                {/* Keep all your existing Form Groups exactly the same */}
                <Form.Group className="mb-3" controlId="fullNameAndEmail">
                  <Row>
                    <Col md={6}>
                      <Form.Label>Full Name</Form.Label>
                      <Form.Control 
                        type="text" 
                        placeholder="Enter your full name" 
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Label>Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Enter email address"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                      />
                    </Col>
                  </Row>
                </Form.Group>

                <Form.Group className="mb-3" controlId="passwordGroup">
                  <Form.Label>Password</Form.Label>
                  <Row>
                    <Col md={6}>
                      <Form.Control 
                        type="password" 
                        placeholder="Enter password" 
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength={6}
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Control 
                        type="password" 
                        placeholder="Confirm password" 
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                    </Col>
                  </Row>
                </Form.Group>

                <Form.Group className="mb-3" controlId="phoneNumber">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control 
                    type="tel" 
                    placeholder="Enter phone number" 
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="weddingDate">
                  <Form.Label className="d-block mb-2">Wedding Date</Form.Label>
                  <DatePicker
                    selected={formData.weddingDate}
                    onChange={handleDateChange}
                    customInput={<CustomDateInput />}
                    dateFormat="dd/MM/yyyy"
                    minDate={new Date()}
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="acceptTerms">
                  <Form.Check 
                    type="checkbox"
                    label="I accept terms and conditions"
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 mb-3 py-2"
                  style={{ 
                    backgroundColor: '#6f42c1', 
                    borderColor: '#6f42c1',
                    fontSize: '1.1rem'
                  }}
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </Button>

                <div className="text-center mb-4">
                  <p className="text-muted">
                    Already have an account?{' '}
                    <Link to="/signin" style={{ color: '#6f42c1', fontWeight: '500' }}>
                      Sign in
                    </Link>
                  </p>
                </div>
                <div className="text-end mb-3">
              <Link to="/vendor-registration">
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
                  Switch to Vendor Account
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

export default SignUp;