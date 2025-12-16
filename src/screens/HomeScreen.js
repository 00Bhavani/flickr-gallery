// src/screens/HomeScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { flickrAPI } from '../services/flickrAPI';

export default function HomeScreen({ navigation }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);

  /**
   * Load photos from API
   * @param {number} page - Page number to load
   * @param {boolean} append - Whether to append to existing photos or replace
   */
  const loadPhotos = async (page = 1, append = false) => {
    try {
      setError(null);
      
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const result = await flickrAPI.searchPhotos('', page);
      
      if (append) {
        // Append new photos to existing list
        setPhotos(prev => [...prev, ...result.photos]);
      } else {
        // Replace photos list
        setPhotos(result.photos);
      }
      
      setCurrentPage(result.page);
      setTotalPages(result.pages);
    } catch (e) {
      console.warn('Failed to load photos', e.message || e);
      setError(e.message || 'Failed to load photos');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  // Load initial photos on mount
  useEffect(() => {
    loadPhotos(1, false);
  }, []);

  /**
   * Handle pull-to-refresh
   */
  const onRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    loadPhotos(1, false);
  };

  /**
   * Handle loading more photos when user scrolls to end
   */
  const handleLoadMore = () => {
    // Only load more if:
    // 1. Not already loading
    // 2. Not refreshing
    // 3. Current page is less than total pages
    if (!loadingMore && !refreshing && currentPage < totalPages) {
      loadPhotos(currentPage + 1, true);
    }
  };

  /**
   * Retry loading photos after error
   */
  const handleRetry = () => {
    loadPhotos(currentPage, false);
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
        <Text style={styles.footerText}>Loading more photos...</Text>
      </View>
    );
  };

  /**
   * Render empty state
   */
  const renderEmpty = () => {
    if (loading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No photos found</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Search Button */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Flickr Gallery</Text>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => navigation.navigate('Search')}
        >
          <Text style={styles.searchButtonText}>🔍 Search</Text>
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

      {/* Loading Indicator - Initial Load */}
      {loading && photos.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.loadingText}>Loading photos...</Text>
        </View>
      ) : (
        <FlatList
          data={photos}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={styles.list}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5} // Load more when 50% from bottom
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#0066cc']}
            />
          }
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
    backgroundColor: '#f5f5f5' 
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  searchButton: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  searchButtonText: {
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
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14,
  },
  list: { 
    padding: 8 
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
    backgroundColor: '#eee' 
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
  emptyText: {
    fontSize: 16,
    color: '#999',
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
    padding: 16 
  },
  full: { 
    width: '100%', 
    height: '70%' 
  },
  close: { 
    position: 'absolute', 
    top: 40, 
    right: 20, 
    zIndex: 10, 
    padding: 12, 
    backgroundColor: '#fff', 
    borderRadius: 8 
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