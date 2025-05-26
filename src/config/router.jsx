// src/config/router.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignUp from '../components/SignUp';
import SignIn from '../components/SignIn';
import ForgotPassword from '../components/ForgotPassword';
import UserProfile from '../components/userProfile';  // Import the profile component
import Home from '../components/LandingPage'; // Import the landing page component
import VendorRegistration from '../components/VendorReg';
import VendorLogin from '../components/VendorLogin'; // Import the vendor login component
import UserDashboard from '../components/UserDashboard';
import PackagesPage from '../components/PackagesPage';
import SignOutPage from '../components/SignOut';
import VendorDashboard from '../components/VendorDasboard';
import VendorProfileEditable from '../components/VendorProfileEditable';
import VendorProfileViewOnly from '../components/VendorProfileViewOnly';
import MyBookings from '../components/MyBooking';
import VendorBookings from '../components/VendorBookings';
import ChatPage from './../pages/ChatPage'; // Import the chat component
import ChatWindow from '../components/ChatWindow'; // Import the chat window wrapper
import VendorChatList from '../components/VendorChatList'; // Import the chat list component
import ResetPassword from '../components/ResetPassword';
import UserLayout from '../components/UserLayout';
import VendorLayout from '../components/VendorLayout';
import VendorPackages from '../components/VendorPackages';
import UserChatList from '../components/UserChatList';
import AddService from '../components/AddServices';
export const AppRouter = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/vendor-registration" element={<VendorRegistration />} />
          <Route path="/vendor-login" element={<VendorLogin />} />
          <Route path="/signout" element={<SignOutPage />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/chat/:chatId" element={<ChatPage />} />
          <Route path="/add-service" element={<AddService />} />
          {/* Vendor Routes with Layout */}
          <Route element={<VendorLayout />}>
            <Route path="/vendor-dashboard" element={<VendorDashboard />} />
            <Route path="/vendor-packages" element={<VendorPackages />} />
            <Route path="/vendor-profile-editable" element={<VendorProfileEditable />} />
           
            <Route path="/vendor-bookings" element={<VendorBookings />} />
            <Route path="/vendor-chats" element={<VendorChatList />} />
            
          </Route>

          {/* User Routes with Layout */}
          <Route element={<UserLayout />}>
            <Route path="/user-dashboard" element={<UserDashboard />} />
            <Route path="/packages" element={<PackagesPage />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/user/chats" element={<UserChatList />} />
            <Route path="/vendor-profile/:id" element={<VendorProfileViewOnly />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
};