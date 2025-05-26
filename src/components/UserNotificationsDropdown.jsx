import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useUserNotification } from '../store/UserNotificationContext';
import { formatDistanceToNow } from 'date-fns';

const UserNotificationsDropdown = () => {
  const { notifications, setNotifications, setUnreadCount } = useUserNotification();
  const navigate = useNavigate();

  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/mark-read/${notification._id}`, {
        method: 'PUT'
      });
      
      if (response.ok) {
        // Update notifications state to mark as read
        setNotifications(prev => 
          prev.map(n => 
            n._id === notification._id 
              ? { ...n, isRead: true } 
              : n
          )
        );
        
        // Update unread count
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      // Navigate to my bookings page
      navigate('/my-bookings');
    } catch (err) {
      console.error('Error handling notification click:', err);
    }
  };

  return (
    <>
      {notifications.length === 0 ? (
        <Dropdown.Item disabled>No notifications</Dropdown.Item>
      ) : (
        notifications.map(notification => (
          <Dropdown.Item 
            key={notification._id}
            onClick={() => handleNotificationClick(notification)}
            className={notification.isRead ? '' : 'fw-bold'}
            style={{ 
              backgroundColor: notification.isRead ? 'transparent' : '#f0f8ff',
              borderBottom: '1px solid #eee',
              padding: '10px 15px'
            }}
          >
            <div className="d-flex flex-column">
              <span>{notification.message}</span>
              <small className="text-muted mt-1">
                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
              </small>
            </div>
          </Dropdown.Item>
        ))
      )}
    </>
  );
};

export default UserNotificationsDropdown; 