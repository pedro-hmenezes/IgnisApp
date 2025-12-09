// ============================================
// 🚀 CÓDIGO PRONTO PARA COPIAR - REACT NATIVE
// ============================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import SignatureScreen from 'react-native-signature-canvas';

const API_URL = 'https://ignisapp.onrender.com'; // Ajuste conforme necessário

const FinalizarOcorrenciaScreen = ({ route, navigation }) => {
  const { occurrenceId, numAviso } = route.params;

  // Estados do formulário
  const [viaturaEmpenhada, setViaturaEmpenhada] = useState('');
  const [equipe, setEquipe] = useState('');
  const [descricaoAcoes, setDescricaoAcoes] = useState('');
  
  // Estado de localização
  const [gpsLocation, setGpsLocation] = useState({ latitude: 0, longitude: 0 });
  const [gpsStatus, setGpsStatus] = useState('Aguardando...');
  
  // Estado de assinatura
  const [signatureBase64, setSignatureBase64] = useState('');
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  
  // Estado de carregamento
  const [loading, setLoading] = useState(false);

  // Capturar GPS ao carregar a tela
  useEffect(() => {
    captureGPS();
  }, []);

  // ===================================
  // CAPTURAR LOCALIZAÇÃO GPS
  // ===================================
  const captureGPS = async () => {
    try {
      setGpsStatus('Capturando...');
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Erro', 'Permissão de localização negada!');
        setGpsStatus('Permissão negada');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setGpsLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      
      setGpsStatus('GPS capturado ✓');
      
    } catch (error) {
      console.error('Erro ao capturar GPS:', error);
      Alert.alert('Erro', 'Não foi possível capturar a localização.');
      setGpsStatus('Erro ao capturar');
    }
  };

  // ===================================
  // PROCESSAR ASSINATURA
  // ===================================
  const handleSignature = (signature) => {
    setSignatureBase64(signature);
    setShowSignaturePad(false);
    Alert.alert('Sucesso', 'Assinatura coletada com sucesso!');
  };

  const handleSignatureEmpty = () => {
    Alert.alert('Atenção', 'Por favor, assine antes de confirmar!');
  };

  // ===================================
  // VALIDAR FORMULÁRIO
  // ===================================
  const validarFormulario = () => {
    if (!viaturaEmpenhada.trim()) {
      Alert.alert('Erro', 'Viatura empenhada é obrigatória!');
      return false;
    }

    if (!equipe.trim()) {
      Alert.alert('Erro', 'Equipe é obrigatória!');
      return false;
    }

    if (!descricaoAcoes.trim()) {
      Alert.alert('Erro', 'Descrição das ações é obrigatória!');
      return false;
    }

    if (!gpsLocation.latitude || !gpsLocation.longitude) {
      Alert.alert('Erro', 'Capture a localização GPS antes de finalizar!');
      return false;
    }

    if (!signatureBase64) {
      Alert.alert('Erro', 'Assinatura é obrigatória!');
      return false;
    }

    return true;
  };

  // ===================================
  // FINALIZAR OCORRÊNCIA
  // ===================================
  const finalizarOcorrencia = async () => {
    // Validar formulário
    if (!validarFormulario()) {
      return;
    }

    try {
      setLoading(true);

      // Buscar token e dados do usuário
      const token = await AsyncStorage.getItem('token');
      const userName = await AsyncStorage.getItem('userName');

      if (!token) {
        Alert.alert('Erro', 'Sessão expirada. Faça login novamente.');
        navigation.navigate('Login');
        return;
      }

      console.log('Finalizando ocorrência:', occurrenceId);

      // 🚀 CHAMADA ÚNICA QUE FAZ TUDO!
      const response = await fetch(
        `${API_URL}/api/occurrences/${occurrenceId}/finalize`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            // Relatório Operacional
            viaturaEmpenhada: viaturaEmpenhada.trim(),
            equipe: equipe.trim(),
            descricaoAcoes: descricaoAcoes.trim(),
            
            // GPS Final
            latitudeFinal: gpsLocation.latitude,
            longitudeFinal: gpsLocation.longitude,
            
            // Assinatura
            signerName: userName || 'Usuário',
            signerRole: `Comandante - Viatura ${viaturaEmpenhada.trim()}`,
            signatureData: signatureBase64,
            
            // IDs de fotos (se você já enviou fotos antes)
            photosIds: [],
          }),
        }
      );

      const data = await response.json();

      if (data.sucesso) {
        Alert.alert(
          '✅ Sucesso!',
          'Ocorrência finalizada com sucesso!',
          [
            {
              text: 'OK',
              onPress: () => {
                // Voltar para a tela anterior
                navigation.goBack();
              },
            },
          ]
        );
      } else {
        Alert.alert('❌ Erro', data.mensagem || 'Erro ao finalizar ocorrência.');
      }

    } catch (error) {
      console.error('Erro ao finalizar:', error);
      Alert.alert(
        'Erro',
        'Não foi possível finalizar a ocorrência. Verifique sua conexão e tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ===================================
  // TELA DE ASSINATURA
  // ===================================
  if (showSignaturePad) {
    return (
      <View style={styles.container}>
        <View style={styles.signatureHeader}>
          <Text style={styles.signatureTitle}>Assine abaixo</Text>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowSignaturePad(false)}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
        <SignatureScreen
          onOK={handleSignature}
          onEmpty={handleSignatureEmpty}
          descriptionText="Assine aqui"
          clearText="Limpar"
          confirmText="Confirmar"
          webStyle={`.m-signature-pad {box-shadow: none; border: none;} .m-signature-pad--body {border: none;} .m-signature-pad--footer {display: none; margin: 0px;}`}
        />
      </View>
    );
  }

  // ===================================
  // TELA PRINCIPAL DO FORMULÁRIO
  // ===================================
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Finalizar Ocorrência</Text>
          <Text style={styles.subtitle}>AVISO #{numAviso}</Text>
        </View>

        {/* Seção: Relatório Operacional */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Relatório Operacional</Text>

          <Text style={styles.label}>Viatura Empenhada *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: ABT-45"
            value={viaturaEmpenhada}
            onChangeText={setViaturaEmpenhada}
            editable={!loading}
          />

          <Text style={styles.label}>Equipe *</Text>
          <TextInput
            style={styles.input}
            placeholder="Comandante e auxiliares..."
            value={equipe}
            onChangeText={setEquipe}
            multiline
            numberOfLines={2}
            editable={!loading}
          />

          <Text style={styles.label}>Descrição das Ações *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Relate o que foi feito no local..."
            value={descricaoAcoes}
            onChangeText={setDescricaoAcoes}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            editable={!loading}
          />
        </View>

        {/* Seção: Localização */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Localização</Text>
          
          <View style={styles.gpsContainer}>
            <Text style={styles.gpsLabel}>GPS Final:</Text>
            <Text style={styles.gpsCoords}>
              {gpsLocation.latitude.toFixed(6)}, {gpsLocation.longitude.toFixed(6)}
            </Text>
            <Text style={styles.gpsStatus}>{gpsStatus}</Text>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={captureGPS}
            disabled={loading}
          >
            <Text style={styles.buttonSecondaryText}>
              🔄 Atualizar Localização
            </Text>
          </TouchableOpacity>
        </View>

        {/* Seção: Assinatura */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✍️ Validação</Text>
          
          <Text style={styles.label}>Assinatura do Responsável *</Text>
          
          {signatureBase64 ? (
            <View style={styles.signatureStatus}>
              <Text style={styles.signatureStatusText}>✅ Assinatura coletada</Text>
            </View>
          ) : (
            <View style={styles.signatureStatus}>
              <Text style={[styles.signatureStatusText, { color: '#dc2626' }]}>
                ❌ Assinatura pendente
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => setShowSignaturePad(true)}
            disabled={loading}
          >
            <Text style={styles.buttonSecondaryText}>
              {signatureBase64 ? '✏️ Refazer Assinatura' : '✍️ Coletar Assinatura'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Botão de Finalizar */}
        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary, loading && styles.buttonDisabled]}
          onPress={finalizarOcorrencia}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonPrimaryText}>
              ✅ FINALIZAR OCORRÊNCIA
            </Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
};

// ===================================
// ESTILOS
// ===================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  gpsContainer: {
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  gpsLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#15803d',
    marginBottom: 4,
  },
  gpsCoords: {
    fontSize: 16,
    fontFamily: 'monospace',
    color: '#166534',
    marginBottom: 4,
  },
  gpsStatus: {
    fontSize: 12,
    color: '#16a34a',
  },
  signatureStatus: {
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  signatureStatusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#16a34a',
  },
  button: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonPrimary: {
    backgroundColor: '#16a34a',
    marginTop: 24,
  },
  buttonPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#d1d5db',
  },
  buttonSecondaryText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  signatureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  signatureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  cancelButton: {
    padding: 8,
  },
  cancelButtonText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default FinalizarOcorrenciaScreen;
