import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Toast from './components/Toast';
import Home from './pages/common/Home';
import Signup from './pages/common/Signup';
import LoginCustomer from './pages/common/LoginCustomer';
import LoginStaff from './pages/common/LoginStaff';
import ForgotPassword from './pages/common/ForgotPassword';
import Book from './pages/common/Book';
import AboutUs from './pages/common/AboutUs';
import Contact from './pages/common/Contact';
import FAQs from './pages/common/FAQs';
import ReviewsPage from './pages/common/ReviewsPage';
import PaymentSuccess from './pages/common/PaymentSuccess';
import PaymentFailed from './pages/common/PaymentFailed';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCustomer from './pages/admin/AdminCustomer';
import AdminUser from './pages/admin/AdminUser';
import AdminBooking from './pages/admin/AdminBooking';
import AdminSchedule from './pages/admin/AdminSchedule';
import AdminServices from './pages/admin/AdminServices';
import AdminMessage from './pages/admin/AdminMessage';
import AdminAbout from './pages/admin/AdminAbout';
import AdminContact from './pages/admin/AdminContact';
import AdminFAQs from './pages/admin/AdminFAQs';
import AdminAccount from './pages/admin/AdminAccount';
import AdminUserAccounts from './pages/admin/AdminUserAccounts';
import AdminDates from './pages/admin/AdminDates';
import AdminReview from './pages/admin/AdminReview';
import AdminTech from './pages/admin/AdminTech';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerBooking from './pages/customer/CustomerBooking';
import MangagerDashboard from './pages/manager/ManagerDashboard';
import ManagerCustomer from './pages/manager/ManagerCustomer';
import ManagerSchedule from './pages/manager/ManagerSchedule';
import ManagerBooking from './pages/manager/ManagerBooking';
import ManagerAbout from './pages/manager/ManagerAbout';
import ManagerContact from './pages/manager/ManagerContact';
import ManagerAccount from './pages/manager/ManagerAccount';
import TechDashboard from './pages/technician/TechDashboard';
import TechSchedule from './pages/technician/TechSchedule';
import TechAbout from './pages/technician/TechAbout';
import TechContact from './pages/technician/TechContact';
import TechAccount from './pages/technician/TechAccount';
import AdminGallery from './pages/admin/AdminGallery';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<LoginCustomer />} />
        <Route path="/staff/login" element={<LoginStaff />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/services" element={<Book />} />
        <Route path="/aboutus" element={<AboutUs />} />
        <Route path="/contactus" element={<Contact />} />
        <Route path="/faqs" element={<FAQs />} />
        <Route path="/reviews" element={<ReviewsPage />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-failed" element={<PaymentFailed />} />
        <Route path="/admin">
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="customers" element={<AdminCustomer />} />
          <Route path="users" element={<AdminUser />} />
          <Route path="bookings" element={<AdminBooking />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="schedule" element={<AdminSchedule />} />
          <Route path="messages" element={<AdminMessage />} />
          <Route path="about" element={<AdminAbout />} />
          <Route path="contact" element={<AdminContact />} />
          <Route path="faqs" element={<AdminFAQs />} />
          <Route path="account-settings" element={<AdminAccount />} />
          <Route path="user-accounts" element={<AdminUserAccounts />} />
          <Route path="blocked-dates" element={<AdminDates />} />
          <Route path="reviews" element={<AdminReview />} />
          <Route path="gallery" element={<AdminGallery />} />
          <Route path="technician" element={<AdminTech />} />
        </Route>
        <Route path="/customer">
          <Route path="dashboard" element={<CustomerDashboard />} />
          <Route path="bookings" element={<CustomerBooking />} />
        </Route>
        <Route path="/manager">
          <Route path="dashboard" element={<MangagerDashboard />} />
          <Route path="customers" element={<ManagerCustomer />} />
          <Route path="bookings" element={<ManagerBooking />} />
          <Route path="schedule" element={<ManagerSchedule />} />
          <Route path="about" element={<ManagerAbout />} />
          <Route path="contact" element={<ManagerContact />} />
          <Route path="account" element={<ManagerAccount />} />
        </Route>
        <Route path="/technician">
          <Route path="dashboard" element={<TechDashboard />} />
          <Route path="schedule" element={<TechSchedule />} />
          <Route path="about" element={<TechAbout />} />
          <Route path="contact" element={<TechContact />} />
          <Route path="account" element={<TechAccount />} />
        </Route>
      </Routes>
      <Toast/>
    </Router>
  );
};

export default App;
