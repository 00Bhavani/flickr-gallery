import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { errorHandler } from '../utils/errorHandler';

export const ErrorBoundary = ({
  error,
  onRetry,
  showRetry = true,
}) => {
  const message = typeof error === 'string' ? error : errorHandler.getErrorMessage(error);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <MaterialIcons
          name="error-outline"
          size={60}
          color={colors.error}
          style={styles.icon}
        />
        <Text style={styles.title}>Oops! Something went wrong</Text>
        <Text style={styles.message}>{message}</Text>
        {showRetry && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={onRetry}
          >
            <MaterialIcons
              name="refresh"
              size={18}
              color={colors.surface}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 24,
  },
  content: {
    alignItems: 'center',
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '600',
  },
});
