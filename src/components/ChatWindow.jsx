// src/components/ChatWindow.jsx
import React, { useEffect, useState, useRef } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
import socket from '../utils/socket';
import MessageItem from './MessageItem';

const ChatWindow = ({ userId, vendorId, chatId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const chatBoxRef = useRef(null);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  useEffect(() => {
    socket.connect();
    socket.emit('joinRoom', { chatId });

    const handleConnect = () => {
    socket.emit('joinRoom', { chatId });
  };

  // Join room once connected
  if (socket.connected) {
    handleConnect();
  } else {
    socket.once('connect', handleConnect);
  }

    const fetchMessages = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/${chatId}/messages`);
        const data = await res.json();
        setMessages(data);
        socket.emit('markSeen', { chatId, userId });
      } catch (err) {
        console.error('Failed to load messages', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    const handleReceiveMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
      socket.emit('markSeen', { chatId, userId });
    };
   

    const handleTyping = ({ sender }) => {
      if (sender !== userId) {
        setTyping(true);
        setTimeout(() => setTyping(false), 1500);
      }
    };

    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('typing', handleTyping);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('typing', handleTyping);
      socket.disconnect();
    };
  }, [chatId, userId]);

  const handleSend = async () => {
    if (!input.trim()) return;


    try {
      // // ✅ Save message to DB
      await fetch(`${import.meta.env.VITE_API_URL}/api/chat/${chatId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId,
          sender: userId,
          content: input,
          vendorId,
        }
        ),
      });

      // ✅ Let Socket.IO handle the real-time update
      socket.emit('sendMessage', {
        chatId,
        message: input,
        senderId: userId,
        // receiverId: vendorId,
        vendorId,
      }
      );

      setInput('');
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  const handleTyping = () => {
    socket.emit('typing', { chatId, sender: userId });
  };

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="p-3 border  shadow-lg rounded-4" style={{ 
      height: '80vh',
      maxWidth: '450px',
      margin: '0 auto',
      backgroundColor: '#ffffff',
      display: 'flex', 
      flexDirection: 'column',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }}>
      <div ref={chatBoxRef} className="flex-grow-1 overflow-auto mb-3 p-3 rounded-3" style={{ 
          backgroundColor: '#f8f9fa',
          border: '1px solid #e9ecef'
        }}>
        {loading ? (
           <div className="text-center">
             <Spinner animation="border" variant="primary" />
             </div>
        ) : (
          messages.map((msg, idx) => (
            <MessageItem key={idx} message={msg} isOwn={msg.sender === userId} />
          ))
        )}
        {typing &&  <div className="text-muted mt-2" style={{ fontSize: '0.9em' }}>
            <i className="fas fa-circle-notch fa-spin me-2" />
            Vendor is typing...
          </div>}
      </div>

      <div className="d-flex gap-2  align-items-center">
        <Form.Control
          as="textarea"  // Changed to textarea
          rows={1}
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            handleKeyPress(e);
            handleTyping();
          }}
          style={{
            borderRadius: '20px',
            resize: 'none',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
            border: '1px solid #ced4da'
          }}
        />
         <Button 
  onClick={handleSend} 
  style={{
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    padding: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6f42c1', // Purple color
    border: 'none',
    transition: 'all 0.3s ease'
  }}
  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#5a32a3'}
  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6f42c1'}
  onMouseDown={(e) => e.currentTarget.style.backgroundColor = '#4a2b8a'}
  onMouseUp={(e) => e.currentTarget.style.backgroundColor = '#6f42c1'}
>
  <i 
    className="bi bi-send" 
    style={{ 
      color: 'white',
      fontSize: '1.3rem',
      lineHeight: 1
    }} 
  />
</Button>
      </div>
    </div>
  );
};

export default ChatWindow;
