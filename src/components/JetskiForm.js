import React, { useState, useEffect, useRef } from 'react';
import {
  Button, TextInput, Checkbox,
  InlineLoading, InlineNotification,
  FormGroup, Stack,
} from '@carbon/react';
import { Add, TrashCan, Save, ArrowLeft } from '@carbon/icons-react';
import { createJetski, updateJetski, generateId } from '../data/storage';

const EMPTY_OWNER = () => ({ id: generateId(), nome: '', apartamento: '', telefone: '', email: '' });

const EMPTY_FORM = {
  numeroInscricao: '',
  marca: '', modelo: '', ano: '', cor: '',
  servicos: { quadriciclo: false, flutuante: false },
  proprietarios: [EMPTY_OWNER()],
};

export default function JetskiForm({ jetski, onSave, onCancel }) {
  const isEdit = !!jetski;
  const [form, setForm]           = useState(isEdit ? { ...jetski } : EMPTY_FORM);
  const [imageFile, setImageFile] = useState(undefined);
  const [preview, setPreview]     = useState(jetski?.imagemUrl || null);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState(null);
  const fileRef                   = useRef();
  const previewBlobRef            = useRef(null);

  useEffect(() => () => {
    if (previewBlobRef.current) URL.revokeObjectURL(previewBlobRef.current);
  }, []);

  function setField(field, value) { setForm((f) => ({ ...f, [field]: value })); }

  function toggleServico(key) {
    setForm((f) => ({ ...f, servicos: { ...f.servicos, [key]: !f.servicos[key] } }));
  }

  function setOwnerField(idx, field, value) {
    setForm((f) => {
      const owners = [...f.proprietarios];
      owners[idx] = { ...owners[idx], [field]: value };
      return { ...f, proprietarios: owners };
    });
  }

  function addOwner() { setForm((f) => ({ ...f, proprietarios: [...f.proprietarios, EMPTY_OWNER()] })); }
  function removeOwner(idx) { setForm((f) => ({ ...f, proprietarios: f.proprietarios.filter((_, i) => i !== idx) })); }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (previewBlobRef.current) URL.revokeObjectURL(previewBlobRef.current);
    const blobUrl = URL.createObjectURL(file);
    previewBlobRef.current = blobUrl;
    setImageFile(file);
    setPreview(blobUrl);
  }

  function removeImage() {
    if (previewBlobRef.current) { URL.revokeObjectURL(previewBlobRef.current); previewBlobRef.current = null; }
    setImageFile(null); setPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.numeroInscricao.trim()) { setError('Número de inscrição é obrigatório.'); return; }
    if (!form.proprietarios.length || !form.proprietarios[0].nome.trim()) { setError('Pelo menos um proprietário com nome é obrigatório.'); return; }
    setSaving(true); setError(null);
    try {
      if (isEdit) { await updateJetski(jetski.id, form, imageFile); }
      else        { await createJetski(form, imageFile instanceof File ? imageFile : null); }
      onSave();
    } catch (err) {
      setError('Erro ao salvar. Verifique sua conexão e tente novamente.');
      console.error(err);
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Button kind="ghost" renderIcon={ArrowLeft} iconDescription="Voltar" onClick={onCancel} hasIconOnly />
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 400 }}>{isEdit ? 'Editar Jetski' : 'Novo Jetski'}</h1>
          <p style={{ margin: 0, color: '#6f6f6f', fontSize: '0.875rem' }}>
            {isEdit ? `Editando inscrição ${jetski.numeroInscricao}` : 'Preencha os dados do jetski'}
          </p>
        </div>
      </div>

      {error && <InlineNotification kind="error" title={error} onClose={() => setError(null)} style={{ marginBottom: '1.5rem' }} />}

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <p className="form-section-title">Identificação</p>
          <Stack gap={5}>
            <TextInput id="numeroInscricao" labelText="Número de inscrição *" placeholder="Ex: 001" value={form.numeroInscricao} onChange={(e) => setField('numeroInscricao', e.target.value)} disabled={saving} required />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <TextInput id="marca"  labelText="Marca"  placeholder="Ex: Sea-Doo" value={form.marca}  onChange={(e) => setField('marca',  e.target.value)} disabled={saving} />
              <TextInput id="modelo" labelText="Modelo" placeholder="Ex: Spark"   value={form.modelo} onChange={(e) => setField('modelo', e.target.value)} disabled={saving} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <TextInput id="ano" labelText="Ano" placeholder="Ex: 2022" value={form.ano} onChange={(e) => setField('ano', e.target.value)} disabled={saving} />
              <TextInput id="cor" labelText="Cor" placeholder="Ex: Azul" value={form.cor} onChange={(e) => setField('cor', e.target.value)} disabled={saving} />
            </div>
          </Stack>
        </div>

        <div className="form-section">
          <p className="form-section-title">Serviços</p>
          <FormGroup legendText="">
            <Checkbox id="quadriciclo" labelText="Quadriciclo — utiliza o serviço de quadriciclo" checked={form.servicos.quadriciclo} onChange={() => toggleServico('quadriciclo')} disabled={saving} />
            <Checkbox id="flutuante"   labelText="Pier flutuante — utiliza o pier flutuante"      checked={form.servicos.flutuante}   onChange={() => toggleServico('flutuante')}   disabled={saving} />
          </FormGroup>
        </div>

        <div className="form-section">
          <p className="form-section-title">Proprietários</p>
          {form.proprietarios.map((owner, idx) => (
            <div key={owner.id} className="owner-card">
              <div className="owner-card-header">
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#393939' }}>Proprietário {idx + 1}</span>
                {form.proprietarios.length > 1 && (
                  <Button kind="danger--ghost" size="sm" renderIcon={TrashCan} iconDescription="Remover" onClick={() => removeOwner(idx)} disabled={saving} hasIconOnly />
                )}
              </div>
              <Stack gap={4}>
                <TextInput id={`nome-${owner.id}`}  labelText="Nome *"       value={owner.nome}  onChange={(e) => setOwnerField(idx, 'nome',  e.target.value)} disabled={saving} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <TextInput id={`apto-${owner.id}`} labelText="Apartamento" value={owner.apartamento} onChange={(e) => setOwnerField(idx, 'apartamento', e.target.value)} disabled={saving} />
                  <TextInput id={`tel-${owner.id}`}  labelText="Telefone"    value={owner.telefone}    onChange={(e) => setOwnerField(idx, 'telefone',    e.target.value)} disabled={saving} />
                </div>
                <TextInput id={`email-${owner.id}`} labelText="E-mail" type="email" value={owner.email} onChange={(e) => setOwnerField(idx, 'email', e.target.value)} disabled={saving} />
              </Stack>
            </div>
          ))}
          <Button kind="tertiary" size="sm" renderIcon={Add} onClick={addOwner} disabled={saving} style={{ marginTop: '0.5rem' }}>Adicionar proprietário</Button>
        </div>

        <div className="form-section">
          <p className="form-section-title">Foto do Jetski</p>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} disabled={saving} style={{ marginBottom: '0.75rem' }} />
          {preview && (
            <div>
              <img src={preview} alt="Preview" className="img-preview" />
              <Button kind="danger--ghost" size="sm" renderIcon={TrashCan} onClick={removeImage} disabled={saving} style={{ marginTop: '0.5rem' }}>Remover foto</Button>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid #e0e0e0' }}>
          {saving
            ? <InlineLoading description="Salvando…" />
            : <>
                <Button type="submit" renderIcon={Save}>{isEdit ? 'Salvar alterações' : 'Cadastrar jetski'}</Button>
                <Button kind="secondary" onClick={onCancel}>Cancelar</Button>
              </>
          }
        </div>
      </form>
    </div>
  );
}
