import React, {useState, useRef} from 'react';
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
import {
  forgotPassword,
  otpConfirm,
  resetPassword,
} from '../services/authService';
import Toast from 'react-native-toast-message';
import {isValidEmail} from '../misc/misc';

const LoginScreen: React.FC<{navigation: any}> = ({navigation}) => {
  const [email, setEmail] = useState<string>('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showOption, setShowOption] = useState<string>('Forgot');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  console.log(otp.join(''));
  // Regular expression for strong password
  const passwordRegex =
    /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const validatePassword = (password: string) => {
    setIsValid(passwordRegex.test(password));
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    validatePassword(text);
  };
  // ---change positon of input as filled aur empty ---
  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    // Move to next input if a digit is entered
    if (text.length === 1 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    // Automatically move to previous input if cleared
    if (text.length === 0 && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  console.log(email);
  const sendOtp = async () => {
    if (!email || !isValidEmail(email)) {
      Toast.show({
        type: 'error',
        text2: 'Please enter a valid Email....',
      });
      return;
    }
    try {
      setLoading(true);
      const data = await forgotPassword(email);
      Toast.show({
        type: 'success',
        text2: `${data.message}`,
      });
      setLoading(false);
      setShowOption('OtpConfirm');
    } catch (err: any) {
      Toast.show({
        type: 'success',
        text2: `${err}`,
      });
      setLoading(false);
      console.log(err);
    }
  };

  const confirmOtp = async () => {
    if (otp.join('').length < 4) {
      Toast.show({
        type: 'error',
        text2: 'Enter OTP',
      });
      return;
    }
    try {
      setLoading(true);
      const data = await otpConfirm(email, otp.join(''));
      await Toast.show({
        type: 'success',
        text2: `${data.message}`,
      });
      setLoading(false);
      setShowOption('Reset');
    } catch (err: any) {
      Toast.show({
        type: 'success',
        text2: `${err}`,
      });
      console.log(err);
    }
  };

  const ResetPassword = async () => {
    if (!isValid) {
      Toast.show({
        type: 'error',
        text2:
          'Password must be at least 8 characters long and include numbers, letters, and special characters',
      });
      return;
    }
    if (password !== confirmPassword) {
      Toast.show({
        type: 'error',
        text2: 'Confirm Password is not same as Password ',
      });
      return;
    }

    try {
      setLoading(true);
      const data = await resetPassword(email, password);
      await Toast.show({
        type: 'success',
        text2: `${data.message}`,
      });
      setLoading(false);
      navigation.navigate('Login');
    } catch (err: any) {
      Toast.show({
        type: 'success',
        text2: `${err}`,
      });
      setLoading(false);
      navigation.navigate('Login');
      console.log(err);
    }
  };
  console.log(showOption);
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>MyMegaminds</Text>

      {showOption === 'Forgot' && (
        <Text style={styles.topText}>Forgot Passwrord?</Text>
      )}
      {showOption === 'Reset' && (
        <Text style={{marginVertical: 20, color: '#grey'}}>
          Set Your New Password
        </Text>
      )}
      {showOption === 'OtpConfirm' && (
        <Text style={styles.topText}>Enter OTP</Text>
      )}
      {showOption === 'Forgot' && (
        <Text style={styles.midText}>Don't Worry Reset Your Password</Text>
      )}
      {showOption === 'OtpConfirm' && (
        <Text style={styles.midText}>Enter the OTP sent to your email.</Text>
      )}
      {showOption === 'Forgot' && (
        <View style={styles.inputContainer}>
          <Image
            style={{width: 30, height: 30, opacity: 0.5}}
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
      )}
      {showOption === 'OtpConfirm' && (
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              style={styles.otpInput}
              keyboardType="numeric"
              maxLength={1}
              value={digit}
              onChangeText={text => handleChange(text, index)}
              ref={ref => (inputRefs.current[index] = ref)}
            />
          ))}
        </View>
      )}
      {showOption === 'Reset' && (
        <>
          <View style={styles.inputContainer}>
            <Image
              style={{width: 20, height: 20}}
              source={require('../assets/padlock.png')}
            />
            <TextInput
              placeholder="New Password"
              placeholderTextColor="#9E9E9E"
              value={password}
              onChangeText={handlePasswordChange}
              secureTextEntry
              style={styles.input}
              editable={!loading}
            />
            {isValid === true && (
              <Text style={styles.validText}>Strong 💪</Text>
            )}
            {isValid === false && (
              <Text style={styles.invalidText}>Not Strong 😥</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Image
              style={{width: 20, height: 20}}
              source={require('../assets/padlock.png')}
            />
            <TextInput
              placeholder="Confirm New Password"
              placeholderTextColor="#9E9E9E"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              style={styles.input}
              editable={!loading}
            />
          </View>
        </>
      )}
      <View>
        {showOption === 'Forgot' && (
          <>
            {loading ? (
              <ActivityIndicator size="large" color="#007bff" />
            ) : (
              <TouchableOpacity style={styles.button} onPress={sendOtp}>
                <Text style={styles.buttonText}>Send OTP</Text>
              </TouchableOpacity>
            )}
          </>
        )}
        {showOption === 'OtpConfirm' && (
          <>
            {loading ? (
              <ActivityIndicator size="large" color="#007bff" />
            ) : (
              <View>
                <TouchableOpacity style={styles.button} onPress={confirmOtp}>
                  <Text style={styles.buttonText}>Confirm OTP</Text>
                </TouchableOpacity>
                <View
                  style={{
                    marginTop: 15,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 40,
                  }}>
                  <Text style={{color: 'grey'}}>Didn't receive the OTP?</Text>
                  <TouchableOpacity onPress={sendOtp} style={{marginLeft: 5}}>
                    <Text style={{color: '#187afa', fontWeight: 'bold'}}>
                      Resend it
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
        )}
        {showOption === 'Reset' && (
          <>
            {loading ? (
              <ActivityIndicator size="large" color="#007bff" />
            ) : (
              <View>
                <TouchableOpacity style={styles.button} onPress={ResetPassword}>
                  <Text style={styles.buttonText}>Set Password</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
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
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#187afa',
  },
  topText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#187afa',
  },
  midText: {
    color: 'grey',
    marginTop: 20,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 20,
    marginHorizontal: 10,
  },
  input: {
    flex: 1,
    color: '#333',
    fontSize: 24,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 20,
  },
  otpInput: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 5,
    textAlign: 'center',
    fontSize: 18,
  },
  button: {
    backgroundColor: '#187afa',
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
  validText: {
    color: 'green',
  },
  invalidText: {
    color: 'red',
  },
});

export default LoginScreen;
