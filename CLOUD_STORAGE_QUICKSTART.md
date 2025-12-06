# 🎥 Implementação Google Cloud Storage - Quick Start

## ✅ O que foi implementado

### 1. **Serviços de Cloud Storage**
- ✅ `CloudStorageService.ts` - Gerencia uploads/downloads do Google Cloud Storage
- ✅ Suporte para múltiplos arquivos
- ✅ URLs assinadas (expiram em 7 dias)
- ✅ Delete de arquivos do GCS
- ✅ Metadados e informações de arquivo

### 2. **Modelo de Dados Atualizado**
- ✅ Campo `occurrenceId` - Link para ocorrência
- ✅ Campo `fileType` - Tipo de arquivo (image/video/document)
- ✅ Campo `fileUrl` - URL assinada para acesso
- ✅ Campo `cloudStorage` - Indica armazenamento na nuvem
- ✅ Campo `uploadedBy` - ID do usuário que fez upload
- ✅ Campo `metadata` - Informações adicionais (tamanho, duração, etc)

### 3. **Controlador de Mídia**
- ✅ Upload único: `POST /api/media/upload`
- ✅ Upload múltiplo: `POST /api/media/upload-multiple`
- ✅ Download: `GET /api/media/download/{id}`
- ✅ URL Assinada: `GET /api/media/signed-url/{id}`
- ✅ Listar: `GET /api/media`
- ✅ Por ocorrência: `GET /api/media/occurrence/{occurrenceId}`
- ✅ Deletar: `DELETE /api/media/{id}`

### 4. **Middleware de Upload**
- ✅ Armazenamento em memória (não precisa de disco local)
- ✅ Filtro de tipos de arquivo (imagens e vídeos)
- ✅ Limite de tamanho: 500MB por arquivo
- ✅ Máximo 10 arquivos por requisição

---

## 🚀 Próximos Passos

### 1. Instalar Dependência Google Cloud

```bash
npm install @google-cloud/storage
```

### 2. Configurar Credenciais

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar .env com suas credenciais
GCS_PROJECT_ID=seu-project-id
GCS_BUCKET_NAME=seu-bucket-name
GCS_KEY_FILE=./credentials/google-cloud-key.json
```

### 3. Adicionar Arquivo de Credenciais

1. Baixe credenciais JSON do Google Cloud Console
2. Crie pasta: `mkdir credentials`
3. Coloque arquivo: `credentials/google-cloud-key.json`

### 4. Atualizar `.gitignore`

```
credentials/
.env
```

### 5. Testar Upload

```bash
# Via cURL
curl -X POST http://localhost:3000/api/media/upload \
  -H "Authorization: Bearer seu-token" \
  -F "media=@foto.jpg"
```

---

## 📚 Documentação Completa

Veja `GOOGLE_CLOUD_SETUP.md` para:
- Setup completo passo a passo
- Exemplos de código (TypeScript, React, React Native)
- Segurança e best practices
- Deploy em Google Cloud Run
- Tratamento de erros

---

## 🎯 Fluxo de Uso

```
Frontend (React/React Native)
         ↓
   Capturar Foto/Vídeo
         ↓
   FormData + Auth Token
         ↓
POST /api/media/upload
         ↓
   Multer (Buffer em Memória)
         ↓
   CloudStorageService
         ↓
   Google Cloud Storage
         ↓
   Salvar URL + Metadados no MongoDB
         ↓
   Retornar URL Assinada ao Frontend
```

---

## 🔒 Arquivos Criados/Modificados

**Novos:**
- `Config/googleCloud.ts`
- `Services/CloudStorageService.ts`
- `GOOGLE_CLOUD_SETUP.md`
- `.env.example`

**Modificados:**
- `Models/Media.ts` - Adicionados novos campos
- `Services/MediaService.ts` - Integração com GCS
- `Controllers/MediaControllers.ts` - Endpoints melhorados
- `Middleware/uploadMedia.ts` - Multer em memória
- `Routes/MediaRoutes.ts` - Rotas completas
- `index.ts` - Rota de mídia registrada

---

## 🆘 Troubleshooting

### Erro: "Cannot find module '@google-cloud/storage'"
```bash
npm install @google-cloud/storage
```

### Erro: "GCS_PROJECT_ID is not defined"
```bash
# Verificar .env
cat .env
# Reiniciar servidor após editar .env
```

### Erro: "Arquivo não encontrado"
- Verifique se credenciais estão corretas
- Verifique permissões da Service Account no Google Cloud
- Verifique se bucket existe e nome está correto

### URL Assinada expirou
- URLs expiram em 7 dias por padrão
- Obtenha nova URL via: `GET /api/media/signed-url/{id}`

---

## 💡 Dicas

1. **Para produção**: Use Application Default Credentials ao invés de arquivo local
2. **Performance**: Use CDN do Google Cloud para servir imagens
3. **Compressão**: Comprima imagens antes de enviar
4. **Vídeos**: Considere usar Cloud Video Intelligence para análise

---

**Status**: ✅ Pronto para usar!
