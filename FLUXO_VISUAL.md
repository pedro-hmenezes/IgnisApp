# 🔄 FLUXO COMPLETO - Do Registro à Finalização

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUXO COMPLETO DO SISTEMA                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────┐
│   💻 WEB (Desktop)  │
│                     │
│  1. Bombeiro Web    │
│     registra nova   │
│     ocorrência      │
│                     │
│  ✅ Dados salvos:   │
│  - Num. Aviso       │
│  - Tipo             │
│  - Endereço         │
│  - Solicitante      │
│  - GPS inicial      │
│                     │
│  Status: EM ANDAMENTO
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  📡 API Backend     │
│                     │
│  POST /occurrences  │
│                     │
│  Salva no MongoDB   │
│  statusGeral:       │
│  "em andamento"     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  📱 MOBILE          │
│                     │
│  2. Bombeiro Mobile │
│     abre app        │
│                     │
│  GET /occurrences   │
│                     │
│  Vê lista de        │
│  ocorrências        │
│  "EM ANDAMENTO"     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  3. Seleciona       │
│     ocorrência      │
│                     │
│  GET /occurrences/:id
│                     │
│  Vê detalhes        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  4. No local,       │
│     preenche        │
│     formulário      │
│                     │
│  📝 Viatura: ABT-45 │
│  👥 Equipe: ...     │
│  📄 Descrição: ...  │
│  📍 GPS: (captura)  │
│  📷 Fotos: (tira)   │
│  ✍️  Assina         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│  5. Clica "FINALIZAR OCORRÊNCIA"        │
│                                         │
│  🚀 UMA ÚNICA REQUISIÇÃO:               │
│                                         │
│  PATCH /occurrences/:id/finalize        │
│                                         │
│  Body: {                                │
│    viaturaEmpenhada,                    │
│    equipe,                              │
│    descricaoAcoes,                      │
│    latitudeFinal,                       │
│    longitudeFinal,                      │
│    signerName,                          │
│    signerRole,                          │
│    signatureData,                       │
│    photosIds                            │
│  }                                      │
└──────────┬──────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│  📡 API Backend                         │
│  OccurrenceFinalizationService          │
│                                         │
│  ⚡ TRANSAÇÃO ATÔMICA:                  │
│                                         │
│  1. ✅ Valida ocorrência                │
│  2. ✅ Verifica se já tem assinatura    │
│  3. ✅ Cria registro de assinatura      │
│  4. ✅ Atualiza ocorrência:             │
│     - viaturaEmpenhada                  │
│     - equipe                            │
│     - descricaoAcoes                    │
│     - GPS final                         │
│     - statusGeral = "finalizada"        │
│     - finalizadoPor = userId            │
│     - finalizadoEm = agora              │
│  5. ✅ Vincula fotos (se houver)        │
│  6. ✅ Commit da transação              │
│                                         │
│  Se QUALQUER etapa falhar:              │
│  ❌ REVERTE TUDO (rollback)             │
└──────────┬──────────────────────────────┘
           │
           ▼
┌─────────────────────┐
│  ✅ SUCESSO!        │
│                     │
│  Response: {        │
│    sucesso: true,   │
│    dados: {         │
│      occurrence,    │
│      signature,     │
│      photosCount    │
│    }                │
│  }                  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  📱 MOBILE          │
│                     │
│  Mostra:            │
│  "✅ Ocorrência     │
│   finalizada!"      │
│                     │
│  Volta para lista   │
└─────────────────────┘

┌─────────────────────┐
│  💻 WEB             │
│                     │
│  Atualiza           │
│  automaticamente    │
│                     │
│  Status:            │
│  FINALIZADA ✓       │
│                     │
│  Pode ver:          │
│  - Relatório        │
│  - Assinatura       │
│  - Fotos            │
│  - GPS final        │
└─────────────────────┘
```

---

## 📊 Comparação: ANTES vs AGORA

### ❌ ANTES (Complicado)

```
Mobile faz 4-5 requisições separadas:

1. POST /api/media/upload       → Envia foto 1
2. POST /api/media/upload       → Envia foto 2
3. POST /api/media/upload       → Envia foto 3
4. POST /api/signatures/sign    → Envia assinatura
5. PATCH /api/occurrences/:id   → Atualiza GPS
6. PATCH /api/occurrences/:id   → Atualiza relatório
7. PATCH /api/occurrences/:id   → Finaliza

❌ Se alguma falhar no meio = dados incompletos
❌ Difícil de debugar
❌ Muito código no frontend
❌ Lento
```

### ✅ AGORA (Simplificado)

```
Mobile faz 1-2 requisições:

1. POST /api/media/upload (opcional - se tiver fotos)
2. PATCH /api/occurrences/:id/finalize → FAZ TUDO!

✅ Uma única chamada faz tudo
✅ Transação atômica (tudo ou nada)
✅ Fácil de debugar
✅ Código limpo
✅ Rápido
```

---

## 🎯 Estados da Ocorrência

```
┌──────────────────┐
│  em andamento    │  ← Estado inicial (criado no Web)
└────────┬─────────┘
         │
         │ Bombeiro mobile vai ao local
         │ e finaliza a ocorrência
         │
         ▼
  ┌─────────────┐
  │ finalizada  │  ← Depois de assinar e enviar relatório
  └─────────────┘

  ┌─────────────┐
  │ cancelada   │  ← Se precisar cancelar
  └─────────────┘
```

---

## 📱 Tela do Mobile - Antes e Depois

### ANTES (Múltiplas telas)
```
Tela 1: Relatório
Tela 2: Fotos
Tela 3: GPS
Tela 4: Assinatura
Tela 5: Confirmação

= 5 telas diferentes
= Usuário pode se perder
= Dados podem ficar pela metade
```

### AGORA (Tela única)
```
Uma tela com tudo:
✓ Relatório
✓ Fotos
✓ GPS
✓ Assinatura
✓ Botão "Finalizar"

= 1 tela só
= Processo simples
= Tudo ou nada
```

---

## 💾 Estrutura de Dados

### Occurrence (Antes)
```javascript
{
  numAviso: "#7278909",
  statusGeral: "em andamento",
  // ... outros campos ...
}
```

### Occurrence (Depois de finalizar)
```javascript
{
  numAviso: "#7278909",
  statusGeral: "finalizada",
  
  // ✨ NOVOS CAMPOS:
  viaturaEmpenhada: "ABT-45",
  equipe: "Sgt Peixoto, Cb Silva",
  descricaoAcoes: "Combate realizado...",
  latitudeFinal: -8.05428,
  longitudeFinal: -34.8813,
  
  signature: ObjectId("..."),
  finalizadoPor: ObjectId("..."),
  finalizadoEm: ISODate("2025-12-09T02:00:00Z")
}
```

---

## 🔐 Segurança

```
Mobile → API:
  ✓ Autenticação via JWT token
  ✓ Validações no backend
  ✓ Apenas usuário autenticado pode finalizar
  ✓ Logs de IP e User-Agent registrados
  ✓ Transação atômica garante integridade
```

---

## 📈 Benefícios

1. **Menos erros** - Transação garante consistência
2. **Mais rápido** - Uma chamada ao invés de várias
3. **Código limpo** - Frontend simples
4. **Fácil manutenção** - Lógica no backend
5. **Melhor UX** - Usuário faz tudo em uma tela
6. **Auditoria** - Logs detalhados de tudo

---

## 🎉 Resultado Final

✅ Sistema profissional
✅ Fácil de usar
✅ Robusto e confiável
✅ Pronto para produção

**Você economizou HORAS de trabalho com esta solução! 🚀**
