import React, {useState, useEffect, useRef} from 'react';
import {io} from 'socket.io-client';
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
  ScrollView,
} from 'react-native';
import {getMessages, getUsers} from '../services/authService';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '../context/userContext';
import RenderMessage from '../components/chatScreen/RenderMessage';
interface User {
  _id: string;
  username: string;
}

const base_url = 'http://10.0.2.2:5000';

const ChatWindow: React.FC<{route: any}> = ({route}) => {
  const navigation = useNavigation();
  const {chatId} = route.params;
  console.log(chatId, 'chatId');
  const [messages, setMessages] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [currentChat, setCurrentChat] = useState<any>(null);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [socket, setSocket] = useState<any>();
  const [isConnected, setIsConnected] = useState(true);
  const [replyingMessage, setReplyingMessage] = useState<any>(null);
  const [isReplying, setIsReplying] = useState<boolean>(false);
  const textInputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const {loggedUserId, loggedUser} = useAuth() as {
    loggedUserId: string;
    loggedUser: User;
  };
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({animated: false});
  };
  // Handle content size change to scroll to bottom
  const hanldeContentSizeChange = () => {
    scrollViewRef.current?.scrollToEnd({animated: false});
  };
  // ----socket connection--
  useEffect(() => {
    const socketInstance = io(base_url, {
      transports: ['websocket'],
      reconnection: true, // Automatically reconnect
      reconnectionAttempts: Infinity, // Retry indefinitely
      reconnectionDelay: 1000, // Initial delay
      reconnectionDelayMax: 5000, // Maximum delay
    });
    setSocket(socketInstance);
    socketInstance.on('connect', () => {
      setIsConnected(true);
    });
    socketInstance.on('receiveMessage', messageData => {
      if (messageData.sender !== loggedUserId) {
        setMessages(prevMessages => [...prevMessages, messageData]);
      }
    });
    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);
  // --socket connection end--

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true); // Start loading
      try {
        const response = await getUsers();
        setUsers(response);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false); // Stop loading
      }
    };
    fetchUsers();
  }, []);
  // Fetch users end

  // useEffect(() => {
  //   if (users.length > 0) {
  //     const user = users.find(user => user._id === userId);
  //     setCurrentChat(user);
  //   }
  // }, [users, userId]);

  // ----chat window header--
  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.headerTitleContainer}>
          <Image
            source={require('../assets/man.png')}
            style={{width: 40, height: 40, marginRight: 10}}
          />
          <Text style={styles.usernameText}>
            {currentChat && currentChat.username}
          </Text>
        </View>
      ),
      headerRight: () => (
        <View style={styles.headerRightContainer}>
          <TouchableOpacity onPress={() => handleMoreOptions()}>
            <Image
              source={require('../assets/dots.png')}
              style={{width: 20, height: 20}}
            />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, currentChat]);
  // ----chat window header end--

  const handleMoreOptions = () => {
    // Handle more options logic here
    console.log('More options icon pressed');
  };

  // ---fetchMessages function --
  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true); // Start loading
      try {
        const response = await getMessages(chatId);
        setMessages(response);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      } finally {
        setLoading(false); // Stop loading
      }
    };
    fetchMessages();
  }, [chatId]);

  // ---fetch messages function end --
  const handleSendMessage = async () => {
    setReplyingMessage('');
    if (message === '') return;
    const messageId = Date.now().toString(); // Unique ID for the message
    const messageData = {
      chatId: chatId,
      sender: loggedUserId,
      senderName: loggedUser ? loggedUser.username : 'Unknown',
      message,
      messageId,
      replyingMessage,
    };

    if (socket) {
      socket.emit('sendMessage', messageData);
      // Clear unsent messages list if socket is connected
      setMessages(prevMessages => [...prevMessages, messageData]);
    } else {
      // setUnsentMessages(prevMessages => [...prevMessages, messageData]);
    }

    setMessage('');
  };
  const handleSwipeLeft = (item: any) => {
    // console.log('Left swipe on item:', item);
    setReplyingMessage(item);
    setIsReplying(true);
  };

  const handleSwipeRight = (item: any) => {
    // console.log('Right swipe on item:', item);
    setReplyingMessage(item);
    setIsReplying(true);
  };

  const handleRemoveReplying = () => {
    setReplyingMessage('');
  };

  useEffect(() => {
    if (isReplying && textInputRef.current) {
      textInputRef.current.focus(); // Focus the input field
      setIsReplying(false); // Reset the state after focusing
    }
  }, [isReplying]);

  return (
    <ImageBackground
      source={require('../assets/b9qk3w41sqf1l0ccujfh.webp')}
      style={styles.background}>
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#007bff"
            style={styles.loadingIndicator}
          />
        ) : (
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={{flexGrow: 0}}
            onContentSizeChange={hanldeContentSizeChange}>
            {messages.map(item => {
              return (
                <RenderMessage
                  item={item}
                  loggedUserId={loggedUserId}
                  onLeftSwipe={() => handleSwipeLeft(item)}
                  onRightSwipe={() => handleSwipeRight(item)}
                />
              );
            })}
          </ScrollView>
        )}
        <View>
          <View style={styles.inputMainContainer}>
            <View style={styles.inputContainer}>
              {replyingMessage && (
                <View style={styles.replyingMessage}>
                  <Text style={{fontSize: 18, color: '#25d366'}}>
                    {replyingMessage.senderName !== loggedUser.username
                      ? replyingMessage.senderName
                      : 'You'}
                  </Text>
                  <Text style={{fontSize: 16}}>
                    {replyingMessage && replyingMessage.message}
                  </Text>
                  <TouchableOpacity
                    onPress={handleRemoveReplying}
                    style={styles.closeReplyingMessage}>
                    <Image
                      style={{width: 15, height: 15}}
                      source={require('../assets/remove.png')}
                    />
                  </TouchableOpacity>
                </View>
              )}
              <TextInput
                ref={textInputRef} // Attach ref to TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="Type a message"
                placeholderTextColor="#808080"
                style={styles.input}
                multiline
              />
              <Image
                source={require('../assets/attach-file.png')}
                style={{
                  width: 22,
                  height: 22,
                  position: 'absolute',
                  zIndex: 10,
                  bottom: 9,
                  right: 50,
                  opacity: 0.6,
                }}
              />
              <Image
                source={require('../assets/photo-camera.png')}
                style={{
                  width: 24,
                  height: 24,
                  position: 'absolute',
                  zIndex: 10,
                  bottom: 10,
                  right: 23,
                  opacity: 0.6,
                }}
              />
            </View>
            <TouchableOpacity
              onPress={handleSendMessage}
              style={styles.sendButton}>
              <Image
                source={require('../assets/send-message.png')}
                style={styles.image}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  usernameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 70,
    marginRight: 10,
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    padding: 10,
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
  },
  messageList: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  emojiSelector: {
    height: 350,
  },
  inputMainContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 5,
  },
  inputContainer: {
    backgroundColor: 'white',
    width: '90%',
    position: 'relative',
    marginRight: 10,
    flex: 1,
    borderRadius: 25,
    textDecorationLine: 'none',

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 1,
  },
  input: {
    color: 'grey',
    paddingLeft: 20,
    textDecorationLine: 'none',
    paddingRight: 60,
    fontSize: 20,
    borderWidth: 0.05,
    borderColor: '#363737',
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginRight: 10,
    minHeight: 40,
    maxHeight: 120,
  },
  sendButton: {
    backgroundColor: '#25d366',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000', // Shadow color
    shadowOffset: {
      width: 0, // Horizontal offset
      height: 1, // Vertical offset
    },
    shadowOpacity: 0.2, // Shadow opacity
    shadowRadius: 1, // Shadow blur radius
    elevation: 1, // Android shadow
  },
  image: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  replyingMessage: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    position: 'relative',
  },
  closeReplyingMessage: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
});

export default ChatWindow;
