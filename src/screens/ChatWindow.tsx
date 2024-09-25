import React, {useState, useEffect, useRef} from 'react';
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
import {loggeduser} from '../services/authService';
import {getMessages} from '../services/messageService';
import {sendMessage} from '../services/messageService';
import {useAuth} from '../context/userContext';
import RenderMessage from '../components/chatScreen/RenderMessage';
import {getSendedType, getSenderName, getSenderStatus} from '../misc/misc';
import {FlatList} from 'react-native-gesture-handler';
import {
  openCamera,
  openDocumentPicker,
} from '../misc/FireBaseUsedFunctions/FireBaseUsedFunctios';
interface User {
  _id: string;
  name: string;
  userType: any;
}

interface MessageData {
  chatId: string;
  sender: string;
  senderName: string;
  message: string;
  messageId: string;
  replyingMessage: any; // Replace `any` with a more specific type if possible
}

const ChatWindow: React.FC<{route: any; navigation: any}> = ({
  route,
  navigation,
}) => {
  const {chatId} = route.params;
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [replyingMessage, setReplyingMessage] = useState<any>(null);
  const [isReplying, setIsReplying] = useState<boolean>(false);
  const textInputRef = useRef<TextInput>(null);
  const {
    loggedUserId,
    loggedUser,
    selectedChat,
    socket,
    onlineUsers,
    FetchChatsAgain,
  } = useAuth() as {
    loggedUserId: string;
    loggedUser: User;
    selectedChat: any;
    socket: any;
    onlineUsers: any;
    FetchChatsAgain: any;
  };
  const [selectedMessages, setSelectedMessages] = useState<any[]>([]);
  const [forwardMode, setForwardMode] = useState<boolean>(false);
  const [currentSender, setCurrentSender] = useState<any>(null);
  // ----socket connection--
  useEffect(() => {
    // Join the chat room

    if (!socket) return;
    socket.emit('joinRoom', chatId);

    // Define message handlers
    const handleReceiveMessage = (messageData: MessageData) => {
      console.log(messageData, 'socket rec');
      if (messageData.sender !== loggedUser._id) {
        setMessages(prevMessages => [...prevMessages, messageData]);
      }
    };

    const handleForwardMessageReceived = (newMessages: MessageData[]) => {
      console.log(newMessages, 'forward messages');
      setMessages(prevMessages => [...prevMessages, ...newMessages]);
    };

    // Attach event listeners
    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('forwarMessageReceived', handleForwardMessageReceived);

    // Cleanup function to remove event listeners
    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('forwarMessageReceived', handleForwardMessageReceived);
    };
  }, []);
  // --socket connection end--
  useEffect(() => {
    console.log('Chat window rendered👌👌👌👌👌👌👌👌👌👌👌👌👌👌');
    // Rest of the useEffect logic
  }, []);

  const getUserFirstAlphabet = (userType: any) => {
    return userType ? userType.charAt(0).toUpperCase() : '';
  };
  // ----chat window header--
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
        <View style={styles.headerTitleContainer}>
          <View style={styles.profileCircle}>
            {loggedUser ? (
              <Text style={styles.profileText}>
                {getUserFirstAlphabet(
                  getSendedType(loggedUser, selectedChat.users),
                )}
              </Text>
            ) : null}
            <View style={styles.statusContainer}>
              {loggedUser &&
              getSenderStatus(
                loggedUser,
                selectedChat.users,
                onlineUsers || [],
              ) === 'online' ? (
                <View style={styles.statusDotgreen}></View>
              ) : (
                <View style={styles.statusDotgrey}></View>
              )}
            </View>
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.usernameText}>
              {loggedUser && getSenderName(loggedUser, selectedChat.users)}
            </Text>
            <Text style={styles.statusText}>
              {loggedUser &&
                getSenderStatus(loggedUser, selectedChat.users, onlineUsers)}
            </Text>
          </View>
        </View>
      ),
      headerRight: () => (
        <View style={styles.headerRightContainer}>
          <TouchableOpacity
            onPress={handleMoreOptions}
            style={styles.iconButton}>
            <Image source={require('../assets/dots.png')} style={styles.icon} />
          </TouchableOpacity>
          {selectedMessages.length > 0 && (
            <TouchableOpacity
              onPress={navigateToForwardScreen}
              style={styles.iconButton}>
              <Image
                source={require('../assets/forward-message.png')}
                style={styles.forwardIcon}
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
    if (!message.trim()) return;
    setReplyingMessage('');
    setMessage('');
    const messageId = Date.now().toString();
    const messageData = {
      chatId,
      sender: loggedUser._id,
      senderName: loggedUser ? loggedUser.name : 'Unknown',
      message,
      fileUrl: null,
      fileType: 'text',
      messageId,
      replyingMessage,
    };
    console.log('Sending Message: ', messageData);
    if (socket) {
      socket.emit('fetch', 'fetchAgain');
      socket.emit('sendMessage', messageData);
      setMessages(prevMessages => [...prevMessages, messageData]);
    }
    // Send the message to the backend
    try {
      await sendMessage(messageData);
    } catch (error) {
      console.error('Error sending message: ', error);
    }
  };
  // --send message function ends here--
  //----send message function--
  const handleSendDocuments = async (downloadURL: string, fileType: any) => {
    console.log(downloadURL, fileType);
    setReplyingMessage('');
    setMessage('');
    const messageId = Date.now().toString(); // Unique ID for the message
    const messageData = {
      chatId: chatId,
      sender: loggedUser._id,
      senderName: loggedUser ? loggedUser.name : 'Unknown',
      message: 'image',
      fileUrl: downloadURL,
      fileType,
      messageId,
      replyingMessage,
    };
    console.log(messageData);
    if (socket) {
      socket.emit('fetch', 'fetchAgain');
      socket.emit('sendMessage', messageData);
      setMessages(prevMessages => [...prevMessages, messageData]);
    }
    await sendMessage(messageData);
  };
  // --send message function ends here--

  // ----function for handleswipeLefat and swipeRight ----
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
      loggedUserId: loggedUser._id,
      loggedUsername: loggedUser.name,
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

  // here I send document to firebase and I get the url
  const sendDocument = async () => {
    await openDocumentPicker(setMessage, handleSendDocuments);
  };

  const sendCameraFile = async () => {
    await openCamera();
  };

  return (
    <ImageBackground
      source={require('../assets/57622.jpg')}
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
            data={messages.slice().reverse()}
            inverted
            keyExtractor={item => item._id}
            style={{padding: 10}}
            renderItem={({item}) => {
              const isSelected = selectedMessages.some(
                msg => msg._id === item._id,
              );
              return (
                <TouchableOpacity
                  onLongPress={() => handleLongPress(item)}
                  onPress={() => handleTap(item)}
                  style={{
                    backgroundColor: isSelected ? 'lightgray' : 'transparent',
                  }}>
                  <RenderMessage
                    item={item}
                    loggedUserId={loggedUser._id}
                    onLeftSwipe={() => handleSwipeLeft(item)}
                    onRightSwipe={() => handleSwipeRight(item)}
                  />
                </TouchableOpacity>
              );
            }}
            contentContainerStyle={{flexGrow: 0}}
          />
        
        )}
        <View>
          {/* ---Input bottom container--  */}
          <View style={styles.inputMainContainer}>
            <TouchableOpacity onPress={sendDocument}>
              <Image
                source={require('../assets/add-folder.png')}
                style={{
                  width: 28,
                  height: 28,
                  marginBottom: 6,
                  padding: 10,
                  marginRight: 5,
                }}
              />
            </TouchableOpacity>
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
                  {/* <TouchableOpacity onPress={sendDocument}>
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
                  </TouchableOpacity> */}

                  <TouchableOpacity onPress={sendCameraFile}>
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
                  </TouchableOpacity>
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
  backButton: {
    marginLeft: 10, // Adjust margin if needed
    padding: 5,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#555', // Customize icon color if needed
  },

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
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  container: {
    flex: 1,
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
    padding: 10,
    paddingTop: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: 'white',
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
    backgroundColor: '#187afa',
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
  iconButton: {
    marginLeft: 15,
    padding: 5,
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: '#555',
  },
  forwardIcon: {
    width: 30,
    height: 30,
    tintColor: '#4CAF50',
  },
  textContainer: {
    flexDirection: 'column',
  },
  statusText: {
    fontSize: 14,
    color: 'grey',
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
});

export default ChatWindow;
