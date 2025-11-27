import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { SemanticColors } from '../constants/Colors';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <View style={{ flex: 1, backgroundColor: SemanticColors.background.primary }}>
            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: SemanticColors.background.primary },
                animation: 'slide_from_right',
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen 
                name="sos" 
                options={{ 
                  headerShown: false,
                  animation: 'fade',
                  presentation: 'fullScreenModal',
                }} 
              />
              <Stack.Screen 
                name="journal" 
                options={{ 
                  headerShown: false,
                  animation: 'slide_from_bottom',
                }} 
              />
              <Stack.Screen 
                name="savings" 
                options={{ 
                  headerShown: false,
                  animation: 'slide_from_bottom',
                }} 
              />
              <Stack.Screen 
                name="onboarding" 
                options={{ 
                  headerShown: false,
                  animation: 'fade',
                }} 
              />
              <Stack.Screen 
                name="aiAssistant" 
                options={{ 
                  headerShown: false,
                  animation: 'slide_from_bottom',
                }} 
              />
              <Stack.Screen 
                name="articles" 
                options={{ 
                  headerShown: false,
                  animation: 'slide_from_right',
                }} 
              />
              <Stack.Screen 
                name="challenges" 
                options={{ 
                  headerShown: false,
                  animation: 'slide_from_right',
                }} 
              />
              <Stack.Screen 
                name="expertConsultation" 
                options={{ 
                  headerShown: false,
                  animation: 'slide_from_bottom',
                }} 
              />
              <Stack.Screen 
                name="financialPlanning" 
                options={{ 
                  headerShown: false,
                  animation: 'slide_from_right',
                }} 
              />
              <Stack.Screen 
                name="leaderboard" 
                options={{ 
                  headerShown: false,
                  animation: 'slide_from_right',
                }} 
              />
              <Stack.Screen 
                name="privacySettings" 
                options={{ 
                  headerShown: false,
                  animation: 'slide_from_right',
                }} 
              />
            </Stack>
          </View>
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
