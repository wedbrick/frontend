import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BiArrowToLeft } from 'react-icons/bi';
import signupImage from '../assets/5.jpg'; // Update path to your image

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);

      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/signin`, {
        email: formData.email,
        password: formData.password
      });

      if (data.success) {
        const user = data.user;
        const token = data.token;

     // Always use localStorage
     localStorage.setItem('token', token);
     localStorage.setItem('user', JSON.stringify(user));

        // Redirect based on role
        navigate(user.role === 'vendor' ? '/vendor-dashboard' : '/user-dashboard', {
          state: { userId: user._id }
        });
        
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
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
                Welcome Back to Wedbrick
              </h1>
              <p className="lead fs-5" style={{
                lineHeight: '1.6',
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
              }}>
                Continue your wedding planning journey with access to exclusive vendor connections, 
                personalized checklists, and real-time budget tracking.
              </p>
            </div>
          </div>
        </Col>

        {/* Right Side Form Section */}
        <Col md={6} className="d-flex align-items-center justify-content-center">
          <Card style={{ 
            width: '100%', 
            maxWidth: '500px', 
            padding: '2rem',
            border: 'none',
            backgroundColor: 'transparent'
          }}>
            <Card.Body className="p-0">
              <div className="text-left mb-4">
                <Link 
                  to="/vendor-login" 
                  className="d-flex align-items-center gap-2 text-black text-decoration-none hover-purple"
                >
                  <BiArrowToLeft />
                  Switch to Vendor Login
                </Link>
              </div>

              <h1 className="text-center mb-3" style={{ 
                color: '#6f42c1', 
                fontSize: '2rem',
                fontWeight: '600'
              }}>
                Sign In to Wedbrick
              </h1>
              
              <p className="text-center mb-4 text-muted">
                Access your personalized wedding planning dashboard
              </p>
              
              {error && <Alert variant="danger" className="text-center">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email address"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="password">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                </Form.Group>

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <Form.Group controlId="rememberMe">
                    <Form.Check
                      type="checkbox"
                      label="Remember me"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Link to="/forgot-password" style={{ color: '#6f42c1' }}>
                    Forgot password?
                  </Link>
                </div>

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
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>

                <div className="text-center mt-3">
                  <p className="text-muted">
                    Don't have an account?{' '}
                    <Link to="/signup" style={{ color: '#6f42c1', fontWeight: '500' }}>
                      Create account
                    </Link>
                  </p>
                </div>
                <div className="text-end mb-3">
              <Link to="/vendor-login">
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

export default SignIn;