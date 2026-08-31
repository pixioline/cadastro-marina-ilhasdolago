# Cadastro Marina Ilhas do Lago — Jetskis

Aplicação web para cadastro e visualização dos jetskis dos moradores da Marina Ilhas do Lago.

## Tecnologias

- **React 19** + Create React App
- **IBM Carbon Design System v11** (`@carbon/react`, `@carbon/styles`, `@carbon/icons-react`)
- **Persistência local**: `localStorage` com estrutura JSON (sem banco de dados)

## Funcionalidades

- ✅ Cadastro de jetskis com número de inscrição, marca, modelo, ano e cor
- ✅ Múltiplos proprietários por jetski (nome, apartamento, telefone, e-mail)
- ✅ Indicação de serviços: **Quadriciclo** e/ou **Flutuante**
- ✅ Anexo de imagem do jetski (armazenada em base64)
- ✅ Listagem com busca por inscrição, marca, modelo ou proprietário
- ✅ Visualização detalhada com exibição do JSON
- ✅ Edição e exclusão de registros
- ✅ Dados persistidos no `localStorage` do navegador

## Estrutura de dados (JSON)

```json
{
  "id": "jsk_1234567890_abcde",
  "numeroInscricao": "AB-1234",
  "marca": "Yamaha",
  "modelo": "WaveRunner FX",
  "ano": "2022",
  "cor": "Azul e branco",
  "imagemBase64": "data:image/jpeg;base64,...",
  "servicos": {
    "quadriciclo": true,
    "flutuante": false
  },
  "proprietarios": [
    {
      "id": "jsk_...",
      "nome": "João da Silva",
      "apartamento": "302",
      "telefone": "(61) 9 9999-9999",
      "email": "joao@email.com"
    }
  ],
  "dataCadastro": "2024-01-15T10:30:00.000Z",
  "dataAtualizacao": "2024-01-15T10:30:00.000Z"
}
```

## Como rodar

```bash
npm install
npm start
```

Acesse [http://localhost:3000](http://localhost:3000)
