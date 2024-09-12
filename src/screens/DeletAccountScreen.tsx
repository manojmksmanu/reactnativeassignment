import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import {useAuth} from '../context/userContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
type RootStackParamList = {
  ChatList: undefined;
  ChatWindow: {chatId: string};
  Login: undefined;
};
const DeleteAccount: React.FC<{navigation: any}> = ({navigation}) => {
  const navigationToLogin =
    useNavigation<StackNavigationProp<RootStackParamList, 'ChatList'>>();
  const {loggedUser, socket, setLoggedUser} = useAuth();
  const deleteUserAccount = async () => {
    // Handle account deletion logic here
    await AsyncStorage.removeItem('userInfo');
    await AsyncStorage.removeItem('chats');
    await AsyncStorage.removeItem('token');
    socket?.emit('logout', loggedUser?._id);
    navigationToLogin.navigate('Login');
  };

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Image
            source={require('../assets/back.png')} // Your custom back icon image
            style={styles.backIcon}
          />
        </TouchableOpacity>
      ),
      headerTitle: () => (
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Delete Account</Text>
        </View>
      ),
      headerRight: () => <View></View>,
    });
  }, [navigation]);

  return <View style={styles.container}></View>;
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  backButton: {
    marginLeft: 10,
    padding: 5,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#555',
  },
  headerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'grey',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DeleteAccount;
