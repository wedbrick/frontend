import React from 'react';
const TypingIndicator = ({ isTyping }) => {
  return isTyping ? <p className="typing-indicator">Vendor is typing...</p> : null;
};
export default TypingIndicator;