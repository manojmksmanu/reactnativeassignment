import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import {getAllChats, loggeduser} from '../services/authService';
import {useAuth} from '../context/userContext';
import {getSendedType, getSenderName, getSenderStatus} from '../misc/misc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

type RootStackParamList = {
  ChatList: undefined;
  ChatWindow: {chatId: string};
  Login: undefined;
};
const ChatListScreen: React.FC = () => {
  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, 'ChatList'>>();
  const [loading, setLoading] = useState<boolean>(true);
  const {
    setLoggedUser,
    loggedUser,
    setChats,
    chats,
    setSelectedChat,
    fetchAgain,
    onlineUsers,
    socket,
    FetchChatsAgain,
  } = useAuth();
  // Update header title and right component
  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View>
          <Text style={styles.headerText}>Chat List</Text>
        </View>
      ),
      headerLeft: () => null,
      headerRight: () => (
        <View>
          {loggedUser ? (
            <>
              <Text style={styles.headerText}>
                {loggedUser.name} - ({loggedUser.userType})
              </Text>
              <TouchableOpacity onPress={() => removeToken()}>
                <Text style={styles.headerText}>LogOut</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.headerText}>Loading...</Text>
          )}
        </View>
      ),
    });
    const removeToken = async () => {
      try {
        await AsyncStorage.removeItem('token');

        socket?.emit('logout', loggedUser?._id);

        setLoggedUser(null);
        navigation.navigate('Login');
        console.log('Token removed successfully');
      } catch (error) {
        console.error('Failed to remove token:', error);
      }
    };
  }, [navigation, loggedUser]);

  // Fetch chats
  useEffect(() => {
    if (loggedUser) {
      const fetchChats = async () => {
        setLoading(true);
        try {
          const response = await getAllChats(loggedUser._id);
          setChats(response);
        } catch (error) {
          console.error('Failed to fetch chats:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchChats();
    }
  }, [fetchAgain, loggedUser]);
  // Fetch Chats end here

  // Handle chat item click
  const chatClicked = useCallback(
    (chat: any) => {
      navigation.navigate('ChatWindow', {chatId: chat._id});
      setSelectedChat(chat);
    },
    [navigation, setSelectedChat],
  );
  // Render chat item
  const renderItem = ({item}: {item: any}) => (
    <TouchableOpacity
      onPress={() => chatClicked(item)}
      style={styles.userContainer}>
      <View style={styles.userInfo}>
        <Text style={styles.username}>
          {loggedUser ? getSenderName(loggedUser, item.users) : 'Unknown'} - (
          {loggedUser ? getSendedType(loggedUser, item.users) : 'Unknown'})
        </Text>
        <Text style={styles.statusText}>
          {loggedUser &&
          getSenderStatus(loggedUser, item.users, onlineUsers || []) ===
            'online' ? (
            <Image
              style={{width: 15, height: 15}}
              source={require('../assets/dotgreen.png')}
            />
          ) : (
            <Image
              style={{width: 15, height: 15}}
              source={require('../assets/dot.png')}
            />
          )}
          {loggedUser
            ? getSenderStatus(loggedUser, item.users, onlineUsers || [])
            : 'Status Unknown'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#007bff"
          style={styles.loadingIndicator}
        />
      ) : (
        <FlatList
          data={chats}
          keyExtractor={item => item._id}
          renderItem={renderItem}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
  },
  userContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 5,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  userInfo: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  username: {
    fontSize: 18,
    marginLeft: 10,
    color: '#333',
  },
  statusText: {
    color: 'grey',
  },
  headerText: {
    color: 'grey',
  },
});

export default ChatListScreen;
