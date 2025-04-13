import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import './index.css';

// Initialize Firebase
import { auth, db } from '@/lib/firebase';
import { signInAnonymously } from 'firebase/auth';

// Pages
import App from './App';
import HomePage from './pages/HomePage';
import MemoriesPage from './pages/MemoriesPage';
import RemindersPage from './pages/RemindersPage';
import AddMemoryPage from './pages/AddMemoryPage';
import AddReminderPage from './pages/AddReminderPage';

// Initialize Firebase Authentication anonymously
signInAnonymously(auth)
  .then(() => {
    console.log('Signed in anonymously');
  })
  .catch((error) => {
    console.error('Anonymous auth error:', error.code, error.message);
  });

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: 'memories',
        element: <MemoriesPage />
      },
      {
        path: 'reminders',
        element: <RemindersPage />
      },
      {
        path: 'add-memory',
        element: <AddMemoryPage />
      },
      {
        path: 'add-reminder',
        element: <AddReminderPage />
      }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
    <Toaster position="top-center" />
  </React.StrictMode>,
);
