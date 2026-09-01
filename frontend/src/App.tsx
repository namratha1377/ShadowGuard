import { Routes, Route } from 'react-router-dom';
import { DashboardPage } from './pages/DashboardPage';
import { AIActivityPage } from './pages/AIActivityPage';
import { RiskAssessmentPage } from './pages/RiskAssessmentPage';
import { DataSecurityPage } from './pages/DataSecurityPage';
import { PoliciesPage } from './pages/PoliciesPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/ai-activity" element={<AIActivityPage />} />
      <Route path="/risk-assessment" element={<RiskAssessmentPage />} />
      <Route path="/data-security" element={<DataSecurityPage />} />
      <Route path="/policies" element={<PoliciesPage />} />
      <Route path="/audit-logs" element={<AuditLogsPage />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  );
}
