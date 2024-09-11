import React, {useState, useLayoutEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import {loggeduser, login} from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAuth} from '../context/userContext';
import {Picker} from '@react-native-picker/picker';
import Toast from 'react-native-toast-message';

const LoginScreen: React.FC<{navigation: any}> = ({navigation}) => {
  const [email, setEmail] = useState<string>('');
  const [userType, SetUserType] = useState<string>('Admin');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const {setLoggedUser, socket} = useAuth();

  const handleSignUpPress = () => {
    navigation.navigate('SignUp');
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      await login(email, userType, password);
      const user: any = await loggeduser();
      await AsyncStorage.setItem('userInfo', JSON.stringify(user));
      setLoggedUser(user);
      socket?.emit('userOnline', user._id);
      setLoading(false);
      navigation.navigate('ChatList');
      Alert.alert('Login successful');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text2: `${error.message}`,
      });
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logoText}>MyMegaminds</Text>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <Image
          style={{width: 20, height: 20}}
          source={require('../assets/mail.png')}
        />
        <TextInput
          placeholder="Email"
          placeholderTextColor="#9E9E9E"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          editable={!loading}
        />
      </View>

      {/* User Type Picker Styled as Input */}
      <View style={styles.inputContainer}>
        <Image
          style={{width: 20, height: 20}}
          source={require('../assets/user.png')}
        />
        <Picker
          selectedValue={userType}
          onValueChange={itemValue => SetUserType(itemValue)}
          style={styles.picker}
          enabled={!loading}
          dropdownIconColor="black">
          <Picker.Item label="Admin" value="Admin" />
          <Picker.Item label="Tutor" value="Tutor" />
          <Picker.Item label="Student" value="Student" />
        </Picker>
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <Image
          style={{width: 20, height: 20}}
          source={require('../assets/padlock.png')}
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#9E9E9E"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          editable={!loading}
        />
      </View>

      {/* Login Button */}
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      )}
      <View>
        <Text style={{textAlign: 'center', marginTop: 10, fontSize: 16}}>
          Don't have an account?{' '}
        </Text>
        <View>
          <TouchableOpacity style={{paddingTop: 0}} onPress={handleSignUpPress}>
            <Text
              style={{
                color: '#aa14f0',
                paddingTop: 0,
                textAlign: 'center',
                fontWeight: 'bold',
              }}>
              SignUp
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#f5f7fa',
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#aa14f0',
    textAlign: 'center',
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    color: '#333',
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  icon: {
    marginLeft: 10,
  },
  picker: {
    flex: 1,
    color: 'grey',
  },
  button: {
    backgroundColor: '#aa14f0',
    padding: 12,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
});

export default LoginScreen;
