import React from 'react';
import { Button, Container, Card } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const SignOutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine if coming from vendor dashboard
  const isFromVendorDashboard = location.state?.fromVendor || false;

  const handleSignOut = () => {
    // Add any logout logic here (clearing tokens, etc.)
    localStorage.removeItem('userToken');
    localStorage.removeItem('vendorToken');
    navigate('/signin');
  };

  const handleCancel = () => {
    navigate(-1); // Go back to previous page
  };

  const handleReturnToDashboard = () => {
    if (isFromVendorDashboard) {
      navigate('/vendor-dashboard');
    } else {
      navigate('/user-dashboard');
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Card style={{ width: '100%', maxWidth: '500px', padding: '2rem',    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)', // Enhanced shadow
    border: 'none'}} className="text-center shadow-lg">
        {/* Heading */}
        <h1 style={{ color: '#6f42c1', marginBottom: '1.5rem' }}>Sign Out</h1>
        
        {/* Confirmation message */}
        <p className="mb-4">Are you sure you want to log out?</p>
        
        {/* Sign Out Button */}
        <Button
          variant="primary"
          className="w-100 mb-3"
          style={{ 
            backgroundColor: '#6f42c1', 
            borderColor: '#6f42c1',
            padding: '0.5rem',
            fontSize: '1.1rem'
          }}
          onClick={handleSignOut}
        >
          Yes, Sign Out
        </Button>
        
        {/* Cancel Button */}
        <Button
          variant="outline-secondary"
          className="w-100 mb-4"
          style={{ 
            padding: '0.5rem',
            fontSize: '1.1rem'
          }}
          onClick={handleCancel}
        >
          Cancel
        </Button>
        
        {/* Dynamic Return to Dashboard Link */}
        <div 
          style={{ 
            color: '#6f42c1', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
          onClick={handleReturnToDashboard}
        >
          <FiArrowLeft />
          <span>Return to {isFromVendorDashboard ? 'Vendor' : 'User'} Dashboard</span>
        </div>
      </Card>
    </Container>
  );
};

export default SignOutPage;