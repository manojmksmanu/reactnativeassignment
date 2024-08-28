import React, {useState} from 'react';
import {View, FlatList, TouchableOpacity, Button, Text} from 'react-native';
import {useAuth} from '../context/userContext';
import {Sender} from '../misc/misc';
import {forward} from '../services/authService';

const ForwarChatScreen: React.FC<{route: any; navigation: any}> = ({
  route,
  navigation,
}) => {
  const {messagesToForward, socket} = route.params;
  const [selectedChats, setSelectedChats] = useState<string[]>([]);
  const {chats, loggedUser} = useAuth();

  const handleChatSelect = (chatId: string) => {
    setSelectedChats(prevSelected => {
      if (prevSelected.includes(chatId)) {
        return prevSelected.filter(id => id !== chatId);
      } else {
        return [...prevSelected, chatId];
      }
    });
  };

  const forwardMessages = async () => {
    try {
      await Promise.all(
        selectedChats.map(async chatId => {
          await forward(chatId, messagesToForward);
          socket.emit('forwardMessage', {
            chatId,
            messages: messagesToForward,
          });
        }),
      );
      navigation.goBack();
    } catch (error) {
      console.error('Failed to forward messages', error);
    }
  };
  console.log(selectedChats.length);
  return (
    <View>
      {selectedChats.length > 0 && (
        <Button title="Forward" onPress={forwardMessages} />
      )}
      <FlatList
        data={chats}
        renderItem={({item}) => (
          <TouchableOpacity
            onPress={() => handleChatSelect(item._id)}
            style={{
              backgroundColor: selectedChats.includes(item._id)
                ? 'lightgray'
                : 'white',
              margin: 7,
              paddingLeft: 20,
              borderRadius: 10,
            }}>
            <View style={{margin: 2}}>
              <Text style={{fontSize: 20, padding: 4}}>
                {loggedUser && Sender(loggedUser, item.users)?.username}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={item => item._id}
      />
    </View>
  );
};

export default ForwarChatScreen;
