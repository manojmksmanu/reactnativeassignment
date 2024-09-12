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
const ProfileScreen: React.FC<{navigation: any}> = ({navigation}) => {
  const navigationToLogin =
    useNavigation<StackNavigationProp<RootStackParamList, 'ChatList'>>();
  const {loggedUser, socket, setLoggedUser} = useAuth();

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userInfo');
      await AsyncStorage.removeItem('chats');
      await AsyncStorage.removeItem('token');
      socket?.emit('logout', loggedUser?._id);
      setLoggedUser(null);
      navigationToLogin.navigate('Login');
      console.log('Token removed successfully');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };
  const deleteUserAccount = async () => {
    navigation.navigate('DeleteAccount');
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
          <Text style={styles.headerTitle}>User Profile</Text>
        </View>
      ),
      headerRight: () => <View></View>,
    });
  }, [navigation]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Logout', onPress: () => logout()},
      ],
      {cancelable: true},
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone. But this feature is not working right now ',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Delete', onPress: () => deleteUserAccount()},
      ],
      {cancelable: false},
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.profileHeader}>
        <Image
          source={require('../assets/user.png')}
          style={styles.profilePicture}
        />
        <Text style={styles.name}>{loggedUser?.name}</Text>
        <Text style={styles.userType}>{loggedUser?.userType}</Text>
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.detailText}>Email: {loggedUser?.email}</Text>
        <Text style={styles.detailText}>Phone: {loggedUser?.phoneNumber}</Text>
        <Text style={styles.detailText}>
          WhatsApp: {loggedUser?.whatsappNumber}
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={handleDeleteAccount}>
          <Text style={styles.buttonText}>Delete Account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  userType: {
    fontSize: 18,
    color: '#777',
    marginBottom: 10,
  },
  detailsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  detailText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    backgroundColor: '#187afa',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 10,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#187afa',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
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

export default ProfileScreen;
