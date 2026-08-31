import React, { useState, useEffect } from 'react';
import {
  Button,
  Tag,
  Tile,
  Grid,
  Column,
  Modal,
  InlineNotification,
  SkeletonText,
  SkeletonPlaceholder,
} from '@carbon/react';
import { Edit, TrashCan, ArrowLeft } from '@carbon/icons-react';
import { getJetskiById, deleteJetski } from '../data/storage';

function Detail({ label, value }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <p className="detail-label">{label}</p>
      <p className="detail-value">{value || '\u2014'}</p>
    </div>
  );
}

function JetskiDetail({ id, onEdit, onBack }) {
  const [jetski, setJetski] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    getJetskiById(id)
      .then(setJetski)
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteJetski(id);
      setShowDelete(false);
      setNotification({ kind: 'success', message: 'Jetski exclu\u00eddo.' });
      setTimeout(() => onBack(), 1200);
    } catch {
      setNotification({ kind: 'error', message: 'Erro ao excluir. Tente novamente.' });
      setDeleting(false);
      setShowDelete(false);
    }
  }

  function formatDate(ts) {
    if (!ts) return '\u2014';
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (loading) {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Button kind="ghost" size="sm" renderIcon={ArrowLeft} onClick={onBack} style={{ padding: '0.375rem 0.75rem' }}>
            Voltar
          </Button>
          <SkeletonText style={{ width: '200px' }} />
        </div>
        <Grid>
          <Column lg={5} md={4} sm={4}>
            <Tile style={{ padding: 0, overflow: 'hidden', marginBottom: '1rem' }}>
              <SkeletonPlaceholder style={{ width: '100%', height: '280px' }} />
              <div style={{ padding: '1rem' }}>
                <SkeletonText paragraph lines={5} />
              </div>
            </Tile>
          </Column>
          <Column lg={7} md={4} sm={4}>
            <Tile>
              <SkeletonText paragraph lines={8} />
            </Tile>
          </Column>
        </Grid>
      </div>
    );
  }

  if (!jetski) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: '#6f6f6f' }}>
        <p>Jetski n\u00e3o encontrado.</p>
        <Button kind="ghost" renderIcon={ArrowLeft} onClick={onBack}>Voltar</Button>
      </div>
    );
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
          Jetski \u00b7 {jetski.numeroInscricao || '\u2014'}
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
            {jetski.imagemUrl ? (
              <img
                src={jetski.imagemUrl}
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
                Sem foto
              </div>
            )}
            <div style={{ padding: '1rem' }}>
              <div className="tag-row" style={{ marginTop: 0, marginBottom: '0.75rem' }}>
                {jetski.servicos?.quadriciclo && <Tag type="blue">Quadriciclo</Tag>}
                {jetski.servicos?.flutuante && <Tag type="teal">Flutuante</Tag>}
                {!jetski.servicos?.quadriciclo && !jetski.servicos?.flutuante && (
                  <Tag type="gray">Sem servi\u00e7o</Tag>
                )}
              </div>
              <Detail label="N\u00famero de Inscri\u00e7\u00e3o" value={jetski.numeroInscricao} />
              <Detail label="Marca" value={jetski.marca} />
              <Detail label="Modelo" value={jetski.modelo} />
              <Detail label="Ano" value={jetski.ano} />
              <Detail label="Cor" value={jetski.cor} />
              <Detail label="Cadastrado em" value={formatDate(jetski.dataCadastro)} />
              <Detail label="\u00daltima atualiza\u00e7\u00e3o" value={formatDate(jetski.dataAtualizacao)} />
            </div>
          </Tile>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Button renderIcon={Edit} onClick={() => onEdit(jetski)}>
              Editar
            </Button>
            <Button kind="danger" renderIcon={TrashCan} onClick={() => setShowDelete(true)}>
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
              Propriet\u00e1rio{jetski.proprietarios?.length !== 1 ? 's' : ''}
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
                  Propriet\u00e1rio {idx + 1}
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
                { ...jetski, imagemUrl: jetski.imagemUrl ? '[url da imagem]' : null },
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
        modalHeading="Confirmar exclus\u00e3o"
        primaryButtonText={deleting ? 'Excluindo\u2026' : 'Excluir'}
        secondaryButtonText="Cancelar"
        primaryButtonDisabled={deleting}
        onRequestSubmit={handleDelete}
        onRequestClose={() => !deleting && setShowDelete(false)}
      >
        <p>
          Tem certeza que deseja excluir o jetski <strong>{jetski.numeroInscricao}</strong>? Esta
          a\u00e7\u00e3o n\u00e3o pode ser desfeita.
        </p>
      </Modal>
    </div>
  );
}

export default JetskiDetail;
