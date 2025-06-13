import React, { ReactNode } from 'react';
import Sidebar from './navigation/Sidebar';
import TopHeader from './navigation/TopHeader';
import { useAppContext } from '../context/AppContext';
import { Outlet } from 'react-router-dom';
import { AIAssistant } from './AIAssistant';

interface LayoutProps {
  children?: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { sidebarExpanded } = useAppContext();

  return (
    <div className="flex min-h-screen bg-sableClair">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarExpanded ? 'ml-60' : 'ml-20'}`}>
        <TopHeader />
        <main className="p-6">
          {children}
          <Outlet />
        </main>
        <AIAssistant />
      </div>
    </div>
  );
};