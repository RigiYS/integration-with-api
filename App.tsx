import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MovieListScreen from './src/screens/MovieListScreen';
import MovieDetailScreen from './src/screens/MovieDetailScreen';

export type RootStackParamList = {
  MovieList: undefined;
  MovieDetail: { id: string; title?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="MovieList">
        <Stack.Screen
          name="MovieList"
          component={MovieListScreen}
          options={{ title: 'Movies' }}
        />
        <Stack.Screen
          name="MovieDetail"
          component={MovieDetailScreen}
          options={({ route }) => ({ title: route.params?.title || 'Detail' })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
