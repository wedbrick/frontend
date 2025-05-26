// src/components/MessageItem.jsx
import React from 'react';
import moment from 'moment';

const MessageItem = ({ message, isOwn }) => {
  return (
    <div style={{ textAlign: isOwn ? 'right' : 'left', margin: '12px 0' }}>
      <div
        style={{
          display: 'inline-block',
          backgroundColor: isOwn ? '#6f42c1' : '#f1f1f1',
          color: isOwn ? 'white' : 'black',
          padding: '12px 16px',
          borderRadius: '15px',
          maxWidth: '70%',
          boxShadow: '0 2px 4px rgba(15, 12, 12, 0.1)'
        }}
      >
        <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
          {message.content}
        </div>
        <div style={{ 
          fontSize: '0.8em',
          marginTop: '8px',
          opacity: 0.8,
          color: isOwn ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.6)'
        }}>
          {moment(message.createdAt).format('h:mm A')} • {message.read ? 'Seen' : 'Delivered'}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;