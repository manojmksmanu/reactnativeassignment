import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
} from 'react-native';
import {getMessages, sendMessage} from '../services/authService';

const ChatWindow: React.FC<{route: any}> = ({route}) => {
  const {userId} = route.params;
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await getMessages(userId);
        setMessages(response);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      }
    };
    fetchMessages();
  }, [userId]);
  console.log(messages, 'reb');
  const handleSendMessage = async () => {
    try {
      await sendMessage(userId, message);
      setMessage('');
      const updatedMessages = await getMessages(userId);
      setMessages(updatedMessages);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={item => item._id}
        renderItem={({item}) => (
          <View style={styles.messageContainer}>
            <Text>
              {item.sender.username}: {item.message}
            </Text>
          </View>
        )}
      />
      <TextInput
        value={message}
        onChangeText={setMessage}
        placeholder="Type a message"
        style={styles.input}
      />
      <Button title="Send" onPress={handleSendMessage} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  messageContainer: {
    marginBottom: 10,
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 10,
    padding: 10,
  },
});

export default ChatWindow;
