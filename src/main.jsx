import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store/store.jsx';
import App from './App.jsx';
import { NotificationProvider } from './store/NotificationContext';

let user = null;
try {
  const storedUser = localStorage.getItem('user');
  user = storedUser ? JSON.parse(storedUser) : null;
} catch (err) {
  console.error('❌ Failed to parse user from localStorage:', err);
  user = null;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <NotificationProvider userId={user?._id}>
        <App />
      </NotificationProvider>
    </Provider>
  </StrictMode>
);
