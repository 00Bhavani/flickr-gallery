import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect } from 'react';
import {
  ImageCard,
  SearchBar,
  ErrorBoundary,
  LoadingSpinner,
} from '../components';
import { flickrAPI } from '../services/flickrAPI';
import { cacheService } from '../services/cacheService';
import { errorHandler } from '../utils/errorHandler';
import { colors } from '../styles/colors';

export const HomeScreen = ({ onPhotoPress = () => {} }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentQuery, setCurrentQuery] = useState('nature');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Initial load: show cached then fetch fresh
  useEffect(() => {
    (async () => {
      try {
        const cached = await cacheService.getCachedPhotos();
        if (cached && cached.length) {
          setPhotos(cached);
        }
      } catch (e) {
        console.warn('Failed reading cache', e.message);
      }

      loadPhotos('nature', 1, true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleMenu = () => setMenuOpen((s) => !s);

  // Fetch photos with error handling
  const loadPhotos = async (query, pageNum, isInitial = false) => {
    try {
      if (isInitial) {
        setIsLoading(true);
        setPage(1);
      }

      const result = await flickrAPI.searchPhotos(query, pageNum);

      if (result.photos.length === 0 && pageNum === 1) {
        setError('No photos found. Try a different search.');
        setPhotos([]);
        return;
      }

      if (isInitial) {
        setPhotos(result.photos);
        setCurrentQuery(query);
        try {
          const cached = await cacheService.getCachedPhotos();
          const cachedIds = (cached || []).map((p) => p.id).join(',');
          const fetchedIds = (result.photos || []).map((p) => p.id).join(',');
          if (fetchedIds && fetchedIds !== cachedIds) {
            await cacheService.setCachedPhotos(result.photos);
          }
        } catch (e) {
          console.warn('Failed to update cache', e.message);
        }
      } else {
        setPhotos((prev) => [...prev, ...result.photos]);
      }

      setPage(pageNum + 1);
      setHasMore(pageNum < result.pages);
      setError(null);
    } catch (err) {
      const errorMessage = errorHandler.getErrorMessage(err);
      setError(errorMessage);
      errorHandler.logError('HomeScreen - loadPhotos', err);

      if (isInitial) {
        setPhotos([]);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      setIsRefreshing(false);
    }
  };

  const handleSearch = (query) => {
    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      loadPhotos(query, 1, true);
    }, 300);
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore && !isLoading && !error) {
      setIsLoadingMore(true);
      loadPhotos(currentQuery, page);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadPhotos(currentQuery, 1, true);
  };

  const handleRetry = () => {
    loadPhotos(currentQuery, 1, true);
  };

  const handleImagePress = (photo) => {
    onPhotoPress(photo);
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return <LoadingSpinner size="small" />;
  };

  const renderEmptyState = () => {
    if (isLoading) return null;
    if (error) return null;

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No photos found</Text>
        <Text style={styles.emptySubtext}>
          Try searching with different keywords
        </Text>
      </View>
    );
  };

  if (error && photos.length === 0) {
    return <ErrorBoundary error={error} onRetry={handleRetry} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.surface}
      />
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleMenu} style={styles.hamburger}>
          <MaterialIcons name="menu" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Home</Text>
      </View>
      <SearchBar onSearch={handleSearch} isLoading={isLoading} />

      {menuOpen && (
        <>
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={() => setMenuOpen(false)}
          />

          <View style={styles.sideMenu}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuOpen(false);
              }}
            >
              <Text style={styles.menuText}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuOpen(false);
                handleRefresh();
              }}
            >
              <Text style={styles.menuText}>Refresh</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setMenuOpen(false)}
            >
              <Text style={styles.menuText}>Close</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {isLoading ? (
        <LoadingSpinner fullScreen />
      ) : (
        <FlatList
          data={photos}
          keyExtractor={(item, index) =>
            `${item.id}-${item.secret}-${index}`
          }
          renderItem={({ item }) => (
            <View style={styles.cardContainer}>
              <ImageCard
                photo={item}
                onPress={() => handleImagePress(item)}
              />
            </View>
          )}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
            />
          }
          contentContainerStyle={styles.listContent}
          scrollEventThrottle={16}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexGrow: 1,
  },
  cardContainer: {
    width: '100%',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  hamburger: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  sideMenu: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 200,
    backgroundColor: colors.surface,
    paddingTop: 60,
    zIndex: 1000,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuText: {
    fontSize: 16,
    color: colors.text,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
    zIndex: 900,
  },
});
