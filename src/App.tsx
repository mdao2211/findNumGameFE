// src/App.tsx
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[url(/src/img/find_num.avif)] bg-no-repeat bg-cover p-8">
        <div className="max-w-8xl mx-auto">
          <AppRoutes />
          <ToastContainer position="top-center" autoClose={3000} />
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
