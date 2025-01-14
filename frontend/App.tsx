import React, { useState, useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { AppProvider, useApp, useAsyncOperation } from './src/context/AppContext';
import { LoadingSpinner } from './src/components/LoadingSpinner';
import { ErrorMessage } from './src/components/ErrorMessage';
import { VoiceInput } from './src/components/VoiceInput';
import { ConfigModal } from './src/components/ConfigModal';
import { APIService, AIResponse, AIMessage } from './src/services/api';
import { Ionicons } from '@expo/vector-icons';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { nightOwl } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ChatMessage {
  type: 'user' | 'ai';
  content: string;
  response?: AIResponse;
}

function ChatScreen() {
  const [message, setMessage] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showConfig, setShowConfig] = useState(false);
  const { isLoading, error, clearError, setError } = useApp();
  const scrollViewRef = useRef<ScrollView>(null);
  const sendButtonRef = useRef<any>(null);

  const languages = [
    { label: 'JavaScript', value: 'javascript' },
    { label: 'TypeScript', value: 'typescript' },
    { label: 'Python', value: 'python' },
  ];

  const sendMessage = useAsyncOperation(async () => {
    if (!message.trim()) return;
    
    // Add user message immediately
    const userMessage: ChatMessage = {
      type: 'user',
      content: message,
    };
    setMessages(prev => [...prev, userMessage]);
    
    // Clear input
    setMessage('');
    
    // Scroll to bottom after user message
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 500);

    // Convert messages to API format
    const previousMessages: AIMessage[] = messages.map(msg => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.type === 'user' ? msg.content : `${msg.content}\n\n${msg.response?.code || ''}`,
    }));

    // Get AI response
    const response = await APIService.sendMessage(message, language, previousMessages);
    
    // Add AI response
    const aiMessage: ChatMessage = {
      type: 'ai',
      content: response.explanation,
      response,
    };
    setMessages(prev => [...prev, aiMessage]);
    
    // Scroll to bottom after AI response
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  });

  const handleSpeechResult = useCallback((text: string) => {
    setMessage(text);
  }, []);

  const handleSpeechError = useCallback((error: string) => {
    setError({ message: `Voice input error: ${error}` });
  }, [setError]);

  const handleSpeechEnd = useCallback((finalText?: string) => {
    if (finalText?.trim()) {
      setMessage(finalText);
      // Give a small delay for the message state to update
      setTimeout(() => {
        if (Platform.OS === 'web') {
          // For web, find and click the send button
          const sendButton = document.querySelector('[data-testid="send-button"]');
          if (sendButton) {
            (sendButton as HTMLElement).click();
          }
        } else {
          // For native, use the ref
          sendButtonRef.current?.props.onPress?.();
        }
      }, 2000);
    }
  }, []);

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
  };

  const handleMessageChange = (text: string) => {
    setMessage(text);
  };

  const formatExplanation = (text: string) => {
    // Split text into lines
    const lines = text.split('\n');
    return lines.map((line, index) => {
      // Handle headers
      if (line.startsWith('###')) {
        return <Text key={index} style={styles.h3}>{line.replace('###', '').trim()}</Text>;
      }
      if (line.startsWith('##')) {
        return <Text key={index} style={styles.h2}>{line.replace('##', '').trim()}</Text>;
      }
      if (line.startsWith('#')) {
        return <Text key={index} style={styles.h1}>{line.replace('#', '').trim()}</Text>;
      }
      // Handle regular text
      return <Text key={index} style={styles.paragraph}>{line}</Text>;
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>TalkToDev</Text>
        <TouchableOpacity 
          style={[styles.configButton, { pointerEvents: 'auto' }]}
          onPress={() => setShowConfig(true)}
        >
          <Ionicons name="settings-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.pickerContainer}>
        <View style={styles.pickerWrapper}>
          <Text style={styles.label}>Language:</Text>
          <View style={styles.pickerBorder}>
            <Picker
              selectedValue={language}
              onValueChange={handleLanguageChange}
              style={[styles.picker, { pointerEvents: 'auto' }]}
            >
              {languages.map((lang) => (
                <Picker.Item 
                  key={lang.value} 
                  label={lang.label} 
                  value={lang.value}
                  color="#333"
                />
              ))}
            </Picker>
          </View>
        </View>
      </View>

      {error && (
        <ErrorMessage 
          message={error.message} 
          onRetry={() => {
            clearError();
            sendMessage();
          }}
        />
      )}

      <ScrollView 
        ref={scrollViewRef}
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
      >
        {messages.map((msg, index) => (
          <View key={index} style={styles.messageContainer}>
            <Text style={styles.messageRole}>{msg.type === 'user' ? 'You:' : 'AI:'}</Text>
            {msg.type === 'user' ? (
              <Text style={styles.messageText}>{msg.content}</Text>
            ) : (
              <View style={styles.aiMessageContent}>
                {formatExplanation(msg.content)}
                {msg.response?.code && (
                  <View style={styles.codeBlock}>
                    <SyntaxHighlighter
                      language={language.toLowerCase()}
                      style={nightOwl}
                      customStyle={styles.codeHighlighter}
                    >
                      {msg.response.code}
                    </SyntaxHighlighter>
                  </View>
                )}
              </View>
            )}
          </View>
        ))}
        {isLoading && <LoadingSpinner />}
      </ScrollView>

      <View style={styles.inputContainer}>
        <View style={styles.textInputContainer}>
          <TextInput
            style={[styles.input, { pointerEvents: isLoading ? 'none' : 'auto' }]}
            value={message}
            onChangeText={handleMessageChange}
            placeholder="Ask a coding question..."
            multiline
            editable={!isLoading}
          />
        </View>
        <View style={styles.buttonContainer}>
          <VoiceInput
            onSpeechResult={handleSpeechResult}
            onSpeechError={handleSpeechError}
            onSpeechEnd={handleSpeechEnd}
            isDisabled={isLoading}
            autoSend={true}
          />
          <TouchableOpacity 
            ref={sendButtonRef}
            data-testid="send-button"
            style={[
              styles.sendButton, 
              isLoading && styles.sendButtonDisabled,
              { pointerEvents: (isLoading || !message.trim()) ? 'none' : 'auto' }
            ]} 
            onPress={() => sendMessage()}
            disabled={isLoading || !message.trim()}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ConfigModal 
        visible={showConfig} 
        onClose={() => setShowConfig(false)} 
      />
    </View>
  );
}

export default function App() {
  return (
    <AppProvider>
      <ChatScreen />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  header: {
    padding: 20,
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  configButton: {
    padding: 8,
  },
  pickerContainer: {
    padding: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  pickerWrapper: {
    marginHorizontal: 5,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  pickerBorder: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f8f8f8',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  pickerItem: {
    fontSize: 16,
  },
  chatContainer: {
    flex: 1,
    padding: 10,
  },
  chatContent: {
    padding: 10,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    alignSelf: 'flex-end',
    maxWidth: '80%',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
    } : Platform.OS === 'ios' ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    } : {
      elevation: 1,
    }),
  },
  userText: {
    color: 'white',
    fontSize: 16,
  },
  responseContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    alignSelf: 'flex-start',
    maxWidth: '80%',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    } : Platform.OS === 'ios' ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    } : {
      elevation: 2,
    }),
  },
  explanation: {
    marginBottom: 10,
  },
  h1: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#333',
  },
  h2: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 8,
    color: '#444',
  },
  h3: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 6,
    color: '#555',
  },
  paragraph: {
    fontSize: 16,
    marginVertical: 4,
    color: '#666',
    lineHeight: 24,
  },
  codeHighlighter: {
    margin: 0,
    padding: 10,
    borderRadius: 4,
    backgroundColor: '#011627',
  },
  codeBlock: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  code: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : Platform.OS === 'android' ? 'monospace' : 'Consolas',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  textInputContainer: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 8,
  },
  input: {
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 20,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  typingIndicator: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    fontStyle: 'italic',
  },
  messageRole: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#888',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  aiMessageContent: {
    flex: 1,
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
});
