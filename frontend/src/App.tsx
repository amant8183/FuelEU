import { useState } from 'react';
import { ApiProvider } from './adapters/ui/hooks/useApi';
import { AppShell } from './adapters/ui/components/AppShell';
import { PlaceholderTab } from './adapters/ui/components/PlaceholderTab';

const TABS = [
  { key: 'routes', label: 'Routes', icon: '🚢' },
  { key: 'compliance', label: 'Compliance', icon: '📊' },
  { key: 'banking', label: 'Banking', icon: '🏦' },
  { key: 'pooling', label: 'Pooling', icon: '🤝' },
] as const;

function App() {
  const [activeTab, setActiveTab] = useState('routes');

  const renderTab = () => {
    switch (activeTab) {
      case 'routes':
        return <PlaceholderTab title="Routes & Voyage Data" />;
      case 'compliance':
        return <PlaceholderTab title="Compliance Balance" />;
      case 'banking':
        return <PlaceholderTab title="Article 20 — Banking" />;
      case 'pooling':
        return <PlaceholderTab title="Article 21 — Pooling" />;
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
