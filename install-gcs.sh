#!/bin/bash
# Script de Instalação - Google Cloud Storage
# Este script instala as dependências necessárias

echo "🚀 Instalando dependências do Google Cloud Storage..."

# Instalar @google-cloud/storage
npm install @google-cloud/storage

echo "✅ Dependências instaladas com sucesso!"
echo ""
echo "📝 Próximos passos:"
echo "1. Configure suas credenciais do Google Cloud no arquivo .env"
echo "2. Crie um bucket no Google Cloud Storage"
echo "3. Coloque o arquivo de credenciais JSON em: ./credentials/google-cloud-key.json"
echo "4. Execute: npm run dev"
echo ""
echo "📚 Para mais informações, veja: GOOGLE_CLOUD_SETUP.md"
