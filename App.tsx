import React from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import {firebase} from './src/misc/FireBaseConfig/firebaseconfig';
import {AuthProvider} from './src/context/userContext';
import {NavigationContainer} from '@react-navigation/native'; // <-- Ensure this is imported
import Toast from 'react-native-toast-message';

const App: React.FC = () => {
  console.log(
    firebase.apps.length ? 'Firebase Initialized' : 'Firebase Not Initialized',
  );

  return (
    <SafeAreaView style={styles.container}>
      <AuthProvider>
        {/* Wrap NavigationContainer here */}
        <NavigationContainer>
          <AppNavigator />
          <Toast />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
