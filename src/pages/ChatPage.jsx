import React from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import ChatWindow from '../components/ChatWindow';
import { FiArrowLeft } from 'react-icons/fi';

const ChatPage = () => {
  const location = useLocation();
  const { id: chatIdFromUrl } = useParams();
  const navigate = useNavigate();

  const currentUser = location.state?.currentUser;
  const vendorId = location.state?.vendorId;
  const chatId = location.state?.chatId || chatIdFromUrl;

  const userId = currentUser?._id;
  const isVendor = currentUser?.role === 'vendor';

  const handleGoBack = () => {
    navigate(-1);
  };

  if (!userId || !vendorId || !chatId) {
    return (
      <div className="container mt-5 text-center text-danger">
        <h4>❌ Missing chat information. Please return to the previous page.</h4>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div style={{ maxWidth: '400px', margin: '0 auto', position: 'relative' }}>
        <div className="d-flex align-items-center mb-4">
          {/* Back arrow with circular background - Left aligned */}
          <div 
            className="rounded-circle d-flex align-items-center justify-content-center"
            onClick={handleGoBack}
            style={{
              cursor: 'pointer',
              backgroundColor: '#f8f9fa',
              padding: '8px',
              width: '40px',
              height: '40px',
              transition: 'all 0.2s ease',
              position: 'absolute', // Position absolutely
              left: '-2px' // Adjust position as needed
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#e9ecef';
              e.currentTarget.querySelector('svg').style.transform = 'translateX(-3px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#f8f9fa';
              e.currentTarget.querySelector('svg').style.transform = 'translateX(0)';
            }}
          >
            <FiArrowLeft 
              style={{
                fontSize: '1.25rem',
                color: '#6f42c1'
              }}
            />
          </div>
          
          {/* Centered text */}
          <div className="w-100 text-center">
            <h3 className="m-0">Direct Messaging</h3>
          </div>
        </div>
        <ChatWindow userId={userId} vendorId={vendorId} chatId={chatId} isVendor={isVendor} />
      </div>
    </div>
  
  );
};

export default ChatPage;