import React from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../styles/colors';
import { getPhotoUrl } from '../services/flickrAPI';
import { safeText } from '../utils/safeText';

export const ImageCard = ({ 
  photo, 
  onPress, 
  isLoading = false 
}) => {
  if (!photo) {
    return null;
  }

  const imageUrl =
    photo?.url ||
    photo?.url_l ||
    photo?.urls?.medium ||
    photo?.urls?.m ||
    photo?.urls?.l ||
    (photo?.urls ? Object.values(photo.urls).find(Boolean) : null) ||
    getPhotoUrl(photo, 'm') ||
    `https://live.staticflickr.com/${photo?.server}/${photo?.id}_${photo?.secret}_b.jpg`;

  const title = safeText(photo?.title, 'Untitled');
  const author = safeText(photo?.owner?.username, 'Unknown');

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={isLoading}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
        />
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.author} numberOfLines={1}>
          by {author}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 250,
    backgroundColor: colors.gray100,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  author: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
