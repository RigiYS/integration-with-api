import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MovieListScreen from './src/screens/MovieListScreen';
import MovieDetailScreen from './src/screens/MovieDetailScreen';
import SongListScreen from './src/screens/SongListScreen';
import VideoPlayerScreen from './src/screens/VideoPlayerScreen';

export type HomeStackParamList = {
  MovieList: undefined;
  MovieDetail: { id: string; title?: string };
  VideoPlayer: { 
    title: string; 
    mediaType: 'video' | 'music'; 
    filmId?: string; 
    mediaId?: string;
  }; 
};

export type RootStackParamList = {
  Home: { screen: keyof HomeStackParamList; params?: HomeStackParamList[keyof HomeStackParamList] };
  Soundtracks: undefined; 
};

const HomeStack = createNativeStackNavigator<HomeStackParamList>();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator initialRouteName="MovieList">
      <HomeStack.Screen
        name="MovieList"
        component={MovieListScreen}
        options={{ title: 'Movies' }}
      />
      <HomeStack.Screen
        name="MovieDetail"
        component={MovieDetailScreen}
        options={({ route }) => ({ title: route.params?.title || 'Detail' })}
      />
      <HomeStack.Screen
        name="VideoPlayer"
        component={VideoPlayerScreen}
        options={{ title: 'Media Player' }}
      />
    </HomeStack.Navigator>
  );
}

const Tab = createBottomTabNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false, 
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeStackNavigator}
          options={{
            title: 'Film List',
          }}
        />
        <Tab.Screen
          name="Soundtracks"
          component={SongListScreen}
          options={{
            title: 'Song List',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}