# 📝 Implementação de Assinatura Digital

## ✅ O que foi implementado

Sistema completo de **assinatura digital** para finalizar ocorrências com rastreamento de quem fez o relatório.

### Principais Características:

✅ **Assinatura Digital**
- Captura de assinatura em canvas/tela
- Suporte a formato Base64 ou URL (GCS)
- Validação automática de dados

✅ **Registro de Quem Assinou**
- Nome do assinante
- Função/role (ex: Bombeiro, Coordenador)
- Data/hora exata da assinatura
- IP e User Agent
- Informações do dispositivo

✅ **Integração com Ocorrência**
- Assinatura vinculada à ocorrência
- Finaliza ocorrência automaticamente
- Registra quem finalizou e quando
- Impossível modificar após finalização

✅ **Segurança**
- Autenticação JWT obrigatória
- Validação de dados de assinatura
- Proteção contra deleção de assinaturas finalizadas
- Auditoria completa

---

## 📦 Arquivos Criados/Modificados

### Novos Arquivos:

```
✨ Models/Signature.ts                      (Schema MongoDB)
✨ Services/SignatureService.ts             (Lógica de negócio)
✨ Controllers/SignatureControllers.ts      (Endpoints)
✨ Routes/SignatureRoutes.ts                (Rotas)
✨ Validations/SignatureValidation.ts       (Validações)
```

### Modificados:

```
📝 Models/Occurrence.ts                     (+3 campos)
📝 Interfaces/OccurrenceInterfaces.ts       (+ISignature, +2 campos)
📝 Services/OccurrenceService.ts            (+2 métodos)
📝 index.ts                                 (+rota)
```

---

## 🎯 7 Endpoints Disponíveis

### 1. Assinar Ocorrência (Finalizar)
```http
POST /api/signatures/sign
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "occurrenceId": "670f3a8c2b8d4e9f1a2b3c4d",
  "signerName": "João Silva",
  "signatureData": "data:image/png;base64,iVBORw0KGgoAAAA...",
  "signerRole": "Bombeiro",
  "screenResolution": "1920x1080"
}
```

**Response (201):**
```json
{
  "sucesso": true,
  "mensagem": "✅ Assinatura registrada com sucesso!",
  "dados": {
    "signature": {
      "_id": "670f3a8c2b8d4e9f1a2b3c4d",
      "signerName": "João Silva",
      "signerRole": "Bombeiro",
      "signedAt": "2024-12-06T10:30:00.000Z",
      "occurrence": {
        "_id": "670f3a8c2b8d4e9f1a2b3c4e",
        "numAviso": "AVG-2024-001",
        "statusGeral": "finalizada",
        "finalizadoEm": "2024-12-06T10:30:00.000Z"
      }
    }
  }
}
```

### 2. Obter Assinatura de uma Ocorrência
```http
GET /api/signatures/occurrence/:occurrenceId
```

### 3. Obter Assinatura por ID
```http
GET /api/signatures/:signatureId
```

### 4. Listar Minhas Assinaturas
```http
GET /api/signatures/user/my-signatures
Authorization: Bearer {token}
```

### 5. Atualizar Assinatura
```http
PATCH /api/signatures/:signatureId
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "signerRole": "Coordenador"
}
```

### 6. Deletar Assinatura
```http
DELETE /api/signatures/:signatureId
Authorization: Bearer {token}
```

### 7. Obter Estatísticas
```http
GET /api/signatures/stats/all
Authorization: Bearer {token}
```

**Response:**
```json
{
  "sucesso": true,
  "dados": {
    "totalSignatures": 150,
    "finalizedOccurrences": 150,
    "averageSigningTime": 45
  }
}
```

---

## 📊 Estrutura de Dados

### Signature Model
```typescript
{
    _id: ObjectId,
    occurrenceId: ObjectId,          // Link para ocorrência
    signerName: string,              // Nome de quem assinou
    signerRole?: string,             // Função (Bombeiro, etc)
    signatureData: string,           // Base64 ou URL do arquivo
    signedAt: Date,                  // Quando foi assinado
    ipAddress?: string,              // IP de quem assinou
    userAgent?: string,              // Navegador/app
    deviceInfo?: {
        platform?: string,           // mobile/desktop
        screenResolution?: string,   // resolução
        timestamp?: Date
    },
    createdAt: Date,
    updatedAt: Date
}
```

### Ocorrência Atualizada
```typescript
{
    // ... campos existentes ...
    finalizadoPor: ObjectId,         // ID do usuário que finalizou
    finalizadoEm: Date,              // Data de finalização
    signature: ObjectId,             // Link para assinatura
}
```

---

## 🔄 Fluxo de Uso

```
1. App mostra tela de assinatura
   ↓
2. Usuário desenha assinatura no canvas
   ↓
3. Converte canvas para Base64
   ↓
4. POST /api/signatures/sign
   {
     occurrenceId: "...",
     signerName: "João Silva",
     signatureData: "data:image/png;base64,...",
     signerRole: "Bombeiro"
   }
   ↓
5. Backend:
   - Valida assinatura
   - Cria documento Signature
   - Finaliza Ocorrência
   - Registra finalizadoPor e finalizadoEm
   ↓
6. Retorna sucesso com dados
```

---

## 💡 Exemplo de Uso - React/React Native

### Capturar Assinatura (Canvas)
```typescript
import SignaturePad from 'react-signature-canvas';
import { useRef } from 'react';

export const SignatureForm = ({ occurrenceId, onSuccess }) => {
  const signatureRef = useRef<SignaturePad>(null);
  const [signerName, setSignerName] = useState('');
  const [signerRole, setSignerRole] = useState('');

  const handleSign = async () => {
    if (!signatureRef.current?.isEmpty()) {
      const signatureData = signatureRef.current.toDataURL('image/png');
      
      const response = await fetch('/api/signatures/sign', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          occurrenceId,
          signerName,
          signerRole,
          signatureData,
          screenResolution: `${window.innerWidth}x${window.innerHeight}`
        })
      });

      const data = await response.json();
      if (data.sucesso) {
        onSuccess(data.dados);
      }
    }
  };

  return (
    <div>
      <input
        placeholder="Nome completo"
        value={signerName}
        onChange={(e) => setSignerName(e.target.value)}
      />
      <input
        placeholder="Função (ex: Bombeiro)"
        value={signerRole}
        onChange={(e) => setSignerRole(e.target.value)}
      />
      <SignaturePad
        ref={signatureRef}
        canvasProps={{
          width: 300,
          height: 200,
          className: 'border'
        }}
      />
      <button onClick={handleSign}>Assinar e Finalizar</button>
    </div>
  );
};
```

### Exibir Assinatura
```typescript
export const ViewSignature = ({ occurrenceId }) => {
  const [signature, setSignature] = useState(null);

  useEffect(() => {
    fetch(`/api/signatures/occurrence/${occurrenceId}`)
      .then(r => r.json())
      .then(data => {
        if (data.sucesso) {
          setSignature(data.dados);
        }
      });
  }, [occurrenceId]);

  return (
    <div>
      {signature && (
        <>
          <h3>Assinado por: {signature.signerName}</h3>
          <p>Função: {signature.signerRole}</p>
          <p>Data: {new Date(signature.signedAt).toLocaleDateString('pt-BR')}</p>
          <img src={signature.signatureData} alt="Assinatura" style={{maxWidth: '300px'}} />
        </>
      )}
    </div>
  );
};
```

---

## 🔒 Segurança

✅ **Implementado:**
- Autenticação JWT obrigatória em /sign e DELETE
- Validação de formato de assinatura (Base64 ou URL)
- Impossível assinar ocorrência finalizada
- Impossível deletar assinatura de ocorrência finalizada
- Rastreamento de IP e User Agent
- Campos de quem e quando foi finalizado

---

## 🚀 Validações Implementadas

| Campo | Validação | Mensagem |
|-------|-----------|----------|
| occurrenceId | Obrigatório + MongoDB ObjectId | ❌ ID da ocorrência é inválido |
| signerName | 3-100 caracteres + apenas letras | 👤 Nome deve ter 3-100 caracteres |
| signatureData | Base64 ou URL válida | ✍️ Assinatura deve ser base64 ou URL |
| signerRole | Máximo 50 caracteres | 🏷️ Função não pode exceder 50 caracteres |

---

## 📈 Métodos do SignatureService

```typescript
// Salvar assinatura e finalizar ocorrência
saveSignature(occurrenceId, signerName, signatureData, userId, ...)

// Obter assinatura de uma ocorrência
getSignatureByOccurrence(occurrenceId)

// Obter assinatura por ID
getSignatureById(signatureId)

// Listar assinaturas do usuário
getSignaturesByUser(userId)

// Atualizar assinatura
updateSignature(signatureId, updates)

// Deletar assinatura
deleteSignature(signatureId)

// Validar dados da assinatura
validateSignatureData(signatureData)

// Obter estatísticas
getSignatureStats()
```

---

## 🧪 Teste com cURL

```bash
# 1. Assinar ocorrência
curl -X POST http://localhost:3000/api/signatures/sign \
  -H "Authorization: Bearer seu-token" \
  -H "Content-Type: application/json" \
  -d '{
    "occurrenceId": "670f3a8c2b8d4e9f1a2b3c4d",
    "signerName": "João Silva",
    "signatureData": "data:image/png;base64,iVBORw0KGgo...",
    "signerRole": "Bombeiro"
  }'

# 2. Obter assinatura
curl -X GET http://localhost:3000/api/signatures/occurrence/670f3a8c2b8d4e9f1a2b3c4d

# 3. Listar minhas assinaturas
curl -X GET http://localhost:3000/api/signatures/user/my-signatures \
  -H "Authorization: Bearer seu-token"

# 4. Ver estatísticas
curl -X GET http://localhost:3000/api/signatures/stats/all \
  -H "Authorization: Bearer seu-token"
```

---

## 📝 Próximos Passos (Opcional)

- [ ] Upload de assinatura para Google Cloud Storage
- [ ] Geração de PDF com assinatura
- [ ] Validação biométrica
- [ ] Múltiplas assinaturas por ocorrência
- [ ] Approval workflow
- [ ] Notificação por email quando assinado
- [ ] Histórico de assinaturas

---

**Status**: ✅ Implementado e pronto para usar!

**Data**: 6 de dezembro de 2024

---

## 🎓 Diagrama de Fluxo

```
┌─────────────────────────────────────┐
│   Tela de Finalização da Ocorrência │
└─────────────┬───────────────────────┘
              │
              ├─ Canvas de Assinatura
              ├─ Campo: Nome do Assinante
              ├─ Campo: Função (opcional)
              └─ Botão: Assinar e Finalizar
                        │
                        ▼
              POST /api/signatures/sign
                        │
         ┌──────────────┴──────────────┐
         │  Backend Validações         │
         ├──────────────┬──────────────┤
         │ ✓ JWT Token  │              │
         │ ✓ Campos OK  │ Ocorrência   │
         │ ✓ Assinatura │ ainda em     │
         │   válida     │ andamento?   │
         └──────┬───────┴──────┬───────┘
                │              │
               SIM            NÃO
                │              │
                ▼              ▼
         Salvar Signature   Erro 400
                │
         Finalizar Occurrence
         (statusGeral = finalizada)
                │
         Registrar finalizadoPor
              e finalizadoEm
                │
                ▼
         Retornar sucesso com
         dados da assinatura
```
