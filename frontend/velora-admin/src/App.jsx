import { Routes, Route } from "react-router-dom";
import AdminLayout from "./components/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import EnquiryManagement from "./pages/EnquiryManagement";
import WebsiteLeads from "./pages/WebsiteLeads";
import Clients from "./pages/Clients";
import Projects from "./pages/Projects";
import TaskManagement from "./pages/TaskManagement";
import EstimateManager from "./pages/EstimateManager";
import QuotationInvoiceManager from "./pages/QuotationInvoiceManager";
import ProductionFactory from "./pages/ProductionFactory";
import InventoryMaterials from "./pages/InventoryMaterials";
import InstallationManager from "./pages/InstallationManager";
import SiteVisits from "./pages/SiteVisits";
import CalendarView from "./pages/CalendarView";
import PaymentsManager from "./pages/PaymentsManager";
import ReportsAnalytics from "./pages/ReportsAnalytics";
import NotificationsCenter from "./pages/NotificationsCenter";
import UserManagement from "./pages/UserManagement";
import ActivityAuditLogs from "./pages/ActivityAuditLogs";

function App() {
  return (
    <Routes>
      {/* Public Auth Portal */}
      <Route path="/login" element={<Login />} />

      {/* Protected Velora Luxury ERP Suite */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/enquiry" element={<EnquiryManagement />} />
                <Route path="/enquiry/add" element={<EnquiryManagement />} />
                <Route path="/leads" element={<EnquiryManagement />} />
                <Route path="/website-leads" element={<WebsiteLeads />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/tasks" element={<TaskManagement />} />
                <Route path="/estimates" element={<EstimateManager />} />
                <Route path="/boq" element={<EstimateManager />} />
                <Route path="/invoices" element={<QuotationInvoiceManager />} />
                <Route path="/factory" element={<ProductionFactory />} />
                <Route path="/inventory" element={<InventoryMaterials />} />
                <Route path="/installation" element={<InstallationManager />} />
                <Route path="/site-visits" element={<SiteVisits />} />
                <Route path="/calendar" element={<CalendarView />} />
                <Route path="/payments" element={<PaymentsManager />} />
                <Route path="/reports" element={<ReportsAnalytics />} />
                <Route path="/notifications" element={<NotificationsCenter />} />
                <Route path="/users" element={<UserManagement />} />
                <Route path="/logs" element={<ActivityAuditLogs />} />
              </Routes>
            </AdminLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
