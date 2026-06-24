import { Routes, Route, Navigate } from 'react-router-dom'
import Splash from '@/components/pages/Splash'
import LoginPage from '@/components/pages/LoginPage'
import RegisterPage from '@/components/pages/RegisterPage'
import PlansPage from '@/components/pages/PlansPage'
import SetupStep1 from '@/components/pages/SetupStep1'
import SetupStep2 from '@/components/pages/SetupStep2'
import AppLayout from '@/components/pages/app/AppLayout'
import HomeTab from '@/components/pages/app/HomeTab'
import ReportsTab from '@/components/pages/app/ReportsTab'
import InventoryTab from '@/components/pages/app/InventoryTab'
import AITab from '@/components/pages/app/AITab'
import ProfileTab from '@/components/pages/app/ProfileTab'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/splash" replace />} />
      <Route path="/splash" element={<Splash />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/plans" element={<PlansPage />} />
      <Route path="/setup/step-1" element={<SetupStep1 />} />
      <Route path="/setup/step-2" element={<SetupStep2 />} />
      <Route path="/app" element={<AppLayout />}>
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<HomeTab />} />
        <Route path="reports" element={<ReportsTab />} />
        <Route path="inventory" element={<InventoryTab />} />
        <Route path="ai" element={<AITab />} />
        <Route path="profile" element={<ProfileTab />} />
      </Route>
      <Route path="*" element={<div className="p-6 text-center text-gray-400 text-sm">Page not found</div>} />
    </Routes>
  )
}
