import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import Layout from '@/components/Layout';

function App() {
  // Add any app-wide initialization here

  return (
    <>
      <Layout>
        <Outlet />
      </Layout>
      <Toaster position="top-center" richColors />
    </>
  );
}

export default App;
