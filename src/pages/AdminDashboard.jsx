import { Routes, Route } from 'react-router-dom';
import { LayoutDashboard, Megaphone, FolderKanban, Users, Receipt } from 'lucide-react';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardLayout from '../components/DashboardLayout';

import Overview from './admin/Overview';
import Leads from './admin/Leads';
import Projects from './admin/Projects';
import ProjectDetail from './admin/ProjectDetail';
import Clients from './admin/Clients';
import Invoices from './admin/Invoices';
import InvoiceView from './admin/InvoiceView';

const adminNav = [
  { to: '/admin', label: 'Ringkasan', icon: LayoutDashboard, end: true },
  { to: '/admin/leads', label: 'Leads', icon: Megaphone },
  { to: '/admin/proyek', label: 'Proyek', icon: FolderKanban },
  { to: '/admin/klien', label: 'Klien', icon: Users },
  { to: '/admin/kasir', label: 'Kasir & Tagihan', icon: Receipt },
];

export default function AdminDashboard() {
  return (
    <ProtectedRoute role="admin">
      <Routes>
        <Route element={<DashboardLayout roleLabel="Admin" items={adminNav} />}>
          <Route index element={<Overview />} />
          <Route path="leads" element={<Leads />} />
          <Route path="proyek" element={<Projects />} />
          <Route path="proyek/:id" element={<ProjectDetail />} />
          <Route path="klien" element={<Clients />} />
          <Route path="kasir" element={<Invoices />} />
          <Route path="kasir/:id" element={<InvoiceView />} />
        </Route>
      </Routes>
    </ProtectedRoute>
  );
}
