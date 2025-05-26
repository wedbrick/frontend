import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Spinner, Alert, Button } from 'react-bootstrap';
import { FiMessageSquare, FiChevronRight, FiClock } from 'react-icons/fi';
import axios from 'axios';
import moment from 'moment'; // Add moment.js for date formatting

const UserChatList = () => {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get user from localStorage with safety checks
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user?._id;

  useEffect(() => {
    if (!userId) {
      setError('Please login to view your chats');
      setLoading(false);
      return;
    }

    const fetchChats = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/chat/user/${userId}`,
            
        );
        
        // Verify response structure
        if (!Array.isArray(response?.data)) {
          throw new Error('Invalid response format from server');
        }

        // Transform data for consistent structure
        const formattedChats = response.data.map(chat => ({
          ...chat,
          lastMessageDate: chat.lastMessageDate || chat.updatedAt
        }));

        setChats(formattedChats);
      } catch (err) {
        const errorMessage = err.response?.data?.error || err.message;
        setError(`Failed to load chats: ${errorMessage}`);
        console.error('Chat fetch error:', {
          error: err,
          response: err.response,
          config: err.config
        });
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [userId]);

  const handleOpenChat = (chat) => {
    if (!chat?.vendorId?._id) {
      console.error('Invalid chat data:', chat);
      return;
    }

    navigate(`/chat/${chat._id}`, {
      state: {
        chatId: chat._id,
        vendorId: chat.vendorId._id,
        vendorName: chat.vendorId.ownerName,
        currentUser: { 
          _id: userId,
          type: 'user',
          name: user.fullName 
        }
      }
    });
  };

  if (!userId) {
    return (
      <Container className="my-5 text-center">
        <Alert variant="warning">
          <h4>You need to be logged in to view chats</h4>
          <Button 
            variant="primary" 
            className="mt-3"
            onClick={() => navigate('/login')}
          >
            Login Now
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="my-5 chat-list-container">
      <div className="d-flex align-items-center mb-4">
        <FiMessageSquare className="me-2" size={28} />
        <h2 className="mb-0">Your Conversations</h2>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading your chats...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : chats.length === 0 ? (
        <div className="text-center py-5">
          <img 
            src="/empty-chat.svg" 
            alt="No chats" 
            style={{ width: '200px', opacity: 0.7 }}
            className="mb-4"
          />
          <h4>No active conversations</h4>
          <p className="text-muted">Start a chat with your vendors to get updates</p>
        </div>
      ) : (
        chats.map(chat => (
          <Card 
            key={chat._id} 
            className="mb-3 hover-shadow shadow-lg" 
            onClick={() => handleOpenChat(chat)}
            style={{ cursor: 'pointer' }}
          >
            <Card.Body className="d-flex align-items-center justify-content-between">
              <div style={{ flex: 1 }}>
              <p><strong>Chat with:</strong> {chat.vendorId?.ownerName || 'Vendor'}</p>
                <div className="d-flex align-items-center text-muted small mb-2">
                  <FiClock className="me-1" />
                  <span>
                    {moment(chat.lastMessageDate).format('MMM D, h:mm a')}
                  </span>
                </div>
                <p className="mb-0"><strong>Last message: </strong> 
                  {chat.lastMessage ? (
                    <>
                      {chat.lastMessage.length > 80 
                        ? `${chat.lastMessage.substring(0, 80)}...`
                        : chat.lastMessage}
                    </>
                  ) : (
                    <span className="text-muted">Start the conversation</span>
                  )}
                </p>
              </div>
              <FiChevronRight className="text-primary ms-3" size={24} />
            </Card.Body>
          </Card>
        ))
      )}
    </Container>
  );
};

export default UserChatList;