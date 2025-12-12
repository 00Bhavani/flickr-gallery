import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../styles/colors';

export const SearchBar = ({ 
  onSearch, 
  isLoading = false,
  placeholder = 'Search photos...' 
}) => {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query);
    }
  };

  const handleClear = () => {
    setQuery('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <MaterialIcons
          name="search"
          size={20}
          color={colors.textSecondary}
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          editable={!isLoading}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={handleClear}>
            <MaterialIcons
              name="close"
              size={20}
              color={colors.textSecondary}
              style={styles.icon}
            />
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity
        style={[
          styles.searchButton,
          { opacity: isLoading || !query.trim() ? 0.5 : 1 },
        ]}
        onPress={handleSearch}
        disabled={isLoading || !query.trim()}
      >
        {isLoading ? (
          <ActivityIndicator color={colors.surface} size={20} />
        ) : (
          <MaterialIcons name="arrow-forward" size={20} color={colors.surface} />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  icon: {
    marginHorizontal: 4,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: colors.text,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
