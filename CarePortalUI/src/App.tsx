import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider, useData } from './contexts/DataContext';
import LoginForm from './components/LoginForm';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import UserManagement from './components/UserManagement';
import ClientManagement from './components/ClientManagement';
import DocumentManagement from './components/DocumentManagement';
import JobTimeManagement from './components/JobTimeManagement';
import IncidentManagement from './components/IncidentManagement';
import ErrorDisplay from './components/ErrorDisplay';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AppContent: React.FC = () => {
  const { isAuthenticated, error: authError, clearError: clearAuthError } = useAuth();
  const { error: dataError, clearError: clearDataError } = useData();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!isAuthenticated) {
    return (
      <>
        <LoginForm />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'users':
        return <UserManagement />;
      case 'clients':
        return <ClientManagement />;
      case 'documents':
        return <DocumentManagement />;
      case 'job-times':
        return <JobTimeManagement />;
      case 'incidents':
        return <IncidentManagement />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <>
      <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
        <div className="space-y-4">
          <ErrorDisplay error={authError} onClear={clearAuthError} />
          <ErrorDisplay error={dataError} onClear={clearDataError} />
          {renderPage()}
        </div>
      </Layout>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <DataProviderWrapper />
    </AuthProvider>
  );
}

// Wrapper component to access AuthContext and pass isAuthenticated to DataProvider
const DataProviderWrapper: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <DataProvider isAuthenticated={isAuthenticated}>
      <AppContent />
    </DataProvider>
  );
};

export default App;