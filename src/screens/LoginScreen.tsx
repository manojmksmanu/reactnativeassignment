import React, {useState} from 'react';
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
import {jwtDecode }from 'jwt-decode'; // Correct import
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAuth} from '../context/userContext';

// Define a custom interface that extends JwtPayload to include the 'id' property
interface CustomJwtPayload {
  id: string;
  // Add other properties if needed, e.g., username, email, etc.
}

const LoginScreen: React.FC<{navigation: any}> = ({navigation}) => {
  const [email, setEmail] = useState<string>('');
  const [userType, SetUserType] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false); // Loading state
  const {setLoggedUserId} = useAuth();

  const fetchLoggedUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const decodedToken = jwtDecode<CustomJwtPayload>(token);
        const userId = decodedToken.id; // This should now be recognized
        if (userId) {
          setLoggedUserId(userId);
        }
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const handleLogin = async () => {
    setLoading(true); // Start loading
    try {
      await login(email,userType, password);
      await fetchLoggedUser();
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
        placeholder="email"
        placeholderTextColor="#808080"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        editable={!loading} // Disable input while loading
      />
      <TextInput
        placeholder="userType"
        placeholderTextColor="#808080"
        value={userType}
        onChangeText={SetUserType}
        secureTextEntry
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
    color: 'blue',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderBottomWidth: 1,
    color: 'black',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
});

export default LoginScreen;
