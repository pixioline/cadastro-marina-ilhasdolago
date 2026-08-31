import React, { useState, useCallback } from 'react';
import {
  Header,
  HeaderName,
  HeaderGlobalBar,
  HeaderGlobalAction,
  Theme,
} from '@carbon/react';
import { Add, SailboatCoastal } from '@carbon/icons-react';
import JetskiList from './components/JetskiList';
import JetskiForm from './components/JetskiForm';
import JetskiDetail from './components/JetskiDetail';

// Views: 'list' | 'form' | 'detail'
function App() {
  const [view, setView] = useState('list');
  const [selectedId, setSelectedId] = useState(null);
  const [editingJetski, setEditingJetski] = useState(null);
  const [listKey, setListKey] = useState(0);

  const goToList = useCallback(() => {
    setView('list');
    setSelectedId(null);
    setEditingJetski(null);
    setListKey((k) => k + 1);
  }, []);

  const goToNew = useCallback(() => {
    setEditingJetski(null);
    setView('form');
  }, []);

  const goToEdit = useCallback((jetski) => {
    setEditingJetski(jetski);
    setView('form');
  }, []);

  const goToDetail = useCallback((id) => {
    setSelectedId(id);
    setView('detail');
  }, []);

  return (
    <Theme theme="white">
      <div className="app-shell">
        <Header aria-label="Marina Ilhas do Lago">
          <HeaderName prefix="">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <SailboatCoastal size={20} />
              Marina Ilhas do Lago
            </span>
          </HeaderName>
          <HeaderGlobalBar>
            {view !== 'form' && (
              <HeaderGlobalAction
                aria-label="Novo Jetski"
                tooltipAlignment="end"
                onClick={goToNew}
              >
                <Add size={20} />
              </HeaderGlobalAction>
            )}
          </HeaderGlobalBar>
        </Header>

        <main className="page-content">
          {view === 'list' && (
            <JetskiList
              key={listKey}
              onSelect={goToDetail}
              onEdit={goToEdit}
              onNew={goToNew}
            />
          )}
          {view === 'form' && (
            <JetskiForm
              jetski={editingJetski}
              onSave={goToList}
              onCancel={goToList}
            />
          )}
          {view === 'detail' && (
            <JetskiDetail
              id={selectedId}
              onEdit={goToEdit}
              onBack={goToList}
            />
          )}
        </main>
      </div>
    </Theme>
  );
}

export default App;
