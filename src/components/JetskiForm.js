import React, { useState, useRef } from 'react';
import {
  Button,
  TextInput,
  Checkbox,
  InlineNotification,
  Grid,
  Column,
  Tile,
  IconButton,
  InlineLoading,
} from '@carbon/react';
import { Add, TrashCan, Upload, ArrowLeft } from '@carbon/icons-react';
import { createJetski, updateJetski, generateId } from '../data/storage';

const emptyProprietario = () => ({
  id: generateId(),
  nome: '',
  apartamento: '',
  telefone: '',
  email: '',
});

const emptyForm = () => ({
  numeroInscricao: '',
  marca: '',
  modelo: '',
  ano: '',
  cor: '',
  imagemUrl: null,
  servicos: { quadriciclo: false, flutuante: false },
  proprietarios: [emptyProprietario()],
});

function fromJetski(j) {
  return {
    numeroInscricao: j.numeroInscricao || '',
    marca: j.marca || '',
    modelo: j.modelo || '',
    ano: j.ano || '',
    cor: j.cor || '',
    imagemUrl: j.imagemUrl || null,
    servicos: { ...j.servicos },
    proprietarios: j.proprietarios.map((p) => ({ ...p })),
  };
}

function JetskiForm({ jetski, onSave, onCancel }) {
  const isEdit = !!jetski;
  const [form, setForm] = useState(isEdit ? fromJetski(jetski) : emptyForm);
  const [errors, setErrors] = useState({});
  // imageFile: File para upload, null para remover, undefined para manter
  const [imageFile, setImageFile] = useState(undefined);
  const [imagePreview, setImagePreview] = useState(isEdit ? jetski.imagemUrl : null);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  const fileInputRef = useRef();

  function setField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function setServico(key, value) {
    setForm((f) => ({ ...f, servicos: { ...f.servicos, [key]: value } }));
  }

  function setProprietario(idx, field, value) {
    setForm((f) => {
      const props = f.proprietarios.map((p, i) =>
        i === idx ? { ...p, [field]: value } : p
      );
      return { ...f, proprietarios: props };
    });
    setErrors((e) => ({ ...e, [`prop_${idx}_${field}`]: undefined }));
  }

  function addProprietario() {
    setForm((f) => ({
      ...f,
      proprietarios: [...f.proprietarios, emptyProprietario()],
    }));
  }

  function removeProprietario(idx) {
    setForm((f) => ({
      ...f,
      proprietarios: f.proprietarios.filter((_, i) => i !== idx),
    }));
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setNotification({ kind: 'error', message: 'Imagem muito grande. Máximo 5MB.' });
      return;
    }
    // Revoga a URL anterior antes de criar uma nova (evita memory leak)
    setImagePreview((prev) => {
      if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setImageFile(file);
  }

  function handleRemoveImage() {
    setImagePreview((prev) => {
      if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
      return null;
    });
    setImageFile(null); // sinaliza para deletar no Storage
  }

  function validate() {
    const errs = {};
    if (!form.numeroInscricao.trim()) errs.numeroInscricao = 'Campo obrigatório';
    if (!form.marca.trim()) errs.marca = 'Campo obrigatório';
    form.proprietarios.forEach((p, i) => {
      if (!p.nome.trim()) errs[`prop_${i}_nome`] = 'Campo obrigatório';
    });
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setNotification({ kind: 'error', message: 'Por favor, corrija os erros antes de salvar.' });
      return;
    }

    setSaving(true);
    try {
      // imagemUrl é gerenciado pelo storage.js com base em imageFile — não inclui aqui
      const dados = {
        numeroInscricao: form.numeroInscricao,
        marca: form.marca,
        modelo: form.modelo,
        ano: form.ano,
        cor: form.cor,
        servicos: form.servicos,
        proprietarios: form.proprietarios,
        imagemUrl: form.imagemUrl, // passado para updateJetski poder manter a URL atual
      };

      if (isEdit) {
        await updateJetski(jetski.id, dados, imageFile);
      } else {
        await createJetski(dados, imageFile instanceof File ? imageFile : null);
      }

      setNotification({ kind: 'success', message: 'Jetski salvo com sucesso!' });
      setTimeout(() => onSave(), 800);
    } catch (err) {
      console.error(err);
      setNotification({ kind: 'error', message: 'Erro ao salvar. Verifique sua conexão.' });
      setSaving(false);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Button
          kind="ghost"
          size="sm"
          renderIcon={ArrowLeft}
          iconDescription="Voltar"
          onClick={onCancel}
          style={{ padding: '0.375rem 0.75rem' }}
          disabled={saving}
        >
          Voltar
        </Button>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 400, color: '#161616' }}>
          {isEdit ? 'Editar Jetski' : 'Novo Jetski'}
        </h1>
      </div>

      {notification && (
        <InlineNotification
          kind={notification.kind}
          title={notification.message}
          onClose={() => setNotification(null)}
          style={{ marginBottom: '1rem' }}
        />
      )}

      <form onSubmit={handleSubmit} noValidate>
        <Grid>
          <Column lg={12} md={8} sm={4}>
            <Tile style={{ marginBottom: '1.5rem' }}>
              <p className="form-section-title" style={{ marginTop: 0 }}>Dados do Jetski</p>

              <Grid narrow>
                <Column lg={4} md={4} sm={4}>
                  <TextInput
                    id="numeroInscricao"
                    labelText="Número de Inscrição *"
                    placeholder="Ex: AB-1234"
                    value={form.numeroInscricao}
                    onChange={(e) => setField('numeroInscricao', e.target.value)}
                    invalid={!!errors.numeroInscricao}
                    invalidText={errors.numeroInscricao}
                    disabled={saving}
                  />
                </Column>
                <Column lg={4} md={4} sm={4}>
                  <TextInput
                    id="marca"
                    labelText="Marca *"
                    placeholder="Ex: Yamaha, Sea-Doo, Kawasaki"
                    value={form.marca}
                    onChange={(e) => setField('marca', e.target.value)}
                    invalid={!!errors.marca}
                    invalidText={errors.marca}
                    disabled={saving}
                  />
                </Column>
                <Column lg={4} md={4} sm={4}>
                  <TextInput
                    id="modelo"
                    labelText="Modelo"
                    placeholder="Ex: WaveRunner FX"
                    value={form.modelo}
                    onChange={(e) => setField('modelo', e.target.value)}
                    disabled={saving}
                  />
                </Column>
                <Column lg={2} md={2} sm={2}>
                  <TextInput
                    id="ano"
                    labelText="Ano"
                    placeholder="Ex: 2022"
                    value={form.ano}
                    onChange={(e) => setField('ano', e.target.value)}
                    disabled={saving}
                  />
                </Column>
                <Column lg={4} md={4} sm={4}>
                  <TextInput
                    id="cor"
                    labelText="Cor"
                    placeholder="Ex: Azul e branco"
                    value={form.cor}
                    onChange={(e) => setField('cor', e.target.value)}
                    disabled={saving}
                  />
                </Column>
              </Grid>

              <p className="form-section-title">Serviços Contratados</p>
              <div style={{ display: 'flex', gap: '2rem' }}>
                <Checkbox
                  id="servico-quadriciclo"
                  labelText="Quadriciclo"
                  checked={form.servicos.quadriciclo}
                  onChange={(_, { checked }) => setServico('quadriciclo', checked)}
                  disabled={saving}
                />
                <Checkbox
                  id="servico-flutuante"
                  labelText="Flutuante"
                  checked={form.servicos.flutuante}
                  onChange={(_, { checked }) => setServico('flutuante', checked)}
                  disabled={saving}
                />
              </div>

              <p className="form-section-title">Foto do Jetski</p>
              <Button
                kind="tertiary"
                size="sm"
                renderIcon={Upload}
                onClick={() => fileInputRef.current?.click()}
                disabled={saving}
              >
                {imagePreview ? 'Trocar foto' : 'Anexar foto'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageChange}
              />
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview do jetski" />
                  <div style={{ padding: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      kind="danger--ghost"
                      size="sm"
                      onClick={handleRemoveImage}
                      disabled={saving}
                    >
                      Remover
                    </Button>
                  </div>
                </div>
              )}
            </Tile>
          </Column>

          <Column lg={12} md={8} sm={4}>
            <Tile style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p className="form-section-title" style={{ marginTop: 0, marginBottom: 0 }}>
                  Proprietários
                </p>
                <Button
                  kind="ghost"
                  size="sm"
                  renderIcon={Add}
                  onClick={addProprietario}
                  disabled={saving}
                >
                  Adicionar proprietário
                </Button>
              </div>

              {form.proprietarios.map((p, idx) => (
                <div
                  key={p.id}
                  style={{
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px',
                    padding: '1rem',
                    marginTop: '1rem',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.75rem',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        color: '#6f6f6f',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      Proprietário {idx + 1}
                    </span>
                    {form.proprietarios.length > 1 && (
                      <IconButton
                        label="Remover proprietário"
                        kind="ghost"
                        size="sm"
                        onClick={() => removeProprietario(idx)}
                        disabled={saving}
                      >
                        <TrashCan />
                      </IconButton>
                    )}
                  </div>

                  <Grid narrow>
                    <Column lg={6} md={4} sm={4}>
                      <TextInput
                        id={`prop-${idx}-nome`}
                        labelText="Nome completo *"
                        value={p.nome}
                        onChange={(e) => setProprietario(idx, 'nome', e.target.value)}
                        invalid={!!errors[`prop_${idx}_nome`]}
                        invalidText={errors[`prop_${idx}_nome`]}
                        disabled={saving}
                      />
                    </Column>
                    <Column lg={2} md={2} sm={4}>
                      <TextInput
                        id={`prop-${idx}-apartamento`}
                        labelText="Apartamento"
                        placeholder="Ex: 302"
                        value={p.apartamento}
                        onChange={(e) => setProprietario(idx, 'apartamento', e.target.value)}
                        disabled={saving}
                      />
                    </Column>
                    <Column lg={4} md={2} sm={4}>
                      <TextInput
                        id={`prop-${idx}-telefone`}
                        labelText="Telefone"
                        placeholder="(61) 9 9999-9999"
                        value={p.telefone}
                        onChange={(e) => setProprietario(idx, 'telefone', e.target.value)}
                        disabled={saving}
                      />
                    </Column>
                    <Column lg={6} md={4} sm={4}>
                      <TextInput
                        id={`prop-${idx}-email`}
                        labelText="E-mail"
                        placeholder="email@exemplo.com"
                        value={p.email}
                        onChange={(e) => setProprietario(idx, 'email', e.target.value)}
                        disabled={saving}
                      />
                    </Column>
                  </Grid>
                </div>
              ))}
            </Tile>
          </Column>

          <Column lg={12} md={8} sm={4}>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', alignItems: 'center' }}>
              <Button kind="secondary" onClick={onCancel} disabled={saving}>
                Cancelar
              </Button>
              {saving ? (
                <InlineLoading description="Salvando…" status="active" />
              ) : (
                <Button type="submit">
                  {isEdit ? 'Salvar alterações' : 'Cadastrar jetski'}
                </Button>
              )}
            </div>
          </Column>
        </Grid>
      </form>
    </div>
  );
}

export default JetskiForm;
