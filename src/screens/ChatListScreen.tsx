import React, {useEffect, useCallback, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  SafeAreaView,
} from 'react-native';
import {useAuth} from '../context/userContext';
import {
  getSendedType,
  getSender,
  getSenderName,
  getSenderStatus,
} from '../misc/misc';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {format, isToday, isYesterday, parseISO} from 'date-fns';
import {TextInput} from 'react-native-gesture-handler';
import BottomNavigation from '../components/listScreen/BottomNavigation';
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
    if (isToday(date)) {
      return format(date, 'p'); // Time format like '1:45 PM'
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MM/dd/yy'); // Simple date format
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
  Profile: undefined;
  ChatWindow2: {chatId: string};
};
interface User {
  _id: string;
  name: string;
  userType: any;
  email: string;
  phoneNumber: string;
  whatsappNumber: string;
}
interface Chat {
  _id: string;
  users: User[];
}

const ChatListScreen: React.FC = () => {
  const {
    setLoggedUser,
    loggedUser,
    setChats,
    chats,
    setSelectedChat,
    onlineUsers,
    socket,
    loading,
    FetchChatsAgain,
  } = useAuth();
  const [searchText, setSearchText] = useState<string>('');
  const [filteredChats, setFilteredChats] = useState<Chat[] | null>(null);
  const [showType, setShowType] = useState<string>('Home');
  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, 'ChatList'>>();

  console.log(showType, 'hdf');
  // -----filter chats by sender name ---
  useEffect(() => {
    setShowType('Home');
    const searchChats = () => {
      if (searchText.trim() === '') {
        setFilteredChats(chats || null);
      } else {
        const updatedChats = chats?.filter(chat => {
          if (loggedUser) {
            const sender = getSender(loggedUser, chat.users);
            return (
              sender &&
              sender.user.name?.toLowerCase().includes(searchText.toLowerCase())
            );
          }
        });
        setFilteredChats(updatedChats || null);
      }
    };
    searchChats();
  }, [searchText, chats, loggedUser]);

  const handleShowUsertype = async (itemType: string) => {
    console.log(itemType);

    if (itemType === 'Home') {
      setFilteredChats(chats);
    }

    if (
      itemType === 'Admins' ||
      itemType === 'Tutor' ||
      itemType === 'Student'
    ) {
      const updateChatsByChatType = chats?.filter((chat: any) => {
        return chat.chatType === 'one-to-one';
      });

      const updateChats = updateChatsByChatType?.filter((chat: any) => {
        if (loggedUser) {
          const sender = getSender(loggedUser, chat.users);
          if (itemType === 'Admins') {
            return (
              (sender && sender.user.userType === 'Admin') ||
              sender.user.userType === 'Super-Admin' ||
              sender.user.userType === 'Co-Admin' ||
              sender.user.userType === 'Sub-Admin' ||
              sender.user.userType === 'Admin'
            );
          }
          if (itemType === 'Tutor') {
            return sender && sender.user.userType === 'Tutor';
          }
          if (itemType === 'Student') {
            return sender && sender.user.userType === 'Student';
          }
        }
      });

      setFilteredChats(updateChats || null);
    }

    if (itemType === 'Group') {
      const updateChatsByChatType = chats?.filter((chat: any) => {
        return chat.chatType === 'group';
      });
      setFilteredChats(updateChatsByChatType || null);
    }
  };

  //------header-------
  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => <Text style={styles.headerText}>MyMegaminds</Text>,
      headerLeft: () => null,
      headerRight: () => (
        <TouchableOpacity onPress={handleRedirectToProfileScreen}>
          <Image
            style={styles.logoutText} // Consider renaming this style since it refers to an image now
            source={require('../assets/menu.png')}
          />
        </TouchableOpacity>
      ),
      headerStyle: {
        backgroundColor: 'white', // Set your desired background color
        shadowColor: 'transparent', // Remove shadow on iOS
        elevation: 0, // Remove shadow on Android
        borderBottomWidth: 0, // Optional: Remove border on iOS
      },
    });
    const handleRedirectToProfileScreen = () => {
      navigation.navigate('Profile');
    };
  }, [navigation, loggedUser]);

  // ---fetch Again active----
  useEffect(() => {
    socket?.on('userIsDeleted', data => {
      FetchChatsAgain();
    });
    socket?.on('fetchAgain', () => {
      FetchChatsAgain();
    });
  }, [socket]);

  const chatClicked = useCallback(
    (chat: any) => {
      navigation.navigate('ChatWindow2', {chatId: chat._id});
      setSelectedChat(chat);
    },
    [navigation, setSelectedChat],
  );

  const getUserFirstLetter = (userType: any) => {
    return userType ? userType.charAt(0).toUpperCase() : '';
  };

  const renderItem = ({item}: {item: any}) => (
    <TouchableOpacity
      onPress={() => chatClicked(item)}
      style={styles.userContainer}>
      <View style={styles.profileCircle}>
        {loggedUser ? (
          <Text style={styles.profileText}>
            {getUserFirstLetter(getSenderName(loggedUser, item.users))}
          </Text>
        ) : null}
        <View style={styles.statusContainer}>
          {loggedUser &&
          getSenderStatus(loggedUser, item.users, onlineUsers || []) ===
            'online' ? (
            <View style={styles.statusDotgreen}></View>
          ) : (
            <View style={styles.statusDotgrey}></View>
          )}
        </View>
      </View>
      <View style={styles.userInfo}>
        <View style={styles.userHeader}>
          <Text style={styles.username}>
            {loggedUser ? getSenderName(loggedUser, item.users) : 'Unknown'}
          </Text>
          {loggedUser ? (
            <Text style={styles.userTypeText}>
              {getSendedType(loggedUser, item.users)}
            </Text>
          ) : null}
        </View>
        {loggedUser && item.latestMessage ? (
          <View style={styles.userHeader}>
            <Text style={styles.message}>
              {loggedUser ? item.latestMessage?.message : ''}
            </Text>
            <Text style={styles.time}>
              {loggedUser && formatMessageDate(item.latestMessage?.createdAt)}
            </Text>
          </View>
        ) : (
          ''
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#007bff"
          style={styles.loadingIndicator}
        />
      ) : (
        <View style={styles.content}>
          <View style={styles.searchContainer}>
            <Image
              style={styles.icon}
              source={require('../assets/search.png')}
            />
            <TextInput
              style={styles.input}
              placeholder="Search users..."
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor="#888"
              autoCapitalize="none"
            />
          </View>
          {showType === 'Group' && (
            <View>
              <TouchableOpacity
                style={{
                  backgroundColor: '#187afa',
                  marginHorizontal: 18,
                  borderRadius: 10,
                }}>
                <Text
                  style={{textAlign: 'center', padding: 10, color: 'white'}}>
                  Create New Group
                </Text>
              </TouchableOpacity>
            </View>
          )}
          <FlatList
            data={filteredChats}
            keyExtractor={item => item._id}
            renderItem={renderItem}
          />
        </View>
      )}
      <View style={styles.bottomNavigation}>
        <BottomNavigation
          handleShowUsertype={handleShowUsertype}
          showType={showType}
          setShowType={setShowType}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 5,
    paddingVertical: 10,
    backgroundColor: 'white',
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 30,
    marginVertical: 10,
    margin: 15,
  },
  content: {
    height: '90%',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingLeft: 8,
  },
  icon: {
    marginRight: 8,
    width: 30,
    height: 30,
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#187afa',
    paddingLeft: 6,
  },
  logoutText: {
    width: 30,
    height: 30,
    marginRight: 20,
    color: 'grey',
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  profileCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profileText: {
    fontSize: 20,
    color: '#333',
  },
  userTypeText: {
    fontSize: 12,
    color: 'grey',
  },
  userInfo: {
    flex: 1,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  message: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
  },
  statusDot: {
    width: 20,
    height: 20,
    marginRight: 6,
    top: -15,
    left: -6,
  },
  statusDotgreen: {
    opacity: 0.5,
    backgroundColor: '#25D366',
    width: 10,
    height: 10,
    marginRight: 6,
    bottom: -15,
    right: -20,
    borderRadius: 100,
  },
  statusDotgrey: {
    opacity: 0.5,
    backgroundColor: 'grey',
    width: 10,
    height: 10,
    marginRight: 6,
    bottom: -15,
    right: -20,
    borderRadius: 100,
  },
  statusText: {
    fontSize: 12,
    color: 'grey',
  },
  bottomNavigation: {
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default ChatListScreen;
