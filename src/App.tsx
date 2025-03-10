// src/App.tsx
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './AppRoutes';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-8">
        <div className="max-w-4xl mx-auto">
          <AppRoutes />
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
