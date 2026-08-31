import React, { useState, useEffect } from 'react';
import {
  Button,
  Tag,
  Search,
  Tile,
  OverflowMenu,
  OverflowMenuItem,
  Modal,
  InlineNotification,
} from '@carbon/react';
import { Add, Edit, SailboatCoastal, View } from '@carbon/icons-react';
import { getAllJetskis, deleteJetski } from '../data/storage';

function JetskiList({ onSelect, onEdit, onNew }) {
  const [jetskis, setJetskis] = useState([]);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    setJetskis(getAllJetskis());
  }, []);

  const filtered = jetskis.filter((j) => {
    const q = search.toLowerCase();
    return (
      !q ||
      j.numeroInscricao?.toLowerCase().includes(q) ||
      j.marca?.toLowerCase().includes(q) ||
      j.modelo?.toLowerCase().includes(q) ||
      j.proprietarios?.some(
        (p) =>
          p.nome?.toLowerCase().includes(q) ||
          p.apartamento?.toLowerCase().includes(q)
      )
    );
  });

  function confirmDelete(id) {
    setDeleteTarget(id);
  }

  function handleDelete() {
    deleteJetski(deleteTarget);
    setJetskis(getAllJetskis());
    setDeleteTarget(null);
    setNotification({ kind: 'success', message: 'Jetski excluído com sucesso.' });
    setTimeout(() => setNotification(null), 3000);
  }

  return (
    <div>
      <div className="header-row">
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 400, color: '#161616' }}>
            Jetskis Cadastrados
          </h1>
          <p style={{ margin: '0.25rem 0 0', color: '#6f6f6f', fontSize: '0.875rem' }}>
            {jetskis.length} jetski{jetskis.length !== 1 ? 's' : ''} no total
          </p>
        </div>
        <Button renderIcon={Add} onClick={onNew}>
          Novo Jetski
        </Button>
      </div>

      {notification && (
        <InlineNotification
          kind={notification.kind}
          title={notification.message}
          onClose={() => setNotification(null)}
          style={{ marginBottom: '1rem' }}
        />
      )}

      <Search
        labelText="Buscar"
        placeholder="Buscar por inscrição, marca, modelo ou proprietário…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: '1.5rem' }}
      />

      {filtered.length === 0 ? (
        <div className="empty-state">
          <SailboatCoastal size={64} />
          <p style={{ fontSize: '1.125rem', fontWeight: 500, color: '#393939' }}>
            {search ? 'Nenhum jetski encontrado' : 'Nenhum jetski cadastrado ainda'}
          </p>
          {!search && (
            <Button renderIcon={Add} onClick={onNew} style={{ marginTop: '1rem' }}>
              Cadastrar primeiro jetski
            </Button>
          )}
        </div>
      ) : (
        <div className="jetski-grid">
          {filtered.map((j) => (
            <JetskiCard
              key={j.id}
              jetski={j}
              onView={() => onSelect(j.id)}
              onEdit={() => onEdit(j)}
              onDelete={() => confirmDelete(j.id)}
            />
          ))}
        </div>
      )}

      <Modal
        open={!!deleteTarget}
        danger
        modalHeading="Confirmar exclusão"
        primaryButtonText="Excluir"
        secondaryButtonText="Cancelar"
        onRequestSubmit={handleDelete}
        onRequestClose={() => setDeleteTarget(null)}
      >
        <p>Tem certeza que deseja excluir este jetski? Esta ação não pode ser desfeita.</p>
      </Modal>
    </div>
  );
}

function JetskiCard({ jetski, onView, onEdit, onDelete }) {
  return (
    <Tile style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
      {jetski.imagemBase64 ? (
        <img
          className="jetski-card-img"
          src={jetski.imagemBase64}
          alt={`Jetski ${jetski.numeroInscricao}`}
        />
      ) : (
        <div className="jetski-card-img-placeholder">
          <span>Sem imagem</span>
        </div>
      )}

      <div style={{ padding: '1rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontSize: '0.75rem',
                color: '#6f6f6f',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Nº Inscrição
            </p>
            <p
              style={{
                margin: '0 0 0.25rem',
                fontSize: '1.125rem',
                fontWeight: 600,
                color: '#161616',
              }}
            >
              {jetski.numeroInscricao || '—'}
            </p>
            <p style={{ margin: 0, color: '#393939', fontSize: '0.9375rem' }}>
              {[jetski.marca, jetski.modelo, jetski.ano].filter(Boolean).join(' · ')}
            </p>
          </div>
          <OverflowMenu flipped aria-label="Ações">
            <OverflowMenuItem itemText="Visualizar" onClick={onView} />
            <OverflowMenuItem itemText="Editar" onClick={onEdit} />
            <OverflowMenuItem
              itemText="Excluir"
              isDelete
              hasDivider
              onClick={onDelete}
            />
          </OverflowMenu>
        </div>

        <div className="tag-row">
          {jetski.servicos?.quadriciclo && (
            <Tag type="blue" size="sm">Quadriciclo</Tag>
          )}
          {jetski.servicos?.flutuante && (
            <Tag type="teal" size="sm">Flutuante</Tag>
          )}
          {!jetski.servicos?.quadriciclo && !jetski.servicos?.flutuante && (
            <Tag type="gray" size="sm">Sem serviço</Tag>
          )}
        </div>

        <div style={{ marginTop: '0.75rem', borderTop: '1px solid #e0e0e0', paddingTop: '0.75rem' }}>
          <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', color: '#6f6f6f', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Proprietário{jetski.proprietarios?.length !== 1 ? 's' : ''}
          </p>
          {jetski.proprietarios?.slice(0, 2).map((p) => (
            <p key={p.id} style={{ margin: '0.125rem 0', fontSize: '0.875rem', color: '#393939' }}>
              {p.nome} {p.apartamento ? `· Apto ${p.apartamento}` : ''}
            </p>
          ))}
          {jetski.proprietarios?.length > 2 && (
            <p style={{ margin: '0.125rem 0', fontSize: '0.75rem', color: '#6f6f6f' }}>
              +{jetski.proprietarios.length - 2} mais
            </p>
          )}
        </div>

        <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
          <Button
            kind="ghost"
            size="sm"
            renderIcon={View}
            onClick={onView}
          >
            Ver detalhes
          </Button>
          <Button
            kind="ghost"
            size="sm"
            renderIcon={Edit}
            onClick={onEdit}
          >
            Editar
          </Button>
        </div>
      </div>
    </Tile>
  );
}

export default JetskiList;
