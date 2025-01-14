import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Voice from '@react-native-voice/voice';
import { Ionicons } from '@expo/vector-icons';
import { RecordingAnimation } from './RecordingAnimation';

interface VoiceInputProps {
  onSpeechResult: (text: string) => void;
  onSpeechError: (error: string) => void;
  onSpeechEnd: (finalText?: string) => void;
  isDisabled?: boolean;
  autoSend?: boolean;
}

// Web Speech API types
interface SpeechRecognition extends EventTarget {
  start(): void;
  stop(): void;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

declare global {
  interface Window {
    webkitSpeechRecognition?: { new(): SpeechRecognition };
    SpeechRecognition?: { new(): SpeechRecognition };
  }
}

export function VoiceInput({
  onSpeechResult,
  onSpeechError,
  onSpeechEnd,
  isDisabled = false,
  autoSend = true,
}: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const recognitionRef = React.useRef<SpeechRecognition | null>(null);

  // Cleanup function
  useEffect(() => {
    return () => {
      if (Platform.OS === 'web' && recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, []);

  // Reset state when disabled changes
  useEffect(() => {
    if (isDisabled) {
      setCurrentText('');
      setIsListening(false);
      if (Platform.OS === 'web' && recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    }
  }, [isDisabled]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      // Check if Web Speech API is available
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        setIsAvailable(true);
      }
    } else {
      // For native platforms, check Voice availability
      Voice.isAvailable().then((result: number) => {
        setIsAvailable(result === 1);
      });
    }
  }, []);

  const handleSpeechEnd = () => {
    setIsListening(false);
    if (currentText.trim()) {
      onSpeechEnd(currentText);
      setCurrentText('');
    }
    if (Platform.OS === 'web' && recognitionRef.current) {
      recognitionRef.current = null;
    }
  };

  const toggleListening = async () => {
    try {
      if (isListening) {
        if (Platform.OS === 'web') {
          if (recognitionRef.current) {
            recognitionRef.current.stop();
          }
        } else {
          await Voice.stop();
        }
        handleSpeechEnd();
      } else {
        setCurrentText('');
        if (Platform.OS === 'web') {
          const SpeechRecognitionConstructor = window.webkitSpeechRecognition || window.SpeechRecognition;
          if (!SpeechRecognitionConstructor) {
            throw new Error('Speech recognition not available');
          }
          
          // Stop any existing recognition instance
          if (recognitionRef.current) {
            recognitionRef.current.stop();
          }

          const recognition = new SpeechRecognitionConstructor();
          recognitionRef.current = recognition;
          
          recognition.continuous = false;
          recognition.interimResults = false;
          
          recognition.onresult = (event: SpeechRecognitionEvent) => {
            const text = event.results[0][0].transcript;
            setCurrentText(text);
            onSpeechResult(text);
          };
          
          recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            onSpeechError(event.error);
            setIsListening(false);
            setCurrentText('');
            recognitionRef.current = null;
          };
          
          recognition.onend = () => {
            handleSpeechEnd();
          };
          
          recognition.start();
          setIsListening(true);
        } else {
          await Voice.start('en-US');
          setIsListening(true);
          
          Voice.onSpeechResults = (e: { value?: string[] }) => {
            const text = e.value?.[0] || '';
            setCurrentText(text);
            onSpeechResult(text);
          };
          
          Voice.onSpeechError = (e: { error?: { message?: string } }) => {
            onSpeechError(e.error?.message || 'Unknown error');
            setIsListening(false);
            setCurrentText('');
          };
          
          Voice.onSpeechEnd = () => {
            handleSpeechEnd();
          };
        }
      }
    } catch (error) {
      onSpeechError(error instanceof Error ? error.message : 'Failed to start voice recognition');
      setIsListening(false);
      setCurrentText('');
      if (Platform.OS === 'web') {
        recognitionRef.current = null;
      }
    }
  };

  if (!isAvailable) return null;

  return (
    <TouchableOpacity
      onPress={toggleListening}
      disabled={isDisabled}
      style={[
        styles.button,
        isDisabled && styles.buttonDisabled
      ]}
    >
      <Ionicons
        name={isListening ? "mic" : "mic-outline"}
        size={24}
        color={isDisabled ? "#999" : "#2196F3"}
      />
      <RecordingAnimation isRecording={isListening} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
}); 