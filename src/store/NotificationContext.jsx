// store/NotificationContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import socket from '../utils/socket'; // adjust this path if needed
import { toast } from 'react-toastify';

const NotificationContext = createContext(); // ✅ define it here

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Get vendor ID from localStorage
    const vendor = JSON.parse(localStorage.getItem('vendor') || '{}');
    const vendorId = vendor._id;

    if (!vendorId) return;

    // Function to fetch notifications
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/${vendorId}/Vendor`);
        if (!response.ok) throw new Error('Failed to fetch notifications');
        const data = await response.json();
        setNotifications(data);
        // Set unread count
        const unreadCount = data.filter(notification => !notification.isRead).length;
        setUnreadCount(unreadCount);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    // Register vendor for socket notifications
    socket.emit('registerVendor', vendorId);

    // Handle new notifications
    const handleNewNotification = (notification) => {
      // Check if notification already exists to prevent duplicates
      setNotifications(prev => {
        if (prev.some(n => n._id === notification._id)) {
          return prev;
        }
        return [notification, ...prev];
      });
      
      setUnreadCount(prev => prev + 1);

      // Show toast notification
      toast.info(notification.message, {
        position: 'top-right',
        autoClose: 5000,
        onClick: () => {
          window.location.href = notification.link;
        },
        toastId: notification._id // Prevent duplicate toasts
      });
    };

    // Initial fetch
    fetchNotifications();

    // Socket event listeners
    socket.on('newNotification', handleNewNotification);

    // Cleanup
    return () => {
      socket.off('newNotification', handleNewNotification);
    };
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      await fetch(`/api/notifications/mark-read/${localStorage.getItem('userId')}`, { method: 'PUT' });
      setUnreadCount(0);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        setNotifications,
        setUnreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
