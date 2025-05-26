import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Card, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';

const VendorChatList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // const vendorId = location.state?.vendorId;
  const vendor= JSON.parse(localStorage.getItem('vendor') || '{}');
  const vendorId= vendor._id;

  
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!vendorId) {
      setError('No vendor ID provided.');
      setLoading(false);
      return;
    }

    const fetchChats = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/chat/vendor/${vendorId}`);
        setChats(res.data);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to load chats.');
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [vendorId]);

  const handleOpenChat = (chat) => {
    navigate(`/chat/${chat._id}`, {
      state: {
        chatId: chat._id,
        vendorId: chat.vendorId,
        userId: chat.userId?._id,
        currentUser: { _id: vendorId }
      }
    });
  };

  return (
    <Container className="my-5">
      <h2 className="mb-4" style={{ color: '#6f42c1' }}>📬 Your Chats</h2>

      {loading ? (
        <Spinner animation="border" />
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : chats.length === 0 ? (
        <Alert variant="info">No chats found.</Alert>
      ) : (
        chats.map(chat => (
          <Card
            key={chat._id}
            className="mb-3 hover-shadow shadow-lg"
            style={{ cursor: 'pointer' }}
            onClick={() => handleOpenChat(chat)}
          >
            <Card.Body>
              <p><strong>Chat with:</strong> {chat.userId?.fullName || chat.userId?.email || 'User'}</p>
              <p><strong>Last message:</strong> {
                chat.lastMessage
                  ? chat.lastMessage.length > 100
                    ? chat.lastMessage.slice(0, 100) + '...'
                    : chat.lastMessage
                  : 'No messages yet'
              }</p>
            </Card.Body>
          </Card>
        ))
      )}
    </Container>
  );
};

export default VendorChatList;
