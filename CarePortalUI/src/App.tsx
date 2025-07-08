import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ClientProvider, useClient } from './contexts/ClientContext';
import { JobTimeProvider, useJobTime } from './contexts/JobTimeContext';
import { IncidentProvider, useIncident } from './contexts/IncidentContext';
import { DocumentProvider, useDocument } from './contexts/DocumentContext';
import { UserProvider, useUser } from './contexts/UserContext';
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
  const { error: clientError, clearError: clearClientError } = useClient();
  const { error: jobTimeError, clearError: clearJobTimeError } = useJobTime();
  const { error: incidentError, clearError: clearIncidentError } = useIncident();
  const { error: documentError, clearError: clearDocumentError } = useDocument();
  const { error: userError, clearError: clearUserError } = useUser();
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
          <ErrorDisplay error={clientError} onClear={clearClientError} />
          <ErrorDisplay error={jobTimeError} onClear={clearJobTimeError} />
          <ErrorDisplay error={incidentError} onClear={clearIncidentError} />
          <ErrorDisplay error={documentError} onClear={clearDocumentError} />
          <ErrorDisplay error={userError} onClear={clearUserError} />
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
      <ContextProvidersWrapper />
    </AuthProvider>
  );
}

// Wrapper component to access AuthContext and pass isAuthenticated to all providers
const ContextProvidersWrapper: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <ClientProvider isAuthenticated={isAuthenticated}>
      <JobTimeProvider isAuthenticated={isAuthenticated}>
        <IncidentProvider isAuthenticated={isAuthenticated}>
          <DocumentProvider isAuthenticated={isAuthenticated}>
            <UserProvider isAuthenticated={isAuthenticated}>
              <AppContent />
            </UserProvider>
          </DocumentProvider>
        </IncidentProvider>
      </JobTimeProvider>
    </ClientProvider>
  );
};

export default App;