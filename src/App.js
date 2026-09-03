import React, { useState } from 'react';
import { Header, HeaderName, HeaderGlobalBar, HeaderGlobalAction } from '@carbon/react';
import { SailboatCoastal } from '@carbon/icons-react';
import JetskiList from './components/JetskiList';
import JetskiForm from './components/JetskiForm';
import JetskiDetail from './components/JetskiDetail';

// views: 'list' | 'form' | 'detail'
export default function App() {
  const [view, setView]         = useState('list');
  const [selected, setSelected] = useState(null);
  const [editing, setEditing]   = useState(null);

  function openNew() { setEditing(null); setView('form'); }
  function openEdit(jetski) { setEditing(jetski); setView('form'); }
  function openDetail(id) { setSelected(id); setView('detail'); }
  function backToList() { setView('list'); setSelected(null); setEditing(null); }

  return (
    <>
      <Header aria-label="Marina Ilhas do Lago">
        <HeaderName href="#" prefix="" onClick={(e) => { e.preventDefault(); backToList(); }}>
          Marina Ilhas do Lago
        </HeaderName>
        <HeaderGlobalBar>
          <HeaderGlobalAction aria-label="Jetskis" onClick={backToList}>
            <SailboatCoastal size={20} />
          </HeaderGlobalAction>
        </HeaderGlobalBar>
      </Header>

      <main className="page-content">
        {view === 'list'   && <JetskiList onSelect={openDetail} onEdit={openEdit} onNew={openNew} />}
        {view === 'form'   && <JetskiForm jetski={editing} onSave={backToList} onCancel={backToList} />}
        {view === 'detail' && <JetskiDetail id={selected} onEdit={openEdit} onBack={backToList} />}
      </main>
    </>
  );
}
