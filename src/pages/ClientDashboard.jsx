import { Routes, Route } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, ReceiptText } from 'lucide-react';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardLayout from '../components/DashboardLayout';

import Overview from './client/Overview';
import ProjectDetail from './client/ProjectDetail';
import { ClientInvoices, ClientInvoiceView } from './client/Invoices';

const clientNav = [
  { to: '/klien', label: 'Ringkasan', icon: LayoutDashboard, end: true },
  { to: '/klien/proyek', label: 'Proyek Saya', icon: FolderKanban },
  { to: '/klien/tagihan', label: 'Tagihan', icon: ReceiptText },
];

export default function ClientDashboard() {
  return (
    <ProtectedRoute role="client">
      <Routes>
        <Route element={<DashboardLayout roleLabel="Klien" items={clientNav} />}>
          <Route index element={<Overview />} />
          <Route path="proyek" element={<Overview />} />
          <Route path="proyek/:id" element={<ProjectDetail />} />
          <Route path="tagihan" element={<ClientInvoices />} />
          <Route path="tagihan/:id" element={<ClientInvoiceView />} />
        </Route>
      </Routes>
    </ProtectedRoute>
  );
}
