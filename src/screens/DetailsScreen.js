import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Share,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { flickrAPI, getPhotoUrl } from '../services/flickrAPI';
import { errorHandler } from '../utils/errorHandler';
import { ErrorBoundary } from '../components';

const safeString = (value) => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return '';
  return String(value);
};

export const DetailsScreen = ({ photo, onBackPress = () => {} }) => {
  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (photo?.id) {
      loadPhotoDetails();
    }
  }, [photo?.id]);

  const loadPhotoDetails = async () => {
    try {
      setIsLoading(true);
      const photoInfo = await flickrAPI.getPhotoInfo(photo.id);
      setDetails(photoInfo);
      setError(null);
    } catch (err) {
      const errorMessage = errorHandler.getErrorMessage(err);
      setError(errorMessage);
      errorHandler.logError('DetailsScreen - loadPhotoDetails', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      const imageUrl =
        details?.urls?.original ||
        details?.urls?.large ||
        details?.urls?.medium ||
        photo?.url ||
        getPhotoUrl(photo, 'b') ||
        `https://live.staticflickr.com/${photo?.server}/${photo?.id}_${photo?.secret}_b.jpg`;

      const title = safeString(photo?.title || 'Photo');
      
      await Share.share({
        message: `Check out this beautiful photo: ${title}`,
        url: imageUrl,
        title,
      });
    } catch (err) {
      console.error('Share error:', err);
    }
  };

  const handleRetry = () => {
    loadPhotoDetails();
  };

  const imageUrl =
    details?.urls?.large ||
    details?.urls?.medium ||
    photo?.url ||
    getPhotoUrl(photo, 'b') ||
    `https://live.staticflickr.com/${photo?.server}/${photo?.id}_${photo?.secret}_b.jpg`;

  if (error) {
    return <ErrorBoundary error={error} onRetry={handleRetry} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBackPress}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Photo Details</Text>
        <TouchableOpacity onPress={handleShare}>
          <MaterialIcons name="share" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Image source={{ uri: imageUrl }} style={styles.fullImage} resizeMode="cover" />

          <View style={styles.infoContainer}>
            <Text style={styles.title}>{safeString(photo?.title || 'Untitled')}</Text>

            <View style={styles.infoRow}>
              <MaterialIcons name="person" size={20} color={colors.primary} />
              <Text style={styles.infoText}>
                {safeString(details?.owner?.username || photo?.owner?.username || 'Unknown')}
              </Text>
            </View>

            {details?.description && (
              <View style={styles.descriptionContainer}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.description}>{safeString(details.description)}</Text>
              </View>
            )}

            {details && (
              <View style={styles.metadataContainer}>
                <Text style={styles.sectionTitle}>Photo Info</Text>

                {details.dates?.taken && (
                  <View style={styles.metadataRow}>
                    <Text style={styles.metadataLabel}>Taken:</Text>
                    <Text style={styles.metadataValue}>
                      {safeString(new Date(details.dates.taken).toLocaleDateString())}
                    </Text>
                  </View>
                )}

                {details.dates?.posted && (
                  <View style={styles.metadataRow}>
                    <Text style={styles.metadataLabel}>Posted:</Text>
                    <Text style={styles.metadataValue}>
                      {safeString(new Date(parseInt(details.dates.posted) * 1000).toLocaleDateString())}
                    </Text>
                  </View>
                )}

                {details.views && (
                  <View style={styles.metadataRow}>
                    <Text style={styles.metadataLabel}>Views:</Text>
                    <Text style={styles.metadataValue}>
                      {safeString(
                        typeof details.views === 'number'
                          ? details.views.toLocaleString()
                          : details.views
                      )}
                    </Text>
                  </View>
                )}

                {details.comments && (
                  <View style={styles.metadataRow}>
                    <Text style={styles.metadataLabel}>Comments:</Text>
                    <Text style={styles.metadataValue}>{safeString(details.comments)}</Text>
                  </View>
                )}
              </View>
            )}

            {Array.isArray(details?.tags) && details.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                <Text style={styles.sectionTitle}>Tags</Text>
                <View style={styles.tagsWrapper}>
                  {details.tags.map((tag, index) => {
                    const tagText = safeString(typeof tag === 'string' ? tag : tag?.raw || '');
                    if (!tagText) return null;
                    return (
                      <View key={`tag-${index}`} style={styles.tag}>
                        <Text style={styles.tagText}>{tagText}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  content: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: 300,
  },
  infoContainer: {
    padding: 16,
    backgroundColor: colors.surface,
    marginTop: 8,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    lineHeight: 28,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 12,
    fontWeight: '500',
  },
  descriptionContainer: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  metadataContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  metadataLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  metadataValue: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
  },
  tagsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tagsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  tag: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: colors.surface,
    fontWeight: '500',
  },
});
