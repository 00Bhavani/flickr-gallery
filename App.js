import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { flickrAPI } from './src/services/flickrAPI';

export default function App() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await flickrAPI.searchPhotos('', 1);
        if (mounted) setPhotos(res.photos || []);
      } catch (e) {
        console.warn('Failed to load photos', e.message || e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => setSelected(item)}>
      <Image source={{ uri: item.url }} style={styles.thumb} />
      <Text numberOfLines={1} style={styles.title}>{String(item.title || 'Untitled')}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={photos}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={styles.list}
        />
      )}

      {selected && (
        <View style={styles.modal}>
          <TouchableOpacity style={styles.close} onPress={() => setSelected(null)}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
          <Image source={{ uri: selected.url }} style={styles.full} resizeMode="contain" />
          <Text style={styles.modalTitle}>{String(selected.title || '')}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 8 },
  card: { flex: 1, margin: 8, alignItems: 'center' },
  thumb: { width: '100%', height: 160, borderRadius: 8, backgroundColor: '#eee' },
  title: { marginTop: 6, fontSize: 12 },
  modal: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  full: { width: '100%', height: '70%' },
  close: { position: 'absolute', top: 40, right: 20, zIndex: 10, padding: 8, backgroundColor: '#fff', borderRadius: 6 },
  closeText: { color: '#000' },
  modalTitle: { color: '#fff', marginTop: 12 },
});
