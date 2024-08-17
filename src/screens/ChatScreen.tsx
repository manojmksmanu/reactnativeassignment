import React, {useEffect, useState} from 'react';
import {View, Text, FlatList, Button, StyleSheet} from 'react-native';
import {getUsers, getCurrentUser} from '../services/authService'; // Import getCurrentUser

const ChatScreen: React.FC<{navigation: any}> = ({navigation}) => {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const user = await getCurrentUser(); // Fetch the current user's details
        const response = await getUsers(); // Fetch users based on the backend logic
        setUsers(response);
      } catch (error) {
        console.log('Failed to fetch users:', error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <View style={styles.container}>
      <Text>Users</Text>
      <FlatList
        data={users}
        keyExtractor={item => item._id}
        renderItem={({item}) => (
          <View style={styles.userContainer}>
            <Text>{item.username}</Text>
            <Button
              title="Chat"
              onPress={() =>
                navigation.navigate('ChatWindow', {userId: item._id})
              }
            />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  userContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
});

export default ChatScreen;
