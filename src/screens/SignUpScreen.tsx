import React, {useState, useLayoutEffect, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import Toast from 'react-native-toast-message';
import RNPickerSelect from 'react-native-picker-select';
import {getAllContry, getAllSubjects} from '../services/miscServices';
import {signup} from '../services/authService';
import {isValidEmail} from '../services/smallServices'
interface Country {
  _id: string;
  name: string;
  phoneCode: string;
  countryCode: string;
}
const LoginScreen: React.FC<{navigation: any}> = ({navigation}) => {
  const [userType, SetUserType] = useState<string>('Student');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [allCountry, setAllCountry] = useState<any[]>([]);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [phoneCountry, setPhoneCountry] = useState<any | null>(null);
  const [whatappNumber, setWhatappNumber] = useState<string>('');
  const [whatsAppCountry, setwhatsAppCountry] = useState<any | null>(null);
  const [showSingup, setShowSingUp] = useState<boolean>(false);
  const [allSubjects, setAllSubjects] = useState<any[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<any[]>([]);
  const getContries = async () => {
    const data = await getAllContry();
    await setAllCountry(
      data.map((item: any) => {
        return {
          _id: item._id,
          phoneCode: item.phoneCode,
          countryCode: item.countryCode,
          country: item.country,
        };
      }),
    );
  };
  const getSubjects = async () => {
    const data = await getAllSubjects();
    await setAllSubjects(
      data.map((item: any) => {
        return {label: item.subjectName, value: item.subjectName};
      }),
    );
  };
  useEffect(() => {
    getContries();
    getSubjects();
  }, []);

  const handleSelectSubject = (subjectName: string | null) => {
    if (subjectName && !selectedSubjects.includes(subjectName)) {
      setSelectedSubjects([...selectedSubjects, subjectName]);
    } else {
      Toast.show({
        type: 'error',
        text2: 'Already selected',
      });
    }
  };
  const handleRemoveTag = (subjectName: string) => {
    setSelectedSubjects(selectedSubjects.filter(s => s !== subjectName));
  };
  useLayoutEffect(() => {
    navigation.setOptions({headerShown: false});
  }, [navigation]);
  const handleSignUpPress = () => {
    navigation.navigate('Login');
  };
  const validateForm = () => {
    // Check if any field is empty
    if (!name) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill the name field',
      });
      return false;
    }

    if (!email || !isValidEmail(email)) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a valid email address',
      });
      return false;
    }

    if (!password) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill the password field',
      });
      return false;
    }

    if (!confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please confirm your password',
      });
      return false;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Passwords do not match',
      });
      return false;
    }
    setShowSingUp(true);
    // If all validations pass
    return Toast.show({
      type: 'success',
      text1: 'all is clear',
    });
  };

  const handleContinue = () => {
    validateForm();
  };
  const handleBack = () => {
    setShowSingUp(false);
  };

  const handleSignUp = async () => {
    setLoading(true);
    try {
      const data = await signup(
        name,
        email,
        password,
        userType,
        phoneNumber,
        phoneCountry,
        whatappNumber,
        whatsAppCountry,
        selectedSubjects,
      );
      setLoading(false);
      navigation.navigate('Login');
      Toast.show({
        type: 'success',
        text2: `${data}`,
      });
    } catch (error: any) {
      setLoading(false);
      if (error?.response?.status === 401) {
        Toast.show({
          type: 'Invalid Credentials',
          text2: 'Please enter the correct username and password.',
        });
        Alert.alert(
          'Invalid Credentials',
          'Please enter the correct username and password.',
        );
      } else {
        Toast.show({
          type: 'error',
          text2: error.message,
        });
      }
    }
  };

  const validateForm2 = async () => {
    if (!phoneCountry) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill the Phone Country Code field',
      });
      return false;
    }
    if (!phoneNumber) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill the Phone Number field',
      });
      return false;
    }
    if (!whatsAppCountry) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill the whatsAppCountry Code field',
      });
      return false;
    }
    if (!whatappNumber) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill the whatsApp Number field',
      });
      return false;
    }
    await handleSignUp();
  };
  // Handle changes in the phone number picker
  const handlePhoneCountryChange = (itemValue: any) => {
    const selected = allCountry.find(code => code.countryCode === itemValue);
    setPhoneCountry(selected ? selected : '');
  };
  // Handle changes in the WhatsApp picker
  const handleWhatsAppCountryChange = (itemValue: any) => {
    const selected = allCountry.find(code => code.countryCode === itemValue);
    setwhatsAppCountry(selected ? selected : '');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logoText}>MyMegaminds</Text>
      {!showSingup ? (
        <>
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
        </>
      ) : (
        <>
          {/* --input phone number-- */}
          <View style={styles.inputContainer}>
            <Image
              style={{width: 20, height: 20}}
              source={require('../assets/phone.png')}
            />
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={phoneCountry}
                onValueChange={handlePhoneCountryChange}
                style={styles.picker}>
                <Picker.Item label="Select code" value="" />
                {allCountry.map(code => (
                  <Picker.Item
                    key={code.countryCode}
                    label={`${code.country} (${code.countryCode}) ${code.phoneCode}`}
                    value={code.countryCode}
                  />
                ))}
              </Picker>
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.countryCodeText}>
                {phoneCountry?.phoneCode}
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
          {/* --input whatsapp number-- */}
          <View style={styles.inputContainer}>
            <Image
              style={{width: 20, height: 20}}
              source={require('../assets/whatsapp.png')}
            />
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={whatsAppCountry}
                onValueChange={handleWhatsAppCountryChange}
                style={styles.picker}>
                <Picker.Item label="Select code" value="" />
                {allCountry.map(code => (
                  <Picker.Item
                    key={code.countryCode}
                    label={`${code.country} (${code.countryCode}) ${code.phoneCode}`}
                    value={code.countryCode}
                  />
                ))}
              </Picker>
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.countryCodeText}>
                {whatsAppCountry?.phoneCode}
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
          {userType === 'Tutor' ? (
            <>
              <View style={{marginBottom: 20}}>
                {/* Dropdown List */}
                <RNPickerSelect
                  onValueChange={value => handleSelectSubject(value)}
                  items={allSubjects.map(subject => ({
                    label: subject.label,
                    value: subject.value,
                  }))}
                  placeholder={{label: 'Select a subject', value: null}}
                />

                {/* Display Selected Tags */}
                <ScrollView horizontal style={styles.tagsContainer}>
                  {selectedSubjects.map(subject => (
                    <View key={subject} style={styles.tag}>
                      <Text style={{color: '#aa14f0'}}>{subject}</Text>
                      <TouchableOpacity
                        onPress={() => handleRemoveTag(subject)}>
                        <Text style={styles.removeText}>x</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            </>
          ) : (
            <></>
          )}
        </>
      )}
      {/* Signup, continue and back Button */}
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : !showSingup ? (
        <>
          <TouchableOpacity style={styles.button} onPress={handleContinue}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            gap: 5,
          }}>
          <TouchableOpacity style={styles.buttonBack} onPress={handleBack}>
            <Text style={styles.BackbuttonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonSignUp} onPress={validateForm2}>
            <Text style={styles.buttonText}>SignUp</Text>
          </TouchableOpacity>
        </View>
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
    width: '20%',
    paddingRight: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    width: '70%',
    alignItems: 'center',
  },
  countryCodeText: {
    fontSize: 16,
    padding: 5,
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
  buttonBack: {
    color: 'grey',
    width: '50%',
    backgroundColor: '#f6e7fd',
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
  buttonSignUp: {
    width: '50%',
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
  BackbuttonText: {
    color: '#aa14f0',
    fontSize: 18,
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  tag: {
    backgroundColor: '#f6e7fd',
    borderRadius: 4,
    padding: 8,
    paddingLeft: 10,
    paddingRight: 10,
    margin: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  removeText: {
    color: '#aa14f0',
    marginLeft: 10,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
