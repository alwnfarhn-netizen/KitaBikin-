import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import Home from './pages/Home';
import Services from './pages/Services';
import Portfolio from './pages/Portfolio';
import Pricing from './pages/Pricing';
import Order from './pages/Order';
import AdminDashboard from './pages/AdminDashboard';
import ClientDashboard from './pages/ClientDashboard';
import NotFound from './pages/NotFound';

import './App.css';

// Komponen pembungkus untuk halaman publik agar rapi
const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    <main>{children}</main>
    <Footer />
    <FloatingWhatsApp />
  </>
);

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* Halaman Publik */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/layanan" element={<PublicLayout><Services /></PublicLayout>} />
          <Route path="/portofolio" element={<PublicLayout><Portfolio /></PublicLayout>} />
          <Route path="/harga" element={<PublicLayout><Pricing /></PublicLayout>} />
          <Route path="/order" element={<PublicLayout><Order /></PublicLayout>} />
          
          {/* Dashboard */}
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="/client/*" element={<ClientDashboard />} />
          
          {/* Halaman 404 */}
          <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
