import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {getMessages, getUsers, sendMessage} from '../services/authService';
import {useNavigation, useRoute} from '@react-navigation/native';

const ChatWindow: React.FC<{route: any}> = ({route}) => {
  const navigation = useNavigation();
  const {userId} = route.params;
  const [messages, setMessages] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [currentChat, setCurrentChat] = useState<any>(null);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const flatListRef = useRef<FlatList<any>>(null); // Create ref for FlatList

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
    if (currentChat) {
      navigation.setOptions({
        title: `${currentChat.username}`, // Set the title to the username
      });
    }
  }, [navigation, currentChat]);

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
    if (message === '') {
      return null;
    }
    try {
      await sendMessage(userId, message);
      setMessage('');
      const updatedMessages = await getMessages(userId);
      setMessages(updatedMessages);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

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
            !isSender ? styles.sendermessageText : styles.receivermessageText
          }>
          {item.message}
        </Text>
      </View>
    );
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
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message"
          style={styles.input}
          multiline
        />
        <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
          <Image
            source={require('../assets/send-message.png')}
            style={styles.image}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  },
  senderContainer: {
    alignSelf: 'flex-end',
    backgroundColor: '#007bff',
  },
  receiverContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#e0e0e0',
  },
  sendermessageText: {
    color: '#fff',
  },
  receivermessageText: {
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    backgroundColor: '#f9f9f9',
  },
  sendButton: {
    backgroundColor: '#fff',
    color: 'white',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 25,
    height: 25,
    resizeMode: 'contain', // Resizes the image to maintain aspect ratio
  },
});

export default ChatWindow;
