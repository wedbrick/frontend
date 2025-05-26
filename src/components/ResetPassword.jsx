import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Form, Alert, Container, Card } from 'react-bootstrap';
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Extract token and userType from URL and store in localStorage
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userType = params.get('id');

    if (token && userType) {
      localStorage.setItem('resetToken', token);
      localStorage.setItem('userType', userType);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      setLoading(true);
      setError('');
      
      // Retrieve from localStorage
      const token = localStorage.getItem('resetToken');
      const userType = localStorage.getItem('userType');
console.log('Token:', token, 'UserType:', userType);
      // First validate the token
      await axios.post(`${API_URL}/api/auth/validate-token`, {
        token,
        userType
      });

      // Then update password
      const response = await axios.post(`${API_URL}/api/auth/update-password`, {
        token,
        newPassword,
        userType
      });

      setMessage(response.data.message);
      
      // Clear storage and redirect after success
      localStorage.removeItem('resetToken');
      localStorage.removeItem('userType');
      setTimeout(() => navigate(userType === 'vendor' ? '/vendor-login' : '/signin'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Card style={{ width: '100%', maxWidth: '500px', padding: '25px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
        <Card.Body>
          <h2 className="text-center mb-4">Reset Password</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Button
              className="w-100"
              type="submit"
              disabled={loading}
              style={{ backgroundColor: '#6f42c1', borderColor: '#6f42c1' }}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ResetPassword;
