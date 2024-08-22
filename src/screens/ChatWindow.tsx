import React, {useState, useEffect, useRef} from 'react';
import {io} from 'socket.io-client';
import {
  View,
  Text,
  TextInput,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import {
  getCurrentUser,
  getMessages,
  getUsers,
  sendMessage,
} from '../services/authService';
import {useNavigation} from '@react-navigation/native';
import EmojiSelector from 'react-native-emoji-selector';
import { useAuth } from '../context/userContext';

const base_url = 'http://10.0.2.2:5000';

const ChatWindow: React.FC<{route: any}> = ({route}) => {
  const [isEmojiSelectorVisible, setEmojiSelectorVisible] = useState(false);
  const navigation = useNavigation();
  const {userId} = route.params;
  const [messages, setMessages] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [currentChat, setCurrentChat] = useState<any>(null);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const flatListRef = useRef<FlatList<any>>(null); // Create ref for FlatList
  const [socket, setSocket] = useState<any>();
  const [isConnected, setIsConnected] = useState(true);
const {loggedUser}=useAuth();
  // ----socket connection--
  useEffect(() => {
    const socketInstance = io(base_url, {
      transports: ['websocket'], // Forces WebSocket transport
    });
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Socket connected with ID:', socketInstance.id);
      setIsConnected(true);
    });

    // Send unsent messages when connected
    socketInstance.on('receiveMessage', messageData => {
      console.log('Received message:', messageData.sender);
      // If the sender of the message is the logged-in user, do not set the message
      console.log(messageData.sender, loggedUser, 'details');
      if (messageData.sender !== loggedUser) {
        // If the sender is not the logged-in user, add the message to the state
        setMessages(prevMessages => [...prevMessages, messageData]);
      }
    
    });

    return () => {
      if (socket) {
        socket.disconnect();
        setIsConnected(false);
      }
    };
  }, []);
  // --socket connection end--
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

  useEffect(() => {
    if (users.length > 0) {
      const user = users.find(user => user._id === userId);
      setCurrentChat(user);
    }
  }, [users, userId]);

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
          <TouchableOpacity onPress={() => handleVideoCall()}>
            {/* <Image
                source={require('../assets/cam-recorder.png')}
                style={{width: 20, height: 20}}
              /> */}
            {/* <Ionicons name="videocam" size={24} color="black" /> */}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleMoreOptions()}>
            <Image
              source={require('../assets/dots.png')}
              style={{width: 20, height: 20}}
            />
            {/* <Ionicons name="ellipsis-vertical" size={24} color="black" /> */}
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, currentChat]);
  const handleVideoCall = () => {
    // Handle video call logic here
    console.log('Video call icon pressed');
  };

  const handleMoreOptions = () => {
    // Handle more options logic here
    console.log('More options icon pressed');
  };
// ---fetchMessages function -- 
  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true); // Start loading
      try {
        const response = await getMessages(userId);
        setMessages(response);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      } finally {
        setLoading(false); // Stop loading
      }
    };
    fetchMessages();
  }, [userId]);
// ---fetch messages function end -- 
  useEffect(() => {
    // Scroll to the bottom whenever messages change
    flatListRef.current?.scrollToEnd({animated: true});
  }, [messages]);
  // Ensure scrolling happens on initial load
  useEffect(() => {
    const scrollToBottom = () => {
      flatListRef.current?.scrollToEnd({animated: true});
    };

    // Adding a slight delay to ensure FlatList is rendered
    const timer = setTimeout(scrollToBottom, 100);

    return () => clearTimeout(timer);
  }, []); // Empty dependency array ensures this runs only once

const handleSendMessage = async () => {
  if (message === '') return;

  const messageId = Date.now().toString(); // Unique ID for the message
  const messageData = {
    sender: loggedUser,
    receiver: currentChat._id,
    message,
    messageId,
  };

  if (socket) {
    socket.emit('sendMessage', messageData);
    // Clear unsent messages list if socket is connected
    setMessages(prevMessages => [...prevMessages, messageData]);
    // if (isConnected) {
    //   setUnsentMessages([]);
    // } else {
    //   setUnsentMessages(prevMessages => [...prevMessages, messageData]);
    // }
  } else {
    // setUnsentMessages(prevMessages => [...prevMessages, messageData]);
  }

  setMessage('');
};

// const handleInputChange=(e:any)=>{
// setMessage(e.target.value)
// } 
  const renderMessage = ({item}: {item: any}) => {
    const isSender = item.sender._id === userId;
    return (
      <View
        style={[
          styles.messageContainer,
          !isSender ? styles.senderContainer : styles.receiverContainer,
        ]}>
        <Text
          style={
            !isSender ? styles.receivermessageText : styles.sendermessageText
          }>
          {item.message}
        </Text>
        <View style={styles.messageInfoContainer}>
          <Text style={styles.timeText}>{/* {messageTime} */}2:40AM</Text>
          {/* {isSender && item.isRead && ( */}
          {!isSender && (
            <Image
              source={require('../assets/double-check.png')}
              style={styles.tickIcon}
            />
          )}
          {/* )} */}
        </View>
      </View>
    );
  };
console.log('bhagwan kya galti kar rhe h hum bus bhot hua bata do abb ')
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
          <FlatList
            ref={flatListRef} // Attach ref to FlatList
            data={messages}
            keyExtractor={item => item._id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messageList}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({animated: true})
            }
          />
        )}
        <View style={styles.inputContainer}>
          <View style={{width: '90%', position: 'relative'}}>
            <TouchableOpacity style={{position: 'absolute', zIndex: 50}}>
              <Image
                source={require('../assets/happiness.png')}
                style={{
                  width: 22,
                  height: 22,
                  position: 'relative',
                  zIndex: 10,
                  top: 9,
                  left: 10,
                  opacity: 0.6,
                }}
              />
            </TouchableOpacity>

            <TextInput
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
                top: 9,
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
                top: 9,
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
        {isEmojiSelectorVisible && (
          <EmojiSelector
            onEmojiSelected={handleEmojiSelect}
            style={styles.emojiSelector}
          />
        )}
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
    width: 70, // Adjust as needed
    marginRight: 10,
  },
  background: {
    flex: 1,
    resizeMode: 'cover', // or 'contain'
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
  messageContainer: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
    maxWidth: '75%',
    display: 'flex',
    flexDirection: 'row',
  },
  senderContainer: {
    alignSelf: 'flex-end',
    backgroundColor: '#dcf8c6',
    shadowColor: '#000', // Shadow color
    shadowOffset: {
      width: 0, // Horizontal offset
      height: 1, // Vertical offset
    },
    shadowOpacity: 0.2, // Shadow opacity
    shadowRadius: 1, // Shadow blur radius
    elevation: 1, // Android shadow
  },
  receiverContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    shadowColor: '#000', // Shadow color
    shadowOffset: {
      width: 0, // Horizontal offset
      height: 1, // Vertical offset
    },
    shadowOpacity: 0.2, // Shadow opacity
    shadowRadius: 1, // Shadow blur radius
    elevation: 1, // Android shadow
  },
  sendermessageText: {
    color: '#000',
  },
  receivermessageText: {
    color: '#000',
  },
  emojiSelector: {
    height: 350,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    // backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    color: '#363737',
    paddingLeft: 40,
    paddingRight: 60,
    fontSize: 20,
    borderWidth: 0.05,

    borderColor: '#363737',
    borderRadius: 35,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginRight: 10,
    backgroundColor: '#f9f9f9',
    textDecorationLine: 'none',
    shadowColor: '#000', // Shadow color
    shadowOffset: {
      width: 0, // Horizontal offset
      height: 1, // Vertical offset
    },
    shadowOpacity: 0.2, // Shadow opacity
    shadowRadius: 1, // Shadow blur radius
    elevation: 1, // Android shadow
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
    resizeMode: 'contain', // Resizes the image to maintain aspect ratio
  },
  messageInfoContainer: {
    marginTop: 5,
    paddingLeft: 8,
    display: 'flex',
    alignItems: 'flex-end',
    flexDirection: 'row',
  },
  timeText: {
    color: '#808080',
    fontSize: 12,
    marginRight: 5,
  },
  tickIcon: {
    width: 10,
    height: 10,
    marginBottom: 2,
  },
});

export default ChatWindow;
