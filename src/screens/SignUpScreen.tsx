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

const LoginScreen: React.FC<{navigation: any}> = ({navigation}) => {
  const [userType, SetUserType] = useState<string>('Admin');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [countryCode, setCountryCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [whatappNumber, setWhatappNumber] = useState('');
  const countryCodes = [
    {label: '+1', value: 'US'},
    {label: '+44', value: 'UK'},
    {label: '+91', value: 'IN'},
    // Add more country codes here
  ];
  const {setLoggedUser, socket} = useAuth();

  useLayoutEffect(() => {
    navigation.setOptions({headerShown: false});
  }, [navigation]);

  const handleSignUpPress = () => {
    navigation.navigate('Login');
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
      setLoading(false);
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
      <Text style={styles.logoText}>MyMegaminds</Text>

      {/* Name Input */}
      <View style={styles.inputContainer}>
        <Image
          style={{width: 20, height: 20}}
          source={require('../assets/id-card.png')}
        />
        <TextInput
          placeholder="Name"
          placeholderTextColor="#9E9E9E"
          value={name}
          onChangeText={setName}
          style={styles.input}
          editable={!loading}
        />
      </View>
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

      {/* --input phone number--  */}
      <View style={styles.inputContainer}>
        <Image
          style={{width: 20, height: 20}}
          source={require('../assets/phone.png')}
        />
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={countryCode}
            onValueChange={itemValue => setCountryCode(itemValue)}
            style={styles.picker}>
            <Picker.Item label="Select code" value="" />
            {countryCodes.map(code => (
              <Picker.Item
                key={code.value}
                label={code.label}
                value={code.value}
              />
            ))}
          </Picker>
        </View>
        <View style={styles.inputWrapper}>
          <Text style={styles.countryCodeText}>
            {countryCode
              ? countryCodes.find(code => code.value === countryCode)?.label
              : ''}
          </Text>
          <TextInput
            placeholder="Phone number"
            placeholderTextColor="#9E9E9E"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            style={styles.input}
            editable={!loading}
            keyboardType="numeric"
          />
        </View>
      </View>
      {/* --input whatsapp number--  */}
      <View style={styles.inputContainer}>
        <Image
          style={{width: 20, height: 20}}
          source={require('../assets/whatsapp.png')}
        />
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={countryCode}
            onValueChange={itemValue => setCountryCode(itemValue)}
            style={styles.picker}>
            <Picker.Item label="Select code" value="" />
            {countryCodes.map(code => (
              <Picker.Item
                key={code.value}
                label={code.label}
                value={code.value}
              />
            ))}
          </Picker>
        </View>
        <View style={styles.inputWrapper}>
          <Text style={styles.countryCodeText}>
            {countryCode
              ? countryCodes.find(code => code.value === countryCode)?.label
              : ''}
          </Text>
          <TextInput
            placeholder="Whatsapp number"
            placeholderTextColor="#9E9E9E"
            value={whatappNumber}
            onChangeText={setWhatappNumber}
            style={styles.input}
            editable={!loading}
            keyboardType="numeric"
          />
        </View>
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
      {/* Confirm Password Input */}
      <View style={styles.inputContainer}>
        <Image
          style={{width: 20, height: 20}}
          source={require('../assets/padlock.png')}
        />
        <TextInput
          placeholder="Confirm Password"
          placeholderTextColor="#9E9E9E"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
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
          <Text style={styles.buttonText}>SignUp</Text>
        </TouchableOpacity>
      )}
      <View>
        <Text style={{textAlign: 'center', marginTop: 10, fontSize: 16}}>
          Already have an account?{' '}
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
              Login
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  pickerContainer: {
    width: '30%', // Adjust width to 1/3 of the screen
    paddingRight: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    width: '70%', // Adjust width to 2/3 of the screen
    alignItems: 'center',
  },
  countryCodeText: {
    fontSize: 16,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginRight: 8,
  },
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
