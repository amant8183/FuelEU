import { useState } from 'react';
import { Compass, GitCompareArrows, Landmark, Users } from 'lucide-react';
import { ApiProvider } from './adapters/ui/hooks/useApi';
import { AppShell } from './adapters/ui/components/AppShell';
import { RoutesTab } from './adapters/ui/components/RoutesTab';
import { CompareTab } from './adapters/ui/components/CompareTab';
import { BankingTab } from './adapters/ui/components/BankingTab';
import { PoolingTab } from './adapters/ui/components/PoolingTab';

const TABS = [
  { key: 'routes', label: 'Routes', icon: <Compass size={16} /> },
  { key: 'compare', label: 'Compare', icon: <GitCompareArrows size={16} /> },
  { key: 'banking', label: 'Banking', icon: <Landmark size={16} /> },
  { key: 'pooling', label: 'Pooling', icon: <Users size={16} /> },
] as const;

function App() {
  const [activeTab, setActiveTab] = useState('routes');

  const renderTab = () => {
    switch (activeTab) {
      case 'routes':
        return <RoutesTab />;
      case 'compare':
        return <CompareTab />;
      case 'banking':
        return <BankingTab />;
      case 'pooling':
        return <PoolingTab />;
      default:
        return null;
    }
  };

  return (
    <ApiProvider>
      <AppShell activeTab={activeTab} tabs={[...TABS]} onTabChange={setActiveTab}>
        {renderTab()}
      </AppShell>
    </ApiProvider>
  );
}

export default App;
