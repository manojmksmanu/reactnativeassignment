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
import {loggeduser, login} from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAuth} from '../context/userContext';
import {Picker} from '@react-native-picker/picker';

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
  const {setLoggedUser, socket} = useAuth();

  const handleLogin = async () => {
    setLoading(true); // Start loading
    try {
      await login(email, userType, password);
      const user: any = await loggeduser();
      await AsyncStorage.setItem('userInfo', JSON.stringify(user));
      setLoggedUser(user);

      // Emit userOnline event
      socket?.emit('userOnline', user._id);

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
      <View >
        <Text style={styles.label}>Select User Type</Text>
        <Picker
          selectedValue={userType}
          onValueChange={itemValue => SetUserType(itemValue)}
          style={styles.picker}
          enabled={!loading} // Disable dropdown while loading
        >
          <Picker.Item label="Admin" value="Admin" />
          <Picker.Item label="Tutor" value="Tutor" />
          <Picker.Item label="Student" value="Student" />
        </Picker>
      </View>
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
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  picker: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f0f0f0',
  },
});

export default LoginScreen;
