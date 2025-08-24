import { createContext, useContext, useState, ReactNode } from 'react';

interface PageContextType {
  pageTitle: string;
  setPageTitle: (title: string) => void;
}

const PageContext = createContext<PageContextType | undefined>(undefined);

export function PageProvider({ children }: { children: ReactNode }) {
  const [pageTitle, setPageTitle] = useState('Dashboard');

  return (
    <PageContext.Provider value={{ pageTitle, setPageTitle }}>
      {children}
    </PageContext.Provider>
  );
}

export function usePageTitle() {
  const context = useContext(PageContext);
  if (!context) {
    throw new Error('usePageTitle must be used within a PageProvider');
  }
  return context;
}