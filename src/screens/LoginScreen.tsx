import React, {useState} from 'react';
import {View, Text, TextInput, Button, StyleSheet, Alert} from 'react-native';
import {login} from '../services/authService';

const LoginScreen: React.FC<{navigation: any}> = ({navigation}) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleLogin = async () => {
    try {
      await login(username, password);
      navigation.navigate('ChatList');
        Alert.alert(
          'Invalid Credentials',
          'Login successfully',
        );
    } catch (error: any) {
      if (error?.response?.status === 401) {
        Alert.alert(
          'Invalid Credentials',
          'Please enter the correct username and password.',
        );
      } else {
        Alert.alert(
          'Login Error',
          'Something went wrong. Please try again later.',
        );
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text>Login</Text>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 20,
    padding: 10,
  },
});

export default LoginScreen;
