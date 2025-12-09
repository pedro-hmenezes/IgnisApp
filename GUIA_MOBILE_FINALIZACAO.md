# 🚀 GUIA COMPLETO - Finalização de Ocorrências no Mobile

## 📋 Visão Geral

Agora você tem **UM ÚNICO ENDPOINT** que faz TUDO de uma vez:
- ✅ Salva relatório operacional (viatura, equipe, descrição)
- ✅ Registra GPS final
- ✅ Salva assinatura digital
- ✅ Vincula fotos
- ✅ Marca ocorrência como finalizada

---

## 🎯 Fluxo Simplificado no React Native

### **Passo 1: Coletar dados do usuário**
```typescript
// Seus estados no componente
const [viaturaEmpenhada, setViaturaEmpenhada] = useState('');
const [equipe, setEquipe] = useState('');
const [descricaoAcoes, setDescricaoAcoes] = useState('');
const [signatureBase64, setSignatureBase64] = useState('');
const [gpsLocation, setGpsLocation] = useState({ latitude: 0, longitude: 0 });
const [photosIds, setPhotosIds] = useState<string[]>([]);
```

### **Passo 2: Enviar fotos (se houver)**
```typescript
// Função para enviar uma foto
const uploadPhoto = async (photoUri: string, occurrenceId: string) => {
  const formData = new FormData();
  formData.append('occurrenceId', occurrenceId);
  formData.append('media', {
    uri: photoUri,
    type: 'image/jpeg',
    name: 'photo.jpg',
  });

  const response = await fetch('https://sua-api.com/api/media/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();
  return data.dados._id; // Retorna o ID da foto
};

// Enviar todas as fotos e guardar os IDs
const uploadAllPhotos = async () => {
  const ids = [];
  for (const photoUri of selectedPhotos) {
    const photoId = await uploadPhoto(photoUri, occurrenceId);
    ids.push(photoId);
  }
  setPhotosIds(ids);
};
```

### **Passo 3: Capturar assinatura**
```typescript
import SignatureScreen from 'react-native-signature-canvas';

// No seu componente
const handleSignature = (signature: string) => {
  // signature já vem em formato base64
  setSignatureBase64(signature);
};

<SignatureScreen
  onOK={handleSignature}
  descriptionText="Assine aqui"
/>
```

### **Passo 4: Capturar GPS**
```typescript
import * as Location from 'expo-location';

const captureGPS = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  
  if (status !== 'granted') {
    alert('Permissão de localização negada!');
    return;
  }

  const location = await Location.getCurrentPositionAsync({});
  setGpsLocation({
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  });
};
```

### **Passo 5: FINALIZAR TUDO DE UMA VEZ! 🎉**
```typescript
const finalizarOcorrencia = async () => {
  try {
    // Validações básicas
    if (!viaturaEmpenhada || !equipe || !descricaoAcoes) {
      alert('Preencha todos os campos do relatório!');
      return;
    }

    if (!signatureBase64) {
      alert('Assinatura é obrigatória!');
      return;
    }

    if (!gpsLocation.latitude || !gpsLocation.longitude) {
      alert('Capture a localização GPS!');
      return;
    }

    setLoading(true);

    // 🚀 CHAMADA ÚNICA QUE FAZ TUDO!
    const response = await fetch(
      `https://sua-api.com/api/occurrences/${occurrenceId}/finalize`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          // Relatório Operacional
          viaturaEmpenhada: viaturaEmpenhada,
          equipe: equipe,
          descricaoAcoes: descricaoAcoes,
          
          // GPS Final
          latitudeFinal: gpsLocation.latitude,
          longitudeFinal: gpsLocation.longitude,
          
          // Assinatura
          signerName: userName, // Nome do usuário logado
          signerRole: 'Comandante - Viatura ABT-45',
          signatureData: signatureBase64,
          
          // IDs das fotos (opcional)
          photosIds: photosIds,
        }),
      }
    );

    const data = await response.json();

    if (data.sucesso) {
      alert('✅ Ocorrência finalizada com sucesso!');
      navigation.goBack();
    } else {
      alert(`❌ Erro: ${data.mensagem}`);
    }

  } catch (error) {
    console.error('Erro ao finalizar:', error);
    alert('Erro ao finalizar ocorrência. Tente novamente.');
  } finally {
    setLoading(false);
  }
};
```

---

## 📝 JSON Completo de Exemplo

```json
{
  "viaturaEmpenhada": "ABT-45",
  "equipe": "Sgt Peixoto, Cb Silva, Sd Santos",
  "descricaoAcoes": "Equipe chegou ao local às 14:30. Incêndio em residência. Realizado combate com linha direta. Vítimas encaminhadas para hospital. Situação controlada às 15:45.",
  "latitudeFinal": -8.05428,
  "longitudeFinal": -34.8813,
  "signerName": "Sgt Peixoto",
  "signerRole": "Comandante - Viatura ABT-45",
  "signatureData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "photosIds": ["674321abc...", "674322def..."]
}
```

---

## 🎨 Componente Completo de Exemplo

```tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, ScrollView } from 'react-native';
import SignatureScreen from 'react-native-signature-canvas';
import * as Location from 'expo-location';

const FinalizeOccurrenceScreen = ({ route, navigation }) => {
  const { occurrenceId } = route.params;
  
  // Estados
  const [viaturaEmpenhada, setViaturaEmpenhada] = useState('');
  const [equipe, setEquipe] = useState('');
  const [descricaoAcoes, setDescricaoAcoes] = useState('');
  const [signatureBase64, setSignatureBase64] = useState('');
  const [gpsLocation, setGpsLocation] = useState({ latitude: 0, longitude: 0 });
  const [loading, setLoading] = useState(false);
  const [showSignature, setShowSignature] = useState(false);

  // Capturar GPS automaticamente ao carregar
  useEffect(() => {
    captureGPS();
  }, []);

  const captureGPS = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const location = await Location.getCurrentPositionAsync({});
      setGpsLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    }
  };

  const handleSignature = (signature: string) => {
    setSignatureBase64(signature);
    setShowSignature(false);
    Alert.alert('✅ Assinatura coletada!');
  };

  const finalizarOcorrencia = async () => {
    // Validações
    if (!viaturaEmpenhada || !equipe || !descricaoAcoes) {
      Alert.alert('Erro', 'Preencha todos os campos do relatório!');
      return;
    }

    if (!signatureBase64) {
      Alert.alert('Erro', 'Assinatura é obrigatória!');
      return;
    }

    if (!gpsLocation.latitude) {
      Alert.alert('Erro', 'Capture a localização GPS!');
      return;
    }

    try {
      setLoading(true);

      const token = await AsyncStorage.getItem('token');
      const userName = await AsyncStorage.getItem('userName');

      const response = await fetch(
        `${API_URL}/api/occurrences/${occurrenceId}/finalize`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            viaturaEmpenhada,
            equipe,
            descricaoAcoes,
            latitudeFinal: gpsLocation.latitude,
            longitudeFinal: gpsLocation.longitude,
            signerName: userName,
            signerRole: `Comandante - Viatura ${viaturaEmpenhada}`,
            signatureData: signatureBase64,
          }),
        }
      );

      const data = await response.json();

      if (data.sucesso) {
        Alert.alert('✅ Sucesso', 'Ocorrência finalizada!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('❌ Erro', data.mensagem);
      }

    } catch (error) {
      Alert.alert('Erro', 'Não foi possível finalizar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (showSignature) {
    return (
      <SignatureScreen
        onOK={handleSignature}
        onEmpty={() => Alert.alert('Erro', 'Por favor, assine!')}
        descriptionText="Assine aqui"
        clearText="Limpar"
        confirmText="Confirmar"
      />
    );
  }

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        Finalizar Ocorrência
      </Text>

      <Text>Viatura Empenhada *</Text>
      <TextInput
        style={{ borderWidth: 1, padding: 10, marginBottom: 15 }}
        placeholder="Ex: ABT-45"
        value={viaturaEmpenhada}
        onChangeText={setViaturaEmpenhada}
      />

      <Text>Equipe *</Text>
      <TextInput
        style={{ borderWidth: 1, padding: 10, marginBottom: 15 }}
        placeholder="Comandante e auxiliares..."
        value={equipe}
        onChangeText={setEquipe}
      />

      <Text>Descrição das Ações *</Text>
      <TextInput
        style={{ borderWidth: 1, padding: 10, marginBottom: 15, height: 100 }}
        placeholder="Relate o que foi feito no local..."
        value={descricaoAcoes}
        onChangeText={setDescricaoAcoes}
        multiline
        numberOfLines={4}
      />

      <Text>Localização GPS</Text>
      <Text style={{ marginBottom: 15 }}>
        📍 {gpsLocation.latitude.toFixed(6)}, {gpsLocation.longitude.toFixed(6)}
      </Text>
      <Button title="Atualizar GPS" onPress={captureGPS} />

      <View style={{ marginVertical: 20 }}>
        <Text>Assinatura do Responsável *</Text>
        {signatureBase64 ? (
          <Text style={{ color: 'green' }}>✅ Assinatura coletada</Text>
        ) : (
          <Text style={{ color: 'red' }}>❌ Assinatura pendente</Text>
        )}
        <Button 
          title={signatureBase64 ? "Refazer Assinatura" : "Coletar Assinatura"}
          onPress={() => setShowSignature(true)}
        />
      </View>

      <Button
        title={loading ? "Finalizando..." : "FINALIZAR OCORRÊNCIA"}
        onPress={finalizarOcorrencia}
        disabled={loading}
        color="green"
      />
    </ScrollView>
  );
};

export default FinalizeOccurrenceScreen;
```

---

## 🔧 Instalação de Dependências

```bash
# Assinatura
npm install react-native-signature-canvas

# GPS (Expo)
npx expo install expo-location

# GPS (React Native CLI)
npm install @react-native-community/geolocation
```

---

## ⚡ Vantagens desta Solução

1. **Uma única chamada** - Não precisa fazer 3-4 requisições separadas
2. **Transação atômica** - Se algo falhar, tudo é revertido
3. **Validações no backend** - Garante integridade dos dados
4. **Logs detalhados** - Fácil debugar problemas
5. **Simples no frontend** - Menos código, menos bugs

---

## 🐛 Tratamento de Erros

```typescript
// Possíveis erros que você pode receber:
{
  sucesso: false,
  mensagem: "Não é possível finalizar ocorrência com status: finalizada"
}

{
  sucesso: false,
  mensagem: "Esta ocorrência já possui uma assinatura registrada"
}

{
  sucesso: false,
  mensagem: "Campos obrigatórios do relatório: viaturaEmpenhada, equipe"
}
```

---

## ✅ Sucesso!

```json
{
  "sucesso": true,
  "mensagem": "✅ Ocorrência finalizada com sucesso!",
  "dados": {
    "occurrence": {
      "_id": "674321...",
      "numAviso": "#7278909",
      "statusGeral": "finalizada",
      "finalizadoEm": "2025-12-09T01:47:04.000Z",
      "viaturaEmpenhada": "ABT-45",
      "equipe": "Sgt Peixoto, Cb Silva"
    },
    "signature": {
      "_id": "987654...",
      "signerName": "Sgt Peixoto",
      "signerRole": "Comandante - Viatura ABT-45",
      "signedAt": "2025-12-09T01:47:04.000Z"
    },
    "photosCount": 3
  }
}
```

---

## 📱 Pronto para usar!

Agora você tem tudo que precisa! Basta copiar o código do componente e adaptar ao seu projeto. 🚀
