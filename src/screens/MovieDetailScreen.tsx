import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getFilmById, Film } from '../api/data';
import type { HomeStackParamList } from '../../App';

type Props = NativeStackScreenProps<HomeStackParamList, 'MovieDetail'>; 

export default function MovieDetailScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const [film, setFilm] = useState<Film | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigateToPlayer = (mediaType: 'video' | 'music') => {
    const playerTitle = `${mediaType === 'video' ? 'Trailer' : 'Soundtrack'} ${film?.title || 'Film'}`;
    
    navigation.navigate('VideoPlayer', { 
        title: playerTitle, 
        mediaType,
        filmId: film?.id, 
        mediaId: undefined,
    });
  };

  useEffect(() => {
    (async () => {
      try {
        setError(null);
        const data = await getFilmById(id);
        setFilm(data);
        navigation.setOptions({ title: data.title });
      } catch (e: any) {
        setError(e.message || 'Failed to load detail');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigation]);

  const buttonStyle = {
    button: {
      flex: 1,
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: 'center' as 'center',
      marginHorizontal: 4,
    },
    text: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600' as const,
    },
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.muted}>Loading detail…</Text>
      </View>
    );
  }

  if (error || !film) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Error: {error ?? 'Not found'}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {film.movie_banner ? (
        <Image source={{ uri: film.movie_banner }} style={styles.banner} />
      ) : film.image ? (
        <Image source={{ uri: film.image }} style={styles.banner} />
      ) : null}

      <View style={[styles.section, { paddingBottom: 0 }]}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[buttonStyle.button, { backgroundColor: '#10B981' }]}
            onPress={() => navigateToPlayer('video')}
          >
            <Text style={buttonStyle.text}>▶️ Play Video</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[buttonStyle.button, { backgroundColor: '#3B82F6' }]}
            onPress={() => navigateToPlayer('music')}
          >
            <Text style={buttonStyle.text}>🎵 Play Music</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>{film.title}</Text>
        <Text style={styles.subtitle}>
          Release: {film.release_date} • Runtime: {film.running_time}m • Score: {film.rt_score}
        </Text>
        <Text style={styles.subtitle}>
          Director: {film.director} • Producer: {film.producer}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Synopsis</Text>
        <Text style={styles.body}>{film.description}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  muted: { color: '#6B7280', marginTop: 8 },
  error: { color: '#ef4444', fontWeight: '600' },
  container: { paddingBottom: 24 },
  banner: { width: '100%', height: 220, backgroundColor: '#111827' },
  section: { paddingHorizontal: 16, paddingTop: 16 },
  title: { fontSize: 24, fontWeight: '800' },
  subtitle: { color: '#6B7280', marginTop: 6 },
  heading: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  body: { lineHeight: 20, color: '#111827' },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
    marginHorizontal: -4, 
  }
});