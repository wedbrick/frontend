import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../store/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const NotificationsDropdown = () => {
  const { notifications, setNotifications, setUnreadCount } = useNotification();
  const navigate = useNavigate();

  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/mark-read/${notification._id}`, {
        method: 'PUT'
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => 
            n._id === notification._id 
              ? { ...n, isRead: true } 
              : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      // Handle navigation
    if (notification.type === 'message') {
      navigate('/vendor-chats');
    } else if (notification.link) {
      navigate(notification.link);
    } else {
      // Handle other notification types
      switch(notification.type) {
        case 'booking':
          navigate('/vendor-bookings');
          break;
        default:
          navigate('/');
      }
    }
  } catch (err) {
    console.error('Error handling notification click:', err);
  }
  };

  return (
    <>
      <Dropdown.Header>Recent Notifications</Dropdown.Header>
      {notifications.length === 0 ? (
        <Dropdown.Item disabled>No notifications found</Dropdown.Item>
      ) : (
        notifications.map((notification) => (
          <Dropdown.Item
            key={notification._id}
            onClick={() => handleNotificationClick(notification)}
            className={!notification.isRead ? 'fw-bold bg-light' : ''}
          >
            <div className="d-flex justify-content-between align-items-center">
              <span>{notification.message}</span>
              <small className="text-muted ms-2">
                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
              </small>
            </div>
          </Dropdown.Item>
        ))
      )}
    </>
  );
};

export default NotificationsDropdown;