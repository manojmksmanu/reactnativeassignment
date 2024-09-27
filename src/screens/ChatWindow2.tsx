import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  replyingMessage: any;
}
const ChatWindow2: React.FC<{route: any; navigation: any}> = ({
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
  const {loggedUser, selectedChat, socket, onlineUsers, FetchChatsAgain} =
    useAuth() as {
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
  const [sending, setSending] = useState<any[]>([]);
  const [sendingPercentage, setSendingPercentage] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [unsentMessages, setUnsentMessages] = useState([]);

  // ----socket connection--
  useEffect(() => {
    loadMessages();

    if (!socket) return;

    socket.emit('joinRoom', chatId);

    const handleReceiveMessage = (messageData: MessageData) => {
      updateMessageStatusInStorage(messageData);
      if (messageData.sender !== loggedUser._id) {
        saveMessageLocally(messageData);
      }
    };

    const handleReceiveDocuments = (messageData: MessageData) => {
      updateMessageStatusInStorage(messageData);
      if (messageData.sender !== loggedUser._id) {
        saveMessageLocally(messageData);
      }
    };

    const handleForwardMessageReceived = (newMessages: MessageData[]) => {
      console.log(newMessages, 'forward messages');
      setMessages(prevMessages => [...prevMessages, ...newMessages]);
    };

    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('receiveDocument', handleReceiveDocuments);
    socket.on('forwarMessageReceived', handleForwardMessageReceived);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('receiveDocument', handleReceiveDocuments);
      socket.off('forwarMessageReceived', handleForwardMessageReceived);
    };
  }, []);
  // --socket connection end--

  const updateMessageStatusInStorage = async (messageData: any) => {
    const storedMessages = await AsyncStorage.getItem(`messages-${chatId}`);
    if (storedMessages) {
      const messagesData = JSON.parse(storedMessages);
      const updatedMessages = messagesData.map((msg: any) =>
        msg.messageId === messageData?.messageId
          ? {...msg, ...messageData}
          : msg,
      );

      // Use function version of setMessages to avoid stale state issues
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.messageId === messageData.messageId
            ? {...msg, ...messageData}
            : msg,
        ),
      );
      await AsyncStorage.setItem(
        `messages-${chatId}`,
        JSON.stringify(updatedMessages),
      );
    }
  };

  // -----loadMessage--- 👀👀👀👀👀👀👀👀--
  const loadMessages = async () => {
    const storedMessages = await AsyncStorage.getItem(`messages-${chatId}`);
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }
    const storedUnsentMessages = await AsyncStorage.getItem(
      `unsentMessages-${chatId}`,
    );
    if (storedUnsentMessages) {
      setUnsentMessages(JSON.parse(storedUnsentMessages));
    }
  };
  // -----loadMessage--- 👀👀👀👀👀👀👀👀--end

  const saveMessageLocally = async (message: any) => {
    const updatedMessages = [...messages, message];
    setMessages(prevMessages => [...prevMessages, message]);
    await AsyncStorage.setItem(
      `messages-${chatId}`,
      JSON.stringify(updatedMessages),
    );
  };

  const checkAndSaveMessageLocally = async (message: any) => {
    const storedMessages = await AsyncStorage.getItem(`messages-${chatId}`);
    let messagesData = storedMessages ? JSON.parse(storedMessages) : [];
    const existingMessageIndex = messagesData.findIndex(
      (msg: any) => msg.messageId === message.messageId,
    );
    if (existingMessageIndex !== -1) {
      messagesData[existingMessageIndex] = {
        ...messagesData[existingMessageIndex],
        ...message,
      };
      // console.log('Message updated in local storage:', message);
    } else {
      messagesData.push(message);
      // console.log('Message saved locally:', message, 'pudh');
    }
    setMessages(messagesData);
    await AsyncStorage.setItem(
      `messages-${chatId}`,
      JSON.stringify(messagesData),
    );
  };

  // const saveUnsentMessageLocally = async (unsentMessage: any) => {
  //   const updatedUnsentMessages = [...unsentMessages, unsentMessage];
  //   setUnsentMessages(updatedUnsentMessages);
  //   await AsyncStorage.setItem(
  //     `unsentMessages-${chatId}`,
  //     JSON.stringify(updatedUnsentMessages),
  //   );
  // };

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

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await getMessages(chatId);
      const storedMessages = await AsyncStorage.getItem(`messages-${chatId}`);
      const storedMessagesData = storedMessages
        ? JSON.parse(storedMessages)
        : [];
      console.log(
        JSON.stringify(response) !== JSON.stringify(storedMessagesData),
      );
      if (JSON.stringify(response) !== JSON.stringify(storedMessagesData)) {
        console.log('set value');
        await AsyncStorage.setItem(
          `messages-${chatId}`,
          JSON.stringify(response),
        );
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [messages]);

  useEffect(() => {
    console.log(1);
    const renderMessagesonOpnen = async () => {
      await fetchMessages();
      console.log(2);
      loadMessages();
    };
    renderMessagesonOpnen();
  }, [chatId, navigation]);

  const handleSwipeLeft = (item: any) => {
    setReplyingMessage(item);
    setIsReplying(true);
  };

  const handleSwipeRight = (item: any) => {
    setReplyingMessage(item);
    setIsReplying(true);
  };

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

  const sendDocument = async () => {
    const sender = loggedUser._id;
    const senderName = loggedUser ? loggedUser.name : 'Unknown';
    const messageId = Date.now().toString();
    await openDocumentPicker(
      setSending,
      setIsSending,
      setSendingPercentage,
      checkAndSaveMessageLocally,
      chatId,
      sender,
      senderName,
      replyingMessage,
      messageId,
      socket,
    );
  };

  const sendCameraFile = async () => {
    const sender = loggedUser._id;
    const senderName = loggedUser ? loggedUser.name : 'Unknown';
    const messageId = Date.now().toString();
    await openCamera(
      setSending,
      setIsSending,
      setSendingPercentage,
      checkAndSaveMessageLocally,
      chatId,
      sender,
      senderName,
      replyingMessage,
      messageId,
      socket,
    );
  };

  const sendMessageNew = async () => {
    if (!message) return;
    setReplyingMessage('');
    setMessage('');
    const messageId = Date.now().toString();
    console.log(messageId, 'generating id');
    const newMessage = {
      chatId,
      sender: loggedUser._id,
      senderName: loggedUser ? loggedUser.name : 'Unknown',
      message,
      fileUrl: null,
      fileType: 'text',
      messageId,
      replyingMessage,
      status: 'unsent',
    };
    if (socket) {
      try {
        socket.emit('fetch', 'fetchAgain');
        socket.emit('sendMessage', newMessage);
        await saveMessageLocally(newMessage);
      } catch (err) {
        console.log(err);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* {
      loading ? (
        <ActivityIndicator
          size="large"
          color="#007bff"
          style={styles.loadingIndicator}
        />
      ) : ( */}
      <FlatList
        data={messages.slice().reverse()}
        inverted
        keyExtractor={item => item._id}
        style={{padding: 10}}
        renderItem={({item}) => {
          const isSelected = selectedMessages.some(msg => msg._id === item._id);
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
      {/* )} */}
      <View>
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
                ref={textInputRef}
                value={message}
                onChangeText={setMessage}
                placeholder="Type a message"
                placeholderTextColor="#808080"
                style={styles.input}
                multiline
              />
              <View>
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
          <TouchableOpacity onPress={sendMessageNew} style={styles.sendButton}>
            <Image
              source={require('../assets/send-message.png')}
              style={styles.image}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  backButton: {
    marginLeft: 10,
    padding: 5,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#555',
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
  sendingIndicator: {
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    padding: 10,
    marginBottom: 2,
  },
});

export default ChatWindow2;
