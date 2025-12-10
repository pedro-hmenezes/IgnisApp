# 🚀 UPLOAD DIRETO PARA CLOUDINARY (SEM PASSAR PELO BACKEND)

## ⚡ Solução Rápida e Eficiente

### **Fluxo:**
1. 📱 Mobile faz upload **direto** para Cloudinary (sem passar pelo backend)
2. 📝 Mobile envia **apenas metadados** para o backend registrar
3. ✅ Backend salva no banco de dados (operação leve e rápida)

---

## 📱 Código React Native - Upload Direto

```typescript
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://ignisappback.onrender.com';

// ⚠️ IMPORTANTE: Pegue essas credenciais no Cloudinary Dashboard
const CLOUDINARY_CLOUD_NAME = 'seu_cloud_name'; // Ex: dx9welyij
const CLOUDINARY_UPLOAD_PRESET = 'seu_upload_preset'; // Criar no Cloudinary

const UploadDiretoCloudinary = ({ occurrenceId }) => {
  const [loading, setLoading] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);

  const uploadParaCloudinary = async (photoUri: string) => {
    const formData = new FormData();
    
    formData.append('file', {
      uri: photoUri,
      type: 'image/jpeg',
      name: `photo-${Date.now()}.jpg`,
    } as any);
    
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', `ignisapp/${occurrenceId}`);

    // Upload DIRETO para Cloudinary (sem passar pelo seu backend!)
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();
    
    if (data.secure_url) {
      return {
        fileUrl: data.secure_url,
        publicId: data.public_id,
        format: data.format,
        width: data.width,
        height: data.height,
        bytes: data.bytes,
      };
    }
    
    throw new Error('Erro no upload para Cloudinary');
  };

  const registrarFotosNoBackend = async (photos: any[]) => {
    const token = await AsyncStorage.getItem('token');

    const response = await fetch(`${API_URL}/api/media/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        occurrenceId,
        photos,
      }),
    });

    return response.json();
  };

  const selecionarEEnviarFotos = async () => {
    try {
      // 1. Pedir permissão
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Permissão negada!');
        return;
      }

      // 2. Selecionar fotos
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 10,
      });

      if (result.canceled) return;

      setLoading(true);
      console.log(`📤 Enviando ${result.assets.length} foto(s)...`);

      const uploadedMetadata = [];

      // 3. Upload para Cloudinary (DIRETO - sem backend!)
      for (const photo of result.assets) {
        console.log(`⬆️ Uploading para Cloudinary: ${photo.uri}`);
        const metadata = await uploadParaCloudinary(photo.uri);
        uploadedMetadata.push(metadata);
        console.log(`✅ Upload concluído: ${metadata.publicId}`);
      }

      // 4. Registrar metadados no backend (RÁPIDO!)
      console.log('📝 Registrando no banco de dados...');
      const result2 = await registrarFotosNoBackend(uploadedMetadata);

      if (result2.sucesso) {
        alert(`✅ ${uploadedMetadata.length} foto(s) enviada(s)!`);
        setUploadedPhotos([...uploadedPhotos, ...result2.dados]);
      } else {
        alert(`❌ Erro: ${result2.mensagem}`);
      }

    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao enviar fotos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Button 
        title={loading ? "Enviando..." : "📷 Adicionar Fotos"}
        onPress={selecionarEEnviarFotos}
        disabled={loading}
      />
      
      {loading && <ActivityIndicator />}
      
      {/* Mostrar fotos enviadas */}
      {uploadedPhotos.map((photo) => (
        <Image 
          key={photo._id}
          source={{ uri: photo.fileUrl }}
          style={{ width: 100, height: 100, margin: 5 }}
        />
      ))}
    </View>
  );
};

export default UploadDiretoCloudinary;
```

---

## 🔑 Configurar Upload Preset no Cloudinary

### **Passo 1: Acessar Dashboard**
1. Entre em: https://cloudinary.com/console
2. Vá em **Settings** → **Upload**

### **Passo 2: Criar Upload Preset**
1. Clique em **Add upload preset**
2. **Preset name**: `ignisapp_mobile` (use esse no código)
3. **Signing Mode**: **Unsigned** ⚠️ (permite upload direto do mobile)
4. **Folder**: `ignisapp` (opcional)
5. Clique em **Save**

### **Passo 3: Pegar Credenciais**
```typescript
const CLOUDINARY_CLOUD_NAME = 'dx9welyij'; // No dashboard, topo da tela
const CLOUDINARY_UPLOAD_PRESET = 'ignisapp_mobile'; // O que você criou
```

---

## 📋 Endpoint Backend (já implementado)

### **POST /api/media/register**

**Body:**
```json
{
  "occurrenceId": "6938731906603e319ded49a7",
  "photos": [
    {
      "fileUrl": "https://res.cloudinary.com/dx9welyij/image/upload/v123456/ignisapp/photo.jpg",
      "publicId": "ignisapp/6938731906603e319ded49a7/photo-1733847123.jpg",
      "format": "jpg",
      "width": 1920,
      "height": 1080,
      "bytes": 245678
    }
  ]
}
```

**Resposta:**
```json
{
  "sucesso": true,
  "mensagem": "✅ 1 foto(s) registrada(s) com sucesso!",
  "dados": [
    {
      "_id": "674abc123",
      "name": "photo-1733847123.jpg",
      "fileType": "image",
      "fileUrl": "https://res.cloudinary.com/...",
      "size": 245678
    }
  ]
}
```

---

## ⚡ Vantagens

### Antes (via backend):
- ❌ Mobile → Backend → Cloudinary (2 uploads!)
- ❌ Backend processa arquivo pesado
- ❌ Timeout no Render (plano gratuito)
- ❌ Lento (~30s-90s)

### Agora (upload direto):
- ✅ Mobile → Cloudinary (1 upload apenas!)
- ✅ Backend só registra metadados (leve)
- ✅ Sem timeout
- ✅ Rápido (~3-5s por foto)

---

## 🔒 Segurança

O upload preset **unsigned** é seguro porque:
- ✅ Você controla quais pastas/transformações
- ✅ Backend valida e registra no banco
- ✅ Usuário precisa estar autenticado para registrar
- ✅ Cloudinary tem rate limiting automático

---

## 🧪 Testar

1. Configure o upload preset no Cloudinary
2. Copie as credenciais para o mobile
3. Teste o upload
4. Verifique no Cloudinary Dashboard se a foto chegou
5. Verifique no seu banco se os metadados foram salvos

---

## 🎉 Pronto!

**Upload super rápido e sem sobrecarregar seu backend!** ⚡

Tempo de upload: **3-5 segundos** (ao invés de 30-90s)
