import React from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { firebase } from './src/misc/FireBaseConfig/firebaseconfig';
const App: React.FC = () => {
  console.log(
    firebase.apps.length ? 'Firebase Initialized' : 'Firebase Not Initialized',
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppNavigator />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
