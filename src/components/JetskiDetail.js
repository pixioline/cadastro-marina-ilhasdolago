import React, { useState, useEffect } from 'react';
import {
  Button,
  Tag,
  Tile,
  Grid,
  Column,
  Modal,
  InlineNotification,
} from '@carbon/react';
import { Edit, TrashCan, ArrowLeft } from '@carbon/icons-react';
import { getJetskiById, deleteJetski } from '../data/storage';

function Detail({ label, value }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <p className="detail-label">{label}</p>
      <p className="detail-value">{value || '—'}</p>
    </div>
  );
}

function JetskiDetail({ id, onEdit, onBack }) {
  const [jetski, setJetski] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    setJetski(getJetskiById(id));
  }, [id]);

  if (!jetski) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: '#6f6f6f' }}>
        Jetski não encontrado.
      </div>
    );
  }

  function handleDelete() {
    deleteJetski(id);
    setShowDelete(false);
    setNotification({ kind: 'success', message: 'Jetski excluído.' });
    setTimeout(() => onBack(), 1200);
  }

  function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Button
          kind="ghost"
          size="sm"
          renderIcon={ArrowLeft}
          iconDescription="Voltar"
          onClick={onBack}
          style={{ padding: '0.375rem 0.75rem' }}
        >
          Voltar
        </Button>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 400, color: '#161616' }}>
          Jetski · {jetski.numeroInscricao || '—'}
        </h1>
      </div>

      {notification && (
        <InlineNotification
          kind={notification.kind}
          title={notification.message}
          style={{ marginBottom: '1rem' }}
        />
      )}

      <Grid>
        <Column lg={5} md={4} sm={4}>
          <Tile style={{ padding: 0, overflow: 'hidden', marginBottom: '1rem' }}>
            {jetski.imagemBase64 ? (
              <img
                src={jetski.imagemBase64}
                alt={`Jetski ${jetski.numeroInscricao}`}
                style={{ width: '100%', display: 'block', maxHeight: '300px', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  height: '220px',
                  background: '#e0e0e0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6f6f6f',
                }}
              >
                Sem imagem
              </div>
            )}
            <div style={{ padding: '1rem' }}>
              <div className="tag-row" style={{ marginTop: 0, marginBottom: '0.75rem' }}>
                {jetski.servicos?.quadriciclo && <Tag type="blue">Quadriciclo</Tag>}
                {jetski.servicos?.flutuante && <Tag type="teal">Flutuante</Tag>}
                {!jetski.servicos?.quadriciclo && !jetski.servicos?.flutuante && (
                  <Tag type="gray">Sem serviço</Tag>
                )}
              </div>
              <Detail label="Número de Inscrição" value={jetski.numeroInscricao} />
              <Detail label="Marca" value={jetski.marca} />
              <Detail label="Modelo" value={jetski.modelo} />
              <Detail label="Ano" value={jetski.ano} />
              <Detail label="Cor" value={jetski.cor} />
              <Detail label="Cadastrado em" value={formatDate(jetski.dataCadastro)} />
              <Detail label="Última atualização" value={formatDate(jetski.dataAtualizacao)} />
            </div>
          </Tile>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Button renderIcon={Edit} onClick={() => onEdit(jetski)}>
              Editar
            </Button>
            <Button
              kind="danger"
              renderIcon={TrashCan}
              onClick={() => setShowDelete(true)}
            >
              Excluir
            </Button>
          </div>
        </Column>

        <Column lg={7} md={4} sm={4}>
          <Tile>
            <p
              style={{
                margin: '0 0 1rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: '#393939',
              }}
            >
              Proprietário{jetski.proprietarios?.length !== 1 ? 's' : ''}
              {' '}
              <span
                style={{
                  background: '#0f62fe',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '1.25rem',
                  height: '1.25rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  verticalAlign: 'middle',
                }}
              >
                {jetski.proprietarios?.length || 0}
              </span>
            </p>

            {jetski.proprietarios?.map((p, idx) => (
              <div key={p.id} className="proprietario-row">
                <p
                  style={{
                    margin: '0 0 0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#6f6f6f',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Proprietário {idx + 1}
                </p>
                <Grid narrow>
                  <Column lg={8} md={4} sm={4}>
                    <Detail label="Nome" value={p.nome} />
                  </Column>
                  <Column lg={4} md={2} sm={4}>
                    <Detail label="Apartamento" value={p.apartamento} />
                  </Column>
                  <Column lg={4} md={2} sm={4}>
                    <Detail label="Telefone" value={p.telefone} />
                  </Column>
                  <Column lg={8} md={4} sm={4}>
                    <Detail label="E-mail" value={p.email} />
                  </Column>
                </Grid>
              </div>
            ))}
          </Tile>

          <Tile style={{ marginTop: '1rem' }}>
            <p
              style={{
                margin: '0 0 0.75rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: '#393939',
              }}
            >
              Dados em JSON
            </p>
            <pre
              style={{
                margin: 0,
                fontSize: '0.75rem',
                color: '#393939',
                background: '#f4f4f4',
                padding: '0.75rem',
                borderRadius: '4px',
                overflowX: 'auto',
                maxHeight: '200px',
                overflowY: 'auto',
              }}
            >
              {JSON.stringify(
                { ...jetski, imagemBase64: jetski.imagemBase64 ? '[imagem base64]' : null },
                null,
                2
              )}
            </pre>
          </Tile>
        </Column>
      </Grid>

      <Modal
        open={showDelete}
        danger
        modalHeading="Confirmar exclusão"
        primaryButtonText="Excluir"
        secondaryButtonText="Cancelar"
        onRequestSubmit={handleDelete}
        onRequestClose={() => setShowDelete(false)}
      >
        <p>
          Tem certeza que deseja excluir o jetski <strong>{jetski.numeroInscricao}</strong>? Esta
          ação não pode ser desfeita.
        </p>
      </Modal>
    </div>
  );
}

export default JetskiDetail;
