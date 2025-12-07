import React, { createContext, useContext, useState } from 'react';

export type SectionKey =
  | 'Dashboard'
  | 'Users'
  | 'Candidates'
  | 'Candidate Verification'
  | 'Career Counseling'
  | 'Training Batches'
  | 'Skill Evaluation'
  | 'Company'
  | 'Jobs'
  | 'Job Mapping'
  | 'Interview Status'
  | 'Job Melas';

interface DashboardSectionContextType {
  section: SectionKey;
  setSection: (key: SectionKey) => void;
}

const DashboardSectionContext = createContext<DashboardSectionContextType | undefined>(undefined);

export const DashboardSectionProvider = ({ children }: { children: React.ReactNode }) => {
  const [section, setSection] = useState<SectionKey>('Dashboard');
  return (
    <DashboardSectionContext.Provider value={{ section, setSection }}>
      {children}
    </DashboardSectionContext.Provider>
  );
};

export const useDashboardSection = () => {
  const context = useContext(DashboardSectionContext);
  if (!context) throw new Error("useDashboardSection must be used within DashboardSectionProvider");
  return context;
};
