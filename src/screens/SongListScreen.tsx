import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, FlatList, RefreshControl, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { getSongs, Song } from '../api/data';
import type { RootStackParamList } from '../../App';

type Props = BottomTabScreenProps<RootStackParamList, 'Soundtracks'>;

const SongCard = ({ song, onPress }: { song: Song, onPress: () => void }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
    <Image source={{ uri: song.image }} style={styles.poster} />
    <View style={styles.info}>
      <Text numberOfLines={1} style={styles.title}>{song.title}</Text>
      <Text style={styles.artist}>{song.artist}</Text>
      <Text style={styles.meta}>{song.playlist} | Score: {song.score}</Text>
    </View>
    <View style={styles.playIconContainer}>
      <Text style={styles.playIcon}>▶️</Text>
    </View>
  </TouchableOpacity>
);

export default function SongListScreen({ navigation }: Props) {
  const [data, setData] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setError(null);
      const songs = await getSongs();
      setData(songs);
    } catch (e: any) {
      console.error("Error fetching songs:", e);
      setError(e.message || 'Gagal memuat lagu. Coba tarik untuk refresh.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.muted}>Loading popular electro songs...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Error: {error}</Text>
        <Text style={styles.muted}>Pull down to try again.</Text>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={{ paddingVertical: 8 }}
      data={data}
      keyExtractor={(item) => item.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      renderItem={({ item }) => (
        <SongCard
          song={item}
          onPress={() =>
            navigation.getParent()?.navigate('Home', {
              screen: 'VideoPlayer',
              params: { 
                title: `${item.title} - ${item.artist}`,
                mediaType: 'music',
                mediaId: item.mediaId, 
              },
            })
          }
        />
      )}
      ListHeaderComponent={
        <Text style={styles.header}>Hot Electro Songs</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  muted: { color: '#6B7280', marginTop: 8 },
  error: { color: '#ef4444', fontWeight: '600' },
  header: {
    fontSize: 22,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: '#1F2937'
  },
  card: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 12,
    marginVertical: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  poster: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#1f2937' },
  info: { flex: 1, justifyContent: 'center' },
  title: { color: '#1F2937', fontSize: 16, fontWeight: '600' },
  artist: { color: '#6B7280', marginTop: 2, fontSize: 14 },
  meta: { color: '#9CA3AF', marginTop: 4, fontSize: 12 },
  playIconContainer: {
    padding: 10,
    backgroundColor: '#3B82F6',
    borderRadius: 20,
  },
  playIcon: {
    fontSize: 16,
    color: 'white',
  }
});