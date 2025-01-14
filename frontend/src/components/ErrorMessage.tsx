import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

interface Styles {
  container: ViewStyle;
  message: TextStyle;
  retryButton: ViewStyle;
  retryText: TextStyle;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create<Styles>({
  container: {
    padding: 20,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    margin: 10,
    alignItems: 'center',
  },
  message: {
    color: '#c62828',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#c62828',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
}); 