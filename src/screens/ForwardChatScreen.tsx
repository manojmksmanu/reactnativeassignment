import React, {useState} from 'react';
import {View, FlatList, TouchableOpacity, Button, Text} from 'react-native';
import {useAuth} from '../context/userContext';
import {getSenderName} from '../misc/misc';
import { forward } from '../services/messageService';

const ForwarChatScreen: React.FC<{route: any; navigation: any}> = ({
  route,
  navigation,
}) => {
  const {messagesToForward, socket, loggedUserId, loggedUserName} =
    route.params;
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
    if (!loggedUser) {
      console.error('No logged in user found');
      return;
    }
    try {
      await Promise.all(
        selectedChats.map(async chatId => {
          await forward(
            chatId,
            messagesToForward,
            loggedUserId,
            loggedUserName,
          );
          socket.emit('forwardMessage', {
            chatId,
            messages: messagesToForward,
            loggedUserId: loggedUser._id,
            loggedUserName: loggedUser.name,
          });
        }),
      );
      navigation.goBack();
    } catch (error) {
      console.error('Failed to forward messages', error);
    }
  };
  return (
    <View style={{flex: 1}}>
      <FlatList
        style={{flexGrow: 1}}
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
              <Text style={{fontSize: 20, padding: 4, color: 'grey'}}>
                {loggedUser && getSenderName(loggedUser, item.users)}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={item => item._id}
      />
      <View>
        {selectedChats.length > 0 && (
          <Button title="Forward" onPress={forwardMessages} />
        )}
      </View>
    </View>
  );
};

export default ForwarChatScreen;
