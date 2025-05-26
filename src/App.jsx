// src/App.jsx
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AppRouter } from './config/router';
import { NotificationProvider } from './store/NotificationContext';
import { UserNotificationProvider } from './store/UserNotificationContext';

function App() {
  return (
    <NotificationProvider>
      <UserNotificationProvider>
        <AppRouter />
        <ToastContainer
          position="top-right"
          autoClose={5000}
          pauseOnHover
          draggable
          theme="light"
        />
      </UserNotificationProvider>
    </NotificationProvider>
  );
}

export default App;