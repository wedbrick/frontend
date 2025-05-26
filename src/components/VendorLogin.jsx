import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BiArrowToLeft } from 'react-icons/bi';
import axios from 'axios';
import signupImage from '../assets/5.jpg'; // Update path to your image

const VendorLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/vendor/signin`, {
        email: email.toLowerCase().trim(),
        password
      });

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('vendor', JSON.stringify(response.data.vendor));
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        navigate('/vendor-dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
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
              height: '100vh',
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
                Welcome Back, Wedding Professionals
              </h1>
              <p className="lead fs-5" style={{
                lineHeight: '1.6',
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
              }}>
                Access your business dashboard to manage bookings, connect with couples,
                and grow your wedding services business.
              </p>
            </div>
          </div>
        </Col>

        {/* Right Side Form Section */}
        <Col md={6} className="d-flex align-items-center justify-content-center">
          <Card style={{ 
            width: '100%', 
            maxWidth: '500px', 
            padding: '25px',
            border: 'none',
            backgroundColor: 'transparent'
          }}>
            <Card.Body>
              <div className="text-left mt-4 mb-4">
                <Link to="/signin" className="d-flex align-items-center gap-2 text-black text-decoration-none hover-purple">
                  <BiArrowToLeft />
                  Switch to User Login
                </Link>
              </div>
              
              <h1 className="text-center mb-3" style={{ color: '#6f42c1', fontWeight: 'bold' }}>
                Vendor Login
              </h1>

              <p className="text-center mb-4 text-muted">
                Access your dashboard
              </p>

              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="password">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Row className="mb-3 align-items-center">
                  <Col xs={6}>
                    <Form.Check
                      type="checkbox"
                      label="Remember me"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                  </Col>
                  <Col xs={6} className="text-end">
                    <Link to="/forgot-password?type=vendor" style={{ color: '#6f42c1', textDecoration: 'none' }}>
                      Forgot Password?
                    </Link>
                  </Col>
                </Row>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 mb-3"
                  style={{
                    backgroundColor: '#6f42c1',
                    borderColor: '#6f42c1',
                    fontWeight: 'bold'
                  }}
                  disabled={loading}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </Form>

              <div className="text-center mt-3">
                <p>
                  Don't have an account?{' '}
                  <Link to="/vendor-registration" style={{ color: '#6f42c1' }}>
                    Sign Up Here
                  </Link>
                </p>
              </div>

              <div className="text-end mb-3">
                <Link to="/signin">
                  <Button
                    style={{
                      color: '#6f42c1',
                      backgroundColor: 'transparent',
                      border: 'none',
                      width: '100%',
                      marginTop: '10px',
                      transition: 'background-color 0.3s ease'
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    Switch to User Account
                  </Button>
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default VendorLogin;