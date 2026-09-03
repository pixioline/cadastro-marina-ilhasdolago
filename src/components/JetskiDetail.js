import React, { useState, useEffect } from 'react';
import {
  Button, Tag, Tile,
  SkeletonText, SkeletonPlaceholder,
  InlineNotification,
} from '@carbon/react';
import { Edit, ArrowLeft, Email, Phone } from '@carbon/icons-react';
import { getJetskiById } from '../data/storage';

function formatTs(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function JetskiDetail({ id, onEdit, onBack }) {
  const [jetski, setJetski] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getJetskiById(id)
      .then((data) => { setJetski(data); setLoading(false); })
      .catch(() => { setError('Erro ao carregar dados do jetski.'); setLoading(false); });
  }, [id]);

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Button kind="ghost" renderIcon={ArrowLeft} iconDescription="Voltar" onClick={onBack} hasIconOnly />
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 400 }}>
            {loading ? 'Carregando…' : `Jetski ${jetski?.numeroInscricao || ''}`}
          </h1>
          <p style={{ margin: 0, color: '#6f6f6f', fontSize: '0.875rem' }}>Detalhes do cadastro</p>
        </div>
        {!loading && jetski && (
          <Button kind="primary" renderIcon={Edit} onClick={() => onEdit(jetski)} style={{ marginLeft: 'auto' }}>Editar</Button>
        )}
      </div>

      {error && <InlineNotification kind="error" title={error} style={{ marginBottom: '1rem' }} />}

      {loading ? (
        <Tile>
          <SkeletonPlaceholder style={{ width: '100%', height: '280px', marginBottom: '1.5rem' }} />
          <SkeletonText paragraph lines={6} />
        </Tile>
      ) : jetski ? (
        <>
          {jetski.imagemUrl && (
            <img src={jetski.imagemUrl} alt={`Jetski ${jetski.numeroInscricao}`} style={{ width: '100%', maxHeight: '320px', objectFit: 'cover', display: 'block', marginBottom: '1.5rem', border: '1px solid #e0e0e0' }} />
          )}
          <Tile style={{ marginBottom: '1rem' }}>
            <p className="form-section-title">Identificação</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Field label="Nº Inscrição" value={jetski.numeroInscricao} />
              <Field label="Marca"        value={jetski.marca} />
              <Field label="Modelo"       value={jetski.modelo} />
              <Field label="Ano"          value={jetski.ano} />
              <Field label="Cor"          value={jetski.cor} />
            </div>
          </Tile>
          <Tile style={{ marginBottom: '1rem' }}>
            <p className="form-section-title">Serviços</p>
            <div className="tag-row" style={{ marginTop: 0 }}>
              {jetski.servicos?.quadriciclo && <Tag type="blue" size="md">Quadriciclo</Tag>}
              {jetski.servicos?.flutuante   && <Tag type="teal" size="md">Pier Flutuante</Tag>}
              {!jetski.servicos?.quadriciclo && !jetski.servicos?.flutuante && <Tag type="gray" size="md">Nenhum serviço</Tag>}
            </div>
          </Tile>
          <Tile style={{ marginBottom: '1rem' }}>
            <p className="form-section-title">Proprietário{jetski.proprietarios?.length !== 1 ? 's' : ''} ({jetski.proprietarios?.length || 0})</p>
            {jetski.proprietarios?.map((p, idx) => (
              <div key={p.id} style={{ marginBottom: idx < jetski.proprietarios.length - 1 ? '1rem' : 0, paddingBottom: idx < jetski.proprietarios.length - 1 ? '1rem' : 0, borderBottom: idx < jetski.proprietarios.length - 1 ? '1px solid #e0e0e0' : 'none' }}>
                <p style={{ margin: '0 0 0.5rem', fontWeight: 600, color: '#161616' }}>{p.nome || '—'}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {p.apartamento && <Field label="Apartamento" value={p.apartamento} />}
                  {p.telefone && (
                    <div className="detail-field">
                      <p className="detail-label">Telefone</p>
                      <a href={`tel:${p.telefone}`} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9375rem', color: '#0f62fe' }}>
                        <Phone size={16} /> {p.telefone}
                      </a>
                    </div>
                  )}
                  {p.email && (
                    <div className="detail-field">
                      <p className="detail-label">E-mail</p>
                      <a href={`mailto:${p.email}`} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9375rem', color: '#0f62fe' }}>
                        <Email size={16} /> {p.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </Tile>
          <Tile>
            <p className="form-section-title">Registro</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Field label="Cadastrado em" value={formatTs(jetski.dataCadastro)} />
              <Field label="Atualizado em" value={formatTs(jetski.dataAtualizacao)} />
            </div>
          </Tile>
        </>
      ) : (
        <p style={{ color: '#6f6f6f' }}>Jetski não encontrado.</p>
      )}
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div className="detail-field">
      <p className="detail-label">{label}</p>
      <p className="detail-value">{value || '—'}</p>
    </div>
  );
}
