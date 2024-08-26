import React, {useState,useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {login} from '../services/authService';
import {jwtDecode} from 'jwt-decode';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/userContext';
const LoginScreen: React.FC<{navigation: any}> = ({navigation}) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false); // Loading state
  const [loggedUserId, setLoggeduserId] = useState<string>('');
  const {loggedUser,setLoggedUser}=useAuth();
// console.log(loggedUser,'loggeduser')
  // --get logged user--
    const fetchLoggedUser = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const decodedToken = jwtDecode(token);
          const userId = decodedToken.id; // Adjust if your payload structure is different

          if (userId) {
            setLoggedUser(userId);
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

  const handleLogin = async () => {
    setLoading(true); // Start loading
    try {
      await login(username, password);
      await  fetchLoggedUser();
      setLoading(false); // Stop loading
      navigation.navigate('ChatList');
      Alert.alert('Login successful');
    } catch (error: any) {
      setLoading(false); // Stop loading
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
      <Text style={styles.title}>Login</Text>
      <TextInput
        placeholder="Username"
        placeholderTextColor="#808080"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
        editable={!loading} // Disable input while loading
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor="#808080"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        editable={!loading} // Disable input while loading
      />
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" /> // Show spinner while loading
      ) : (
        <Button title="Login" onPress={handleLogin} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    color :"blue",
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderBottomWidth: 1,
    color:"black",
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
});

export default LoginScreen;
