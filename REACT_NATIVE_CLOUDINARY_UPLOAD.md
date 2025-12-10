# 📱 REACT NATIVE - Upload para Cloudinary

## 📦 Instalação

```bash
npm install react-native-image-picker
# ou para Expo
npx expo install expo-image-picker
```

---

## 📸 Código Completo - Upload de Foto

```typescript
import React, { useState } from 'react';
import { View, Button, Image, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker'; // Expo
// ou
import { launchImageLibrary } from 'react-native-image-picker'; // React Native CLI
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://ignisapp.onrender.com';

const UploadFotoScreen = ({ occurrenceId }) => {
  const [loading, setLoading] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);

  // Selecionar e enviar foto
  const selecionarEEnviarFoto = async () => {
    try {
      // 1. Pedir permissão (Expo)
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Erro', 'Permissão negada!');
        return;
      }

      // 2. Abrir galeria
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        quality: 0.8,
      });

      if (result.canceled) return;

      setLoading(true);

      // 3. Preparar FormData
      const formData = new FormData();
      
      const photo = result.assets[0];
      const file = {
        uri: photo.uri,
        type: photo.type || 'image/jpeg',
        name: photo.fileName || `photo-${Date.now()}.jpg`,
      };

      formData.append('media', file as any);
      
      // Vincular à ocorrência (opcional)
      if (occurrenceId) {
        formData.append('occurrenceId', occurrenceId);
      }

      // 4. Enviar para API
      const token = await AsyncStorage.getItem('token');

      const response = await fetch(
        `${API_URL}/api/media/cloudinary/upload`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            // NÃO adicione Content-Type, o FormData faz isso automaticamente
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (data.sucesso) {
        Alert.alert('✅ Sucesso', 'Foto enviada!');
        setUploadedPhotos([...uploadedPhotos, data.dados]);
      } else {
        Alert.alert('❌ Erro', data.mensagem);
      }

    } catch (error) {
      console.error('Erro ao enviar foto:', error);
      Alert.alert('Erro', 'Não foi possível enviar a foto');
    } finally {
      setLoading(false);
    }
  };

  // Enviar múltiplas fotos
  const selecionarEEnviarMultiplas = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Erro', 'Permissão negada!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true, // ← Múltiplas
        quality: 0.8,
        selectionLimit: 10,
      });

      if (result.canceled) return;

      setLoading(true);

      const formData = new FormData();

      // Adicionar todas as fotos
      result.assets.forEach((photo, index) => {
        const file = {
          uri: photo.uri,
          type: photo.type || 'image/jpeg',
          name: photo.fileName || `photo-${Date.now()}-${index}.jpg`,
        };
        formData.append('media', file as any);
      });

      if (occurrenceId) {
        formData.append('occurrenceId', occurrenceId);
      }

      const token = await AsyncStorage.getItem('token');

      const response = await fetch(
        `${API_URL}/api/media/cloudinary/upload-multiple`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (data.sucesso) {
        Alert.alert('✅ Sucesso', `${data.dados.length} foto(s) enviada(s)!`);
        setUploadedPhotos([...uploadedPhotos, ...data.dados]);
      } else {
        Alert.alert('❌ Erro', data.mensagem);
      }

    } catch (error) {
      console.error('Erro:', error);
      Alert.alert('Erro', 'Não foi possível enviar as fotos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Button 
        title="📷 Adicionar Foto" 
        onPress={selecionarEEnviarFoto}
        disabled={loading}
      />
      
      <Button 
        title="📷 Adicionar Múltiplas Fotos" 
        onPress={selecionarEEnviarMultiplas}
        disabled={loading}
      />

      {loading && <ActivityIndicator size="large" />}

      {/* Mostrar fotos enviadas */}
      {uploadedPhotos.map((photo) => (
        <Image 
          key={photo._id}
          source={{ uri: photo.fileUrl }}
          style={{ width: 200, height: 200, margin: 10 }}
        />
      ))}
    </View>
  );
};

export default UploadFotoScreen;
```

---

## 🎥 Upload de Vídeo (Similar)

```typescript
const selecionarVideo = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Videos, // ← Vídeos
    quality: 1,
  });

  // Resto do código é igual
};
```

---

## 📋 Resposta da API

### Sucesso:
```json
{
  "sucesso": true,
  "mensagem": "✅ Arquivo enviado com sucesso!",
  "dados": {
    "_id": "674abc123def",
    "name": "photo.jpg",
    "fileType": "image",
    "fileUrl": "https://res.cloudinary.com/...",
    "size": 245678,
    "uploaded": true
  }
}
```

### Erro:
```json
{
  "sucesso": false,
  "mensagem": "❌ Nenhum arquivo foi enviado"
}
```

---

## ✅ Pronto!

Agora o mobile pode:
1. ✅ Selecionar foto/vídeo da galeria
2. ✅ Enviar direto para Cloudinary
3. ✅ Receber URL pública do arquivo
4. ✅ Vincular à ocorrência (opcional)

**Upload simplificado e rápido! 🚀**
