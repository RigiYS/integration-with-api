import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, Linking, Dimensions, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Video, { OnProgressData } from 'react-native-video';
import { HomeStackParamList } from '../../App';
import Slider from '@react-native-community/slider';

type Props = NativeStackScreenProps<HomeStackParamList, 'VideoPlayer'>;

const { width } = Dimensions.get('window');

const Ghibli_Trailer_Dummy = 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4';
const Generic_Music_Dummy = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

const getMediaUrl = (mediaType: 'video' | 'music', mediaId?: string) => {
  if (mediaType === 'video') {
    return Ghibli_Trailer_Dummy; 
  } else if (mediaType === 'music' && mediaId?.startsWith('/yt/')) {
    const youtubeId = mediaId.replace('/yt/', '');
    return `https://www.youtube.com/watch?v=${youtubeId}`; 
  }
  return Generic_Music_Dummy;
};

export default function VideoPlayerScreen({ route, navigation }: Props) {
  const { title, mediaType, mediaId } = route.params;
  const mediaUrl = getMediaUrl(mediaType, mediaId);
  
  const [isPlaying, setIsPlaying] = React.useState(true);
  const [isReady, setIsReady] = React.useState(false);

  useEffect(() => {
    if (mediaType === 'music' && mediaId?.startsWith('/yt/')) {
      Linking.openURL(mediaUrl).catch((error) => {
        console.error('Failed to open URL:', error);
        Alert.alert(
          "Gagal Membuka Pemutar",
          `Tidak dapat membuka: ${mediaUrl}\n${String(error)}`
        );
      });
      navigation.goBack();
    }
  }, [mediaUrl, navigation, mediaType, mediaId]);

  const [duration, setDuration] = React.useState(0);
  const [currentTime, setCurrentTime] = React.useState(0);
  const videoRef = React.useRef<any>(null);

  const onProgress = (data: OnProgressData) => {
    setCurrentTime(data.currentTime);
  };

  const onLoad = (data: { duration: number }) => {
    setDuration(data.duration);
    setIsReady(true);
  };

  const seekTo = (value: number) => {
    videoRef.current?.seek(value);
    setCurrentTime(value);
  };

  const togglePlay = () => {
    setIsPlaying(prev => !prev);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

    React.useLayoutEffect(() => {
      navigation.setOptions({
        title: title || 'Media Player',
      });
    }, [navigation, title]);
  
    if (mediaType === 'music' && mediaId?.startsWith('/yt/')) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.muted}>Mengarahkan ke pemutar media eksternal (YouTube)...</Text>
        </View>
      );
    }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.videoContainer}>
        <Video
          source={{ uri: mediaUrl }}
          ref={videoRef}
          paused={!isPlaying}
          onLoad={onLoad}
          onProgress={onProgress}
          onEnd={() => setIsPlaying(false)}
          resizeMode={'contain'}
          style={styles.videoPlayer}
          onError={(error) => Alert.alert('Error Memuat Media', JSON.stringify(error))}
          repeat={false}
        />
        {!isReady && (
            <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={styles.loadingText}>Memuat Media...</Text>
            </View>
        )}
      </View>

      <View style={styles.controlsContainer}>
        <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={duration}
          value={currentTime}
          onSlidingComplete={seekTo}
          minimumTrackTintColor="#3B82F6"
          maximumTrackTintColor="#D1D5DB"
          thumbTintColor="#3B82F6"
        />
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>

      <TouchableOpacity onPress={togglePlay} style={styles.playButton}>
        <Text style={styles.playButtonText}>{isPlaying ? '⏸️ Jeda' : '▶️ Putar'}</Text>
      </TouchableOpacity>
      
      <Text style={styles.note}>
        *Catatan: Konten Ghibli dan OpenWhyd/YouTube menggunakan Pemutar Video Internal untuk Video dan Pemutar Eksternal (Browser/YouTube App) untuk Musik.
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  muted: {
    color: '#6B7280',
    marginTop: 8,
  },
  videoContainer: {
    width: width - 32, 
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlayer: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 10,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 8,
    marginBottom: 20,
  },
  slider: {
    flex: 1,
    marginHorizontal: 10,
  },
  timeText: {
    color: '#374151',
    fontSize: 14,
  },
  playButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 3,
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  note: {
    marginTop: 20,
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  }
});