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
import {useAuth} from '../context/userContext';
import {getSendedType, getSenderName, getSenderStatus} from '../misc/misc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {
  format,
  formatDistanceToNow,
  isToday,
  isYesterday,
  parseISO,
} from 'date-fns';
import { loggeduser } from '../services/authService';

const formatMessageDate = (dateString: any) => {
  if (!dateString) {
    return '';
  }

  try {
    const date = parseISO(dateString);

    if (isNaN(date.getTime())) {
      console.error('Parsed date is invalid.');
      return 'Invalid Date';
    }

    const now = new Date();

    if (isToday(date)) {
      return format(date, 'p'); // Time format like '1:45 PM'
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return formatDistanceToNow(date, {addSuffix: true});
    }
  } catch (error) {
    console.error('Error parsing date:', error);
    return '';
  }
};

type RootStackParamList = {
  ChatList: undefined;
  ChatWindow: {chatId: string};
  Login: undefined;
};
const ChatListScreen: React.FC = () => {
  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, 'ChatList'>>();
  const {
    setLoggedUser,
    loggedUser,
    setChats,
    chats,
    setSelectedChat,
    fetchAgain,
    onlineUsers,
    socket,
    loading,
    FetchChatsAgain,
  } = useAuth();
  // Update header title and right component
  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View>
          <Text style={styles.headerText}>MyMegaminds</Text>
        </View>
      ),
      headerLeft: () => null,
      headerRight: () => (
        <View>
          {loggedUser ? (
            <>
              {/* <Text style={{}}>
                {loggedUser.name} - ({loggedUser.userType})
              </Text> */}
              <TouchableOpacity onPress={() => removeToken()}>
                <Text style={{paddingRight:20}}>LogOut</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={{color:'#aa14f0',fontSize:18}}>Loading...</Text>
          )}
        </View>
      ),
    });
    const removeToken = async () => {
      try {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('userInfo');
        socket?.emit('logout', loggedUser?._id);
        setLoggedUser(null);
        navigation.navigate('Login');
        console.log('Token removed successfully');
      } catch (error) {
        console.error('Failed to remove token:', error);
      }
    };
  }, [navigation, loggedUser]);

  useEffect(() => {
    socket?.on('fetchAgain', () => {
      console.log('message received hello');
      FetchChatsAgain();
      console.log(fetchAgain, 'on list screen (old value)'); // This will still log the old value
    });
  }, [socket]);

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
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
          }}>
          <Text style={styles.username}>
            {loggedUser ? getSenderName(loggedUser, item.users) : 'Unknown'}
          </Text>
          <Text style={{fontSize: 10, color: '#aa14f0'}}>
            {loggedUser ? getSendedType(loggedUser, item.users) : 'Unknown'}
          </Text>
        </View>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <Text>
            {loggedUser ? item.latestMessage && item.latestMessage.message : ''}
          </Text>
          <Text style={{fontSize: 12}}>
            {loggedUser &&
              formatMessageDate(
                item.latestMessage && item.latestMessage.createdAt,
              )}
          </Text>
        </View>
        <Text style={styles.statusText}>
          {loggedUser &&
          getSenderStatus(loggedUser, item.users, onlineUsers || []) ===
            'online' ? (
            <Image
              style={{width: 10, height: 10}}
              source={require('../assets/dotgreen.png')}
            />
          ) : (
            <Image
              style={{width: 8, height: 8}}
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
  },
  userInfo: {
    position: 'relative',
    width: '100%',
    flexDirection: 'column',
  },
  username: {
    fontSize: 18,
    color: '#333',
  },
  statusText: {
    fontSize: 11,
    position: 'absolute',
    color: 'grey',
    right: 0,
    top: -4,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  headerText: {
    color: '#aa14f0',
    fontSize:20,
    fontWeight:'bold',
    paddingLeft:6
  },
});

export default ChatListScreen;
