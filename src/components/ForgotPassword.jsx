import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState('user');
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const type = params.get('type');
    if (type === 'vendor') setUserType('vendor');
  }, [location]);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('/api/auth/request-reset', { 
        email, 
        userType 
      });
      
      setMessage(response.data.message);
    } catch (err) {
      const errorMessage = err.response?.data?.message 
        || err.message 
        || 'Failed to send reset link. Please try again.';
      setError(errorMessage);
      console.error('Error sending reset link:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Card style={{ width: '100%', maxWidth: '500px', padding: '25px' }}>
        <Card.Body>
          <h1 className="text-center mb-3" style={{ color: '#6f42c1' }}>
            Forgot Password
          </h1>

          <Row className="mb-4">
            <Col>
              <Button
                variant={userType === 'user' ? 'primary' : 'outline-primary'}
                onClick={() => setUserType('user')}
                className="w-100"
                style={{ 
                  backgroundColor: userType === 'user' ? '#6f42c1' : 'transparent',
                  borderColor: '#6f42c1',
                  color: userType === 'user' ? 'white' : '#6f42c1'
                }}
              >
                I'm a User
              </Button>
            </Col>
            <Col>
              <Button
                variant={userType === 'vendor' ? 'primary' : 'outline-primary'}
                onClick={() => setUserType('vendor')}
                className="w-100"
                style={{ 
                  backgroundColor: userType === 'vendor' ? '#6f42c1' : 'transparent',
                  borderColor: '#6f42c1',
                  color: userType === 'vendor' ? 'white' : '#6f42c1'
                }}
              >
                I'm a Vendor
              </Button>
            </Col>
          </Row>

          {error && <Alert variant="danger">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}

          <Form onSubmit={handleRequestReset}>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>{userType === 'vendor' ? 'Vendor Email' : 'User Email'}</Form.Label>
              <Form.Control
                type="email"
                placeholder={`Enter your ${userType} email`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
              />
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100 mb-3"
              style={{ backgroundColor: '#6f42c1', borderColor: '#6f42c1' }}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </Form>

          <div className="text-center mt-3">
            <p>Remember your password? {' '}
              <Link 
                to={userType === 'vendor' ? '/vendor-login' : '/signin'} 
                style={{ color: '#6f42c1' }}
              >
                Sign In
              </Link>
            </p>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ForgotPassword;