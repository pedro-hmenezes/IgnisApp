# 📸 Guia de Implementação: Google Cloud Storage para Fotos e Vídeos

## 📋 Sumário
- [Instalação de Dependências](#instalação-de-dependências)
- [Configuração Google Cloud](#configuração-google-cloud)
- [Configuração do Projeto](#configuração-do-projeto)
- [API de Endpoints](#api-de-endpoints)
- [Exemplos de Uso](#exemplos-de-uso)
- [Frontend Integration](#frontend-integration)

---

## 🔧 Instalação de Dependências

### 1. Instalar Google Cloud Storage SDK

```bash
npm install @google-cloud/storage
```

### Adicionar tipos TypeScript (opcional):

```bash
npm install --save-dev @types/google-cloud__storage
```

---

## 🌐 Configuração Google Cloud

### 1. Criar Projeto no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto
3. Anote o **Project ID**

### 2. Habilitar Cloud Storage API

1. No Console, vá para **APIs & Services > Library**
2. Procure por **Cloud Storage API**
3. Clique em **Enable**

### 3. Criar Service Account

1. Vá para **APIs & Services > Credentials**
2. Clique em **Create Credentials > Service Account**
3. Preencha o nome e descrição
4. Clique em **Create and Continue**
5. Pule as etapas opcionais

### 4. Gerar Chave de Credenciais

1. Na página da Service Account, vá para a aba **Keys**
2. Clique em **Add Key > Create new key**
3. Escolha **JSON**
4. A chave será baixada automaticamente
5. **Guarde este arquivo com segurança!**

### 5. Criar um Bucket

1. Vá para **Cloud Storage > Buckets**
2. Clique em **Create**
3. Nome do bucket (deve ser único globalmente)
4. Deixe outras opções padrão
5. Clique em **Create**

---

## 🛠️ Configuração do Projeto

### 1. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env`:

```env
# Google Cloud Storage
GCS_PROJECT_ID=seu-project-id-aqui
GCS_BUCKET_NAME=seu-bucket-name-aqui
GCS_KEY_FILE=./credentials/google-cloud-key.json
```

### 2. Copiar Credenciais

1. Crie a pasta `credentials/` na raiz do projeto
2. Coloque o arquivo JSON baixado do Google Cloud lá
3. Renomeie para `google-cloud-key.json` (ou use outro nome)
4. **Nunca commite este arquivo no Git!**

Adicione ao `.gitignore`:

```
credentials/
.env
```

### 3. Alternativa: Usar Application Default Credentials

Se estiver deployando em Google Cloud (App Engine, Cloud Run):

```env
GCS_PROJECT_ID=seu-project-id-aqui
GCS_BUCKET_NAME=seu-bucket-name-aqui
# GCS_KEY_FILE não é necessário
```

---

## 🌍 API de Endpoints

### Base URL
```
/api/media
```

### 1. **Upload de Arquivo Único**
```http
POST /api/media/upload
Content-Type: multipart/form-data
Authorization: Bearer {token}

Form Data:
- media: <arquivo>
- occurrenceId: (opcional) {mongoId}
```

**Response (201):**
```json
{
  "sucesso": true,
  "mensagem": "✅ Arquivo enviado com sucesso!",
  "dados": {
    "_id": "...",
    "name": "foto.jpg",
    "fileType": "image",
    "fileUrl": "https://storage.googleapis.com/...",
    "size": 2048576,
    "mimeType": "image/jpeg",
    "cloudStorage": true,
    "uploadedAt": "2024-12-06T10:30:00Z"
  }
}
```

### 2. **Upload de Múltiplos Arquivos**
```http
POST /api/media/upload-multiple
Content-Type: multipart/form-data
Authorization: Bearer {token}

Form Data:
- media: <arquivo1>
- media: <arquivo2>
- media: <vídeo.mp4>
- occurrenceId: (opcional) {mongoId}
```

**Response (201):**
```json
{
  "sucesso": true,
  "mensagem": "✅ 3 arquivo(s) enviado(s) com sucesso!",
  "dados": [...]
}
```

### 3. **Download de Arquivo**
```http
GET /api/media/download/{mediaId}
```

Retorna o arquivo com headers apropriados para download.

### 4. **Obter URL Assinada**
```http
GET /api/media/signed-url/{mediaId}?expiresIn=604800000
```

**Response (200):**
```json
{
  "sucesso": true,
  "mensagem": "✅ URL assinada gerada com sucesso!",
  "dados": {
    "url": "https://storage.googleapis.com/...",
    "expiresIn": 604800000
  }
}
```

### 5. **Listar Todos os Arquivos**
```http
GET /api/media
```

**Response (200):**
```json
{
  "sucesso": true,
  "dados": [...]
}
```

### 6. **Obter Arquivo por ID**
```http
GET /api/media/{mediaId}
```

### 7. **Obter Arquivos de uma Ocorrência**
```http
GET /api/media/occurrence/{occurrenceId}
```

### 8. **Deletar Arquivo**
```http
DELETE /api/media/{mediaId}
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "sucesso": true,
  "mensagem": "✅ Arquivo deletado com sucesso!"
}
```

### 9. **Deletar Múltiplos Arquivos**
```http
DELETE /api/media/delete-multiple
Content-Type: application/json
Authorization: Bearer {token}

Body:
{
  "ids": ["id1", "id2", "id3"]
}
```

---

## 💡 Exemplos de Uso

### JavaScript/TypeScript (Fetch API)

#### Upload Único

```typescript
async function uploadFile(file: File, occurrenceId?: string) {
    const formData = new FormData();
    formData.append('media', file);
    if (occurrenceId) {
        formData.append('occurrenceId', occurrenceId);
    }

    const response = await fetch('/api/media/upload', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });

    const data = await response.json();
    if (data.sucesso) {
        console.log('✅ Upload realizado:', data.dados);
        return data.dados;
    } else {
        console.error('❌ Erro:', data.mensagem);
    }
}
```

#### Upload Múltiplo

```typescript
async function uploadMultipleFiles(
    files: FileList,
    occurrenceId?: string
) {
    const formData = new FormData();
    
    for (let file of files) {
        formData.append('media', file);
    }
    
    if (occurrenceId) {
        formData.append('occurrenceId', occurrenceId);
    }

    const response = await fetch('/api/media/upload-multiple', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });

    return await response.json();
}
```

#### Download

```typescript
async function downloadFile(mediaId: string) {
    const response = await fetch(`/api/media/download/${mediaId}`);
    const blob = await response.blob();
    
    // Criar link de download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'arquivo';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
}
```

#### Obter URL Assinada

```typescript
async function getStreamingUrl(mediaId: string) {
    const response = await fetch(`/api/media/signed-url/${mediaId}`);
    const data = await response.json();
    
    if (data.sucesso) {
        // Use a URL para visualizar/reproduzir em player
        return data.dados.url;
    }
}
```

### React Native (Expo)

```typescript
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

async function pickAndUploadImage() {
    const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
    });

    if (!result.canceled) {
        const file = result.assets[0];
        
        const formData = new FormData();
        formData.append('media', {
            uri: file.uri,
            name: file.fileName || `photo-${Date.now()}.jpg`,
            type: file.type,
        });

        const response = await fetch(`${API_URL}/media/upload`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        const data = await response.json();
        console.log('Upload realizado:', data);
    }
}
```

### cURL

```bash
# Upload
curl -X POST http://localhost:3000/api/media/upload \
  -H "Authorization: Bearer {token}" \
  -F "media=@/path/to/file.jpg" \
  -F "occurrenceId=123456"

# Download
curl -X GET http://localhost:3000/api/media/download/mediaId \
  -o downloaded-file.jpg

# Deletar
curl -X DELETE http://localhost:3000/api/media/mediaId \
  -H "Authorization: Bearer {token}"
```

---

## 🎯 Frontend Integration

### React Component Example

```typescript
import React, { useState } from 'react';

interface UploadProps {
    occurrenceId?: string;
    onSuccess?: (media: any) => void;
}

export const MediaUpload: React.FC<UploadProps> = ({
    occurrenceId,
    onSuccess,
}) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        setUploading(true);
        setError('');

        try {
            const formData = new FormData();
            for (let file of files) {
                formData.append('media', file);
            }
            if (occurrenceId) {
                formData.append('occurrenceId', occurrenceId);
            }

            const response = await fetch('/api/media/upload-multiple', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: formData,
            });

            const data = await response.json();

            if (data.sucesso) {
                onSuccess?.(data.dados);
            } else {
                setError(data.mensagem);
            }
        } catch (err) {
            setError('Erro ao fazer upload');
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div>
            <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleUpload}
                disabled={uploading}
            />
            {uploading && <p>Enviando...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};
```

---

## 🔒 Segurança

### Best Practices

1. **Nunca commite credenciais** no Git
2. **Use variáveis de ambiente** para dados sensíveis
3. **Implemente autenticação** em todos os endpoints (feito com `authMiddleware`)
4. **URLs assinadas expiram** automaticamente em 7 dias
5. **Valide tipos de arquivo** no servidor (feito no `uploadMedia.ts`)
6. **Limite tamanho de upload** (500MB definido)

### Política de Acesso ao Bucket

No Google Cloud Console:

1. Vá para **Cloud Storage > Buckets > Seu Bucket**
2. Aba **Permissions**
3. Adicione a Service Account com role **Storage Object Creator** e **Storage Object Viewer**

---

## 📝 Campos do Documento Media

```typescript
{
    _id: ObjectId,
    occurrenceId?: ObjectId,           // Referência à ocorrência
    name: string,                       // Nome original do arquivo
    fileType: 'image' | 'video' | 'document' | 'unknown',
    filePath: string,                   // Caminho no GCS
    fileUrl?: string,                   // URL assinada
    capturedAt: Date,                   // Data do upload
    size: number,                       // Tamanho em bytes
    mimeType: string,                   // Ex: image/jpeg, video/mp4
    uploaded: boolean,                  // Sempre true
    cloudStorage: boolean,              // Sempre true
    uploadedBy?: ObjectId,              // ID do usuário
    metadata?: {
        width?: number,
        height?: number,
        duration?: number,
        ...
    },
    createdAt: Date,
    updatedAt: Date
}
```

---

## 🚀 Deploy

### Google Cloud Run

```bash
gcloud run deploy ignisapp \
  --source . \
  --set-env-vars GCS_PROJECT_ID=seu-project-id,GCS_BUCKET_NAME=seu-bucket \
  --region us-central1
```

---

## 📚 Recursos Úteis

- [Google Cloud Storage Documentation](https://cloud.google.com/storage/docs)
- [Node.js Client Library](https://cloud.google.com/nodejs/docs/reference/storage/latest)
- [Signed URLs Guide](https://cloud.google.com/storage/docs/access-control/signed-urls)

---

**Status**: ✅ Implementado e pronto para uso!
