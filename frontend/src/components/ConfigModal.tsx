import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { APIService, AIConfig } from '../services/api';
import { useApp, useAsyncOperation } from '../context/AppContext';

interface ConfigModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ConfigModal({ visible, onClose }: ConfigModalProps) {
  const { setError } = useApp();
  const [config, setConfig] = useState<AIConfig>({
    provider: 'openai',
    apiKey: '',
    model: '',
  });

  const providers = [
    { label: 'OpenAI ChatGPT', value: 'openai' },
    { label: 'Anthropic Claude', value: 'anthropic' },
  ];

  const handleProviderChange = (value: 'openai' | 'anthropic') => {
    setConfig(prev => ({
      ...prev,
      provider: value,
      model: '', // Reset model when provider changes
    }));
  };

  const handleApiKeyChange = (value: string) => {
    setConfig(prev => ({
      ...prev,
      apiKey: value,
    }));
  };

  const updateConfig = useAsyncOperation(
    async () => {
      if (!config.apiKey.trim()) {
        throw new Error('API Key is required');
      }
      if (!config.model.trim()) {
        throw new Error('Model name is required');
      }
      const result = await APIService.updateConfig(config);
      return result;
    },
    {
      onSuccess: () => {
        setError(null);
        onClose();
      },
      retryable: true,
    }
  );

  const handleCancel = () => {
    setError(null);
    onClose();
  };

  const getModelPlaceholder = () => {
    return config.provider === 'openai' 
      ? 'e.g., gpt-4, gpt-3.5-turbo' 
      : 'e.g., claude-3-opus-20240229';
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.centeredView}
      >
        <View style={styles.modalView}>
          <Text style={styles.title}>API Configuration</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Provider</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={config.provider}
                onValueChange={handleProviderChange}
                style={[styles.picker, { pointerEvents: 'auto' }]}
              >
                {providers.map((provider) => (
                  <Picker.Item
                    key={provider.value}
                    label={provider.label}
                    value={provider.value}
                    color="#000000"
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>API Key</Text>
            <TextInput
              style={styles.input}
              value={config.apiKey}
              onChangeText={handleApiKeyChange}
              placeholder="Enter your API key"
              placeholderTextColor="#999"
              secureTextEntry={false}
              autoCapitalize="none"
              autoCorrect={false}
              contextMenuHidden={false}
              keyboardType="default"
              textContentType="none"
              importantForAutofill="no"
              clearButtonMode="while-editing"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Model</Text>
            <TextInput
              style={styles.input}
              value={config.model}
              onChangeText={(value) => setConfig(prev => ({ ...prev, model: value }))}
              placeholder={getModelPlaceholder()}
              placeholderTextColor="#999"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={handleCancel}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.saveButton]} 
              onPress={updateConfig}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    ...(Platform.OS === 'web' ? {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    } : {}),
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 500,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
    } : Platform.OS === 'ios' ? {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    } : {
      elevation: 5,
    }),
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
    ...(Platform.OS === 'ios' ? {
      marginTop: -8,
      marginBottom: -8,
    } : {}),
  },
  picker: {
    height: Platform.OS === 'ios' ? 180 : 50,
    width: '100%',
    ...(Platform.OS === 'ios' ? {
      backgroundColor: '#fff',
    } : {}),
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
}); 