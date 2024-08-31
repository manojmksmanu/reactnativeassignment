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
import {getMessages, getUsers, sendMessage} from '../services/authService';
import {useAuth} from '../context/userContext';
import RenderMessage from '../components/chatScreen/RenderMessage';
import {getSenderName} from '../misc/misc';
interface User {
  _id: string;
  name: string;
  userType: any;
}
// const base_url = 'https://reactnativeassignment.onrender.com';
const base_url = 'http://10.0.2.2:5000';

const ChatWindow: React.FC<{route: any; navigation: any}> = ({
  route,
  navigation,
}) => {
  const {chatId} = route.params;
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [socket, setSocket] = useState<any>();
  const [isConnected, setIsConnected] = useState(true);
  const [replyingMessage, setReplyingMessage] = useState<any>(null);
  const [isReplying, setIsReplying] = useState<boolean>(false);
  const textInputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const {loggedUserId, loggedUser, selectedChat} = useAuth() as {
    loggedUserId: string;
    loggedUser: User;
    selectedChat: any;
  };
  const [selectedMessages, setSelectedMessages] = useState<any[]>([]);
  const [forwardMode, setForwardMode] = useState<boolean>(false);
  const [currentSender, setCurrentSender] = useState<any>(null);
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

    // Join the chat room
    socketInstance.emit('joinRoom', chatId);

    socketInstance.on('connect', () => {
      setIsConnected(true);
    });

    socketInstance.on('receiveMessage', messageData => {
      if (messageData.sender !== loggedUserId) {
        setMessages(prevMessages => [...prevMessages, messageData]);
      }
    });
    socketInstance.on('forwarMessageReceived', newMessages => {
      // console.log(newMessages, 'message data');
      // console.log(messages);
      setMessages(prevMessages => [...prevMessages, ...newMessages]);
      // console.log(messages, 'messages');
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

  // ----chat window header--
  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.headerTitleContainer}>
          <Image
            source={require('../assets/man.png')}
            style={{width: 40, height: 40, marginRight: 5}}
          />
          <Text style={styles.usernameText}>
            {loggedUser && getSenderName(loggedUser, selectedChat.users)}
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
          {selectedMessages.length > 0 && (
            <TouchableOpacity onPress={() => navigateToForwardScreen()}>
              <Image
                source={require('../assets/forward-message.png')}
                style={{width: 30, height: 30}}
              />
            </TouchableOpacity>
          )}
        </View>
      ),
    });
  }, [navigation, currentSender, selectedMessages]);
  // ----chat window header end--

  const handleMoreOptions = () => {
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

  //----send message function--
  const handleSendMessage = async () => {
    setReplyingMessage('');
    setMessage('');
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
      setMessages(prevMessages => [...prevMessages, messageData]);
    }
    await sendMessage(messageData);
  };
  // --send message function ends here--

  // ----function for handleswipeLeft and swipeRight ----
  const handleSwipeLeft = (item: any) => {
    setReplyingMessage(item);
    setIsReplying(true);
  };

  const handleSwipeRight = (item: any) => {
    setReplyingMessage(item);
    setIsReplying(true);
  };
  // ----function for handleswipeLeft and swipeRight ends here ----

  const handleRemoveReplying = () => {
    setReplyingMessage('');
  };

  useEffect(() => {
    if (isReplying && textInputRef.current) {
      setTimeout(() => {
        textInputRef.current?.focus();
        setIsReplying(false);
      }, 10);
    }
  }, [isReplying]);
  const navigateToForwardScreen = () => {
    setSelectedMessages([]);
    navigation.navigate('ForwardChatScreen', {
      messagesToForward: selectedMessages,
      socket: socket,
      loggedUserId:loggedUser._id,
      loggedUsername:loggedUser.name
    });
  };

  const handleLongPress = (message: any) => {
    setForwardMode(true);
    setSelectedMessages([message]);
  };

  const handleTap = (message: any) => {
    if (forwardMode) {
      setSelectedMessages(prevSelected => {
        const isSelected = prevSelected.some(msg => msg._id === message._id);
        const updatedMessages = isSelected
          ? prevSelected.filter(msg => msg._id !== message._id)
          : [...prevSelected, message];
        return updatedMessages;
      });
    }
  };

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
              const isSelected = selectedMessages.some(
                msg => msg._id === item._id,
              );

              return (
                <TouchableOpacity
                  key={item._id} // Ensure each TouchableOpacity has a unique key
                  onLongPress={() => handleLongPress(item)}
                  onPress={() => handleTap(item)}
                  // onPress={() => {if (!isSelected) {
                  //   // Perform your onPress action here
                  // }}}
                  style={{
                    backgroundColor: isSelected ? 'lightgray' : 'transparent', // Apply background color based on selection
                  }}>
                  <RenderMessage
                    item={item}
                    loggedUserId={loggedUserId}
                    onLeftSwipe={() => handleSwipeLeft(item)}
                    onRightSwipe={() => handleSwipeRight(item)}
                  />
                </TouchableOpacity>
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
                    {replyingMessage.senderName !== loggedUser.name
                      ? replyingMessage.senderName
                      : 'You'}
                  </Text>
                  <Text style={{fontSize: 16, color: 'grey'}}>
                    {replyingMessage && replyingMessage.message}
                  </Text>
                  <TouchableOpacity
                    onPress={handleRemoveReplying}
                    style={styles.closeReplyingMessage}>
                    <Image
                      style={{width: 25, height: 25}}
                      source={require('../assets/remove.png')}
                    />
                  </TouchableOpacity>
                </View>
              )}
              <View>
                <TextInput
                  ref={textInputRef} // Attach ref to TextInput
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Type a message"
                  placeholderTextColor="#808080"
                  style={styles.input}
                  multiline
                />
                <View>
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
              </View>
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
    borderRadius: 15,
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
    fontSize: 18,
    borderWidth: 0,
    borderColor: '#363737',
    borderRadius: 15,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginRight: 12,
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
    backgroundColor: '#E7FFE7',
    borderRadius: 20,
    padding: 20,
    margin: 10,
    position: 'relative',
  },
  closeReplyingMessage: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
});

export default ChatWindow;
