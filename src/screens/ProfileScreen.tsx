import React, {useEffect, useState} from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Button,
  Text,
  StyleSheet,
  Image,
} from 'react-native';
import {useAuth} from '../context/userContext';
type RootStackParamList = {
  ChatList: undefined;
  ChatWindow: {chatId: string};
  Login: undefined;
  Profile: undefined;
};
const ProfileScreen: React.FC<{route: any; navigation: any}> = ({
  route,
  navigation,
}) => {
  const {chats, loggedUser} = useAuth();
  console.log(loggedUser);
  useEffect(() => {
    navigation.setOptions({
      // Custom back icon (left header)
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
        <View>
          <Text>User Profile</Text>
        </View>
      ),
      headerRight: () => <View></View>,
    });
  }, []);
  // ----chat window header end--
  return (
    <View style={{flex: 1}}>
      <View style={{backgroundColor: 'white'}}>
        <Text>{loggedUser && loggedUser.name}</Text>
      </View>
      <Text>{loggedUser && loggedUser.userType}</Text>
      <Text>{loggedUser && loggedUser.email}</Text>
      <Text>{loggedUser && loggedUser.phoneNumber}</Text>
      <Text>{loggedUser && loggedUser.whatsappNumber}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  backButton: {
    marginLeft: 10, // Adjust margin if needed
    padding: 5,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#555', // Customize icon color if needed
  },
});

export default ProfileScreen;
