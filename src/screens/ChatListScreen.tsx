import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {getAllChats, getUsers, loggeduser} from '../services/authService';
import {useAuth} from '../context/userContext';
import {getSendedType, getSenderName, getSenderStatus} from '../misc/misc';
interface User {
  _id: string;
  name: string;
  userType: any;
  // Add other properties as needed
}

const ChatListScreen: React.FC<{navigation: any}> = ({navigation}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Loading state

  const {
    setLoggedUser,
    loggedUser,
    loggedUserId,
    setChats,
    chats,
    setSelectedChat,
    fetchAgain,
    onlineUsers,
  } = useAuth();
  console.log(onlineUsers, 'fsdkljfl');
  console.log(chats, 'chats');
  // ----chatList window header--
  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View>
          <Text style={{color: 'grey'}}>Chat List</Text>
        </View>
      ),
      headerRight: () => (
        <View>
          <Text style={{color: 'grey'}}>
            {loggedUser && loggedUser.name}-({loggedUser && loggedUser.userType}
            )
          </Text>
        </View>
      ),
    });
  }, [navigation, loggedUser]);
  // ----chatList window header end--

  useEffect(() => {
    const find = async () => {
      const response: User | null = await loggeduser();
      setLoggedUser(response);
    };
    find();
  }, [setLoggedUser]);

  useEffect(() => {
    if (loggedUserId) {
      const fetchChats = async () => {
        // setLoading(true); // Start loading
        try {
          const response = await getAllChats(loggedUserId);
          setChats(response);
        } catch (error) {
          console.error('Failed to fetch chats:', error);
        } finally {
          setLoading(false); // Stop loading
        }
      };
      fetchChats();
    }
  }, [fetchAgain]);

  const chatClicked = (chat: any) => {
    navigation.navigate('ChatWindow', {chatId: chat._id});
    setSelectedChat(chat);
  };

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
          renderItem={({item}) => (
            <TouchableOpacity
              onPress={() => chatClicked(item)}
              style={styles.userContainer}>
              <View style={styles.userInfo}>
                <Text style={styles.username}>
                  {loggedUser && getSenderName(loggedUser, item.users)}-(
                  {loggedUser && getSendedType(loggedUser, item.users)})
                </Text>
                <Text>
                  {loggedUser &&
                    getSenderStatus(loggedUser, item.users, onlineUsers)}
                </Text>
              </View>
            </TouchableOpacity>
          )}
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: 18,
    marginLeft: 10,
    color: '#333',
  },
});

export default ChatListScreen;
