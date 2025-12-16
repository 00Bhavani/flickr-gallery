// src/screens/SearchScreen.js
import React, { useState } from 'react';
import {
  View,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { flickrAPI } from '../services/flickrAPI';

export default function SearchScreen({ navigation }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selected, setSelected] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  /**
   * Search photos based on search text
   * @param {number} page - Page number to load
   * @param {boolean} append - Whether to append to existing photos
   */
  const searchPhotos = async (page = 1, append = false) => {
    if (!searchText.trim()) {
      setError('Please enter a search term');
      return;
    }

    try {
      setError(null);
      Keyboard.dismiss();

      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setHasSearched(true);
      }

      const result = await flickrAPI.searchPhotos(searchText.trim(), page);

      if (append) {
        setPhotos(prev => [...prev, ...result.photos]);
      } else {
        setPhotos(result.photos);
      }

      setCurrentPage(result.page);
      setTotalPages(result.pages);
    } catch (e) {
      console.warn('Search failed', e.message || e);
      setError(e.message || 'Search failed. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  /**
   * Handle search button press
   */
  const handleSearch = () => {
    setCurrentPage(1);
    searchPhotos(1, false);
  };

  /**
   * Handle loading more results
   */
  const handleLoadMore = () => {
    if (!loadingMore && currentPage < totalPages) {
      searchPhotos(currentPage + 1, true);
    }
  };

  /**
   * Handle retry after error
   */
  const handleRetry = () => {
    searchPhotos(currentPage, false);
  };

  /**
   * Clear search results
   */
  const handleClear = () => {
    setSearchText('');
    setPhotos([]);
    setHasSearched(false);
    setError(null);
  };

  /**
   * Render individual photo item
   */
  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => setSelected(item)}
      activeOpacity={0.7}
    >
      <Image 
        source={{ uri: item.url }} 
        style={styles.thumb}
        resizeMode="cover"
      />
      <Text numberOfLines={2} style={styles.title}>
        {String(item.title || 'Untitled')}
      </Text>
    </TouchableOpacity>
  );

  /**
   * Render footer with loading indicator
   */
  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.footerText}>Loading more results...</Text>
      </View>
    );
  };

  /**
   * Render empty state
   */
  const renderEmpty = () => {
    if (loading) return null;

    if (!hasSearched) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>Search Flickr Photos</Text>
          <Text style={styles.emptyText}>
            Enter keywords like "cat", "dog", "nature" to find photos
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>😕</Text>
        <Text style={styles.emptyTitle}>No Results Found</Text>
        <Text style={styles.emptyText}>
          Try different keywords or check your spelling
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search Photos</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search photos (e.g., cat, dog, nature)"
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.searchBtn}
          onPress={handleSearch}
          disabled={loading}
        >
          <Text style={styles.searchBtnText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Error Snackbar */}
      {error && (
        <View style={styles.errorSnackbar}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
            <Text style={styles.retryText}>RETRY</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Results Count */}
      {hasSearched && !loading && photos.length > 0 && (
        <View style={styles.resultsBar}>
          <Text style={styles.resultsText}>
            Found {photos.length} photos • Page {currentPage} of {totalPages}
          </Text>
        </View>
      )}

      {/* Loading Indicator - Initial Search */}
      {loading && photos.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.loadingText}>Searching for "{searchText}"...</Text>
        </View>
      ) : (
        <FlatList
          data={photos}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={styles.list}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
        />
      )}

      {/* Image Modal */}
      {selected && (
        <View style={styles.modal}>
          <TouchableOpacity
            style={styles.close}
            onPress={() => setSelected(null)}
          >
            <Text style={styles.closeText}>✕ Close</Text>
          </TouchableOpacity>
          <Image
            source={{ uri: selected.url }}
            style={styles.full}
            resizeMode="contain"
          />
          <Text style={styles.modalTitle}>{String(selected.title || '')}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    fontSize: 16,
    color: '#0066cc',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  clearButton: {
    position: 'absolute',
    right: 100,
    padding: 8,
  },
  clearText: {
    fontSize: 18,
    color: '#999',
  },
  searchBtn: {
    marginLeft: 8,
    backgroundColor: '#0066cc',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  searchBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  errorSnackbar: {
    backgroundColor: '#f44336',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#fff',
    flex: 1,
    marginRight: 8,
  },
  retryButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  retryText: {
    color: '#f44336',
    fontWeight: 'bold',
  },
  resultsBar: {
    padding: 12,
    backgroundColor: '#e3f2fd',
  },
  resultsText: {
    fontSize: 14,
    color: '#0066cc',
    fontWeight: '500',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14,
  },
  list: {
    padding: 8,
  },
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  thumb: {
    width: '100%',
    height: 160,
    backgroundColor: '#eee',
  },
  title: {
    marginTop: 8,
    marginBottom: 8,
    marginHorizontal: 8,
    fontSize: 12,
    color: '#333',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  full: {
    width: '100%',
    height: '70%',
  },
  close: {
    position: 'absolute',
    top: 40,

    right: 20,
    zIndex: 10,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  closeText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  modalTitle: {
    color: '#fff',
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
  },
});