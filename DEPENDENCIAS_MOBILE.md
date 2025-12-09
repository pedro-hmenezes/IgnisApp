# 📦 INSTALAÇÃO DE DEPENDÊNCIAS - REACT NATIVE

## 🎯 Dependências Necessárias

### 1. **AsyncStorage** (Armazenar token)
```bash
npm install @react-native-async-storage/async-storage
```

### 2. **Geolocalização** (Capturar GPS)

#### Para Expo:
```bash
npx expo install expo-location
```

#### Para React Native CLI:
```bash
npm install @react-native-community/geolocation
```

### 3. **Assinatura Digital**
```bash
npm install react-native-signature-canvas
```

### 4. **Upload de Fotos (Opcional)**

#### Para Expo:
```bash
npx expo install expo-image-picker
```

#### Para React Native CLI:
```bash
npm install react-native-image-picker
```

---

## ⚙️ Configurações Adicionais

### **Android - Permissões**

Adicione no `android/app/src/main/AndroidManifest.xml`:

```xml
<manifest>
  <!-- Permissão de localização -->
  <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
  <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
  
  <!-- Permissão de câmera (para fotos) -->
  <uses-permission android:name="android.permission.CAMERA" />
  <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
  <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
</manifest>
```

### **iOS - Info.plist**

Adicione no `ios/SeuApp/Info.plist`:

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>Precisamos da sua localização para registrar o GPS da ocorrência</string>

<key>NSCameraUsageDescription</key>
<string>Precisamos acessar a câmera para tirar fotos da ocorrência</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>Precisamos acessar suas fotos para anexar evidências</string>
```

---

## 🚀 Exemplo de Uso Completo

### **1. Instalar tudo de uma vez (Expo)**
```bash
npx expo install expo-location expo-image-picker
npm install @react-native-async-storage/async-storage react-native-signature-canvas
```

### **2. Instalar tudo de uma vez (React Native CLI)**
```bash
npm install @react-native-async-storage/async-storage
npm install @react-native-community/geolocation
npm install react-native-signature-canvas
npm install react-native-image-picker
```

### **3. Rodar no iOS**
```bash
cd ios && pod install && cd ..
npx react-native run-ios
```

### **4. Rodar no Android**
```bash
npx react-native run-android
```

---

## 📝 Checklist de Instalação

- [ ] AsyncStorage instalado
- [ ] Biblioteca de GPS instalada (expo-location ou geolocation)
- [ ] react-native-signature-canvas instalado
- [ ] Permissões Android configuradas
- [ ] Permissões iOS configuradas
- [ ] Pods instalados (iOS)
- [ ] App testado em dispositivo real ou emulador

---

## 🐛 Problemas Comuns

### **Erro: "Location services are disabled"**
**Solução:** Ative o GPS no dispositivo

### **Erro: "Permission denied"**
**Solução:** Verifique se as permissões estão no AndroidManifest.xml e Info.plist

### **Erro: "Signature canvas not showing"**
**Solução:** Adicione WebView:
```bash
# Expo
npx expo install react-native-webview

# React Native CLI
npm install react-native-webview
cd ios && pod install
```

### **Erro: "Network request failed"**
**Solução:** Verifique se a URL da API está correta e se o dispositivo tem internet

---

## 💡 Dicas

1. **Teste no dispositivo real** - GPS funciona melhor em dispositivo físico
2. **Use Expo Go** para prototipar rapidamente (se estiver usando Expo)
3. **Verifique logs** com `npx react-native log-android` ou `log-ios`
4. **Clear cache** se algo não funcionar: `npm start -- --reset-cache`

---

## ✅ Pronto!

Depois de instalar as dependências, copie o código do arquivo `CODIGO_REACT_NATIVE_COMPLETO.tsx` e adapte para seu projeto! 🚀
