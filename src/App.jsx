import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { FinanceProvider } from './context/FinanceContext';

const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Finance = React.lazy(() => import('./pages/Finance'));
const Journal = React.lazy(() => import('./pages/Journal'));
const Settings = React.lazy(() => import('./pages/Settings'));

function App() {
  return (
    <FinanceProvider>
      <Router>
        <AppLayout>
          <React.Suspense fallback={<div className="p-10">Loading...</div>}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/finance" element={<Finance />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </React.Suspense>
        </AppLayout>
      </Router>
    </FinanceProvider>
  );
}

export default App;
