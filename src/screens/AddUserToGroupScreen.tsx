import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Alert,
  Modal,
} from 'react-native';
import {addUserToGroupChat, getAllUsers} from '../services/chatService';
import {useAuth} from '../context/userContext';
import {ScrollView, TextInput} from 'react-native-gesture-handler';
import {useNavigation} from '@react-navigation/native';
import {getUserFirstLetter} from '../misc/misc';
import Toast from 'react-native-toast-message';

interface User {
  id: string;
  name: string;
  userType: string;
}

const AddUserToGroupScreen: React.FC = () => {
  const [searchText, setSearchText] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [addUserloading, setAddUserLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {loggedUser} = useAuth();
  const [filteredUsers, setFilteredUsers] = useState<any[] | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const {FetchChatsAgain, selectedChat, setSelectedChat} = useAuth() as {
    FetchChatsAgain: any;
    selectedChat: any;
    setSelectedChat: any;
  };
  const navigation = useNavigation();

  useEffect(() => {
    const searchUsers = () => {
      if (searchText.trim() === '') {
        setFilteredUsers(users || null);
      } else {
        const updatedUsers = users?.filter(users => {
          return users.name?.toLowerCase().includes(searchText.toLowerCase());
        });
        setFilteredUsers(updatedUsers || null);
      }
    };
    searchUsers();
  }, [searchText]);

  const handleGetUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const currentUserType = loggedUser?.userType;
      const fetchedUsers = await getAllUsers(currentUserType);
      setUsers(fetchedUsers);
      setFilteredUsers(fetchedUsers);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUserToGroup = async () => {
    setAddUserLoading(true);
    setError(null);
    try {
      const data = await addUserToGroupChat(selectedChat?._id, selectedUsers);
      console.log(data.chat);
      FetchChatsAgain();
      setSelectedChat(data.chat);
      Toast.show({
        type: 'success',
        text2: `${`new users added in ${
          selectedChat && selectedChat?.groupName
        }`}`,
      });
      navigation.goBack();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text2: `${error.message}`,
      });
      setError(error.message);
    } finally {
      FetchChatsAgain();
      setAddUserLoading(false);
    }
  };

  const handleAddUser = async (item: any) => {
    setSelectedUsers(prev => {
      if (prev.some(user => user._id === item._id)) {
        return prev.filter(user => user._id !== item._id);
      }
      return [...prev, item];
    });
  };

  useEffect(() => {
    handleGetUsers();
  }, []);

  const filterAndShowTick = (item: any) => {
    return selectedUsers.some(user => user._id === item._id);
  };
  const filterAndShowAlreadyIn = (item: any) => {
    return selectedChat.users.some((user: any) => user.user._id === item._id);
  };

  const renderItem = (item: any) => (
    <TouchableOpacity
      onPress={() => {
        !filterAndShowAlreadyIn(item) ? handleAddUser(item) : null;
      }}
      style={styles.userContainer}>
      <View style={styles.profileCircle}>
        {loggedUser ? (
          <Text style={styles.profileText}>
            {getUserFirstLetter(item?.name)}
          </Text>
        ) : null}
        {filterAndShowTick(item) && (
          <Image
            style={{
              width: 20,
              height: 20,
              position: 'absolute',
              right: -2,
              bottom: -2,
            }}
            source={require('../assets/check.png')}
          />
        )}
      </View>

      <View style={styles.userInfo}>
        <View style={styles.userHeader}>
          <View>
            <Text style={styles.username}>{item?.name}</Text>
            {loggedUser ? (
              <Text style={styles.userTypeText}>{item?.userType}</Text>
            ) : null}
          </View>

          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            {filterAndShowAlreadyIn(item) && (
              <TouchableOpacity
                style={{
                  backgroundColor: '#187afa',
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 5,
                }}>
                <Text style={{fontSize: 10, color: 'white'}}>
                  Already in group
                </Text>
              </TouchableOpacity>
            )}
            {/* {filterAndShowTick(item) ? (
              <Image
                style={{
                  width: 20,
                  height: 20,
                }}
                source={require('../assets/check-lists.png')}
              />
            ) : (
              ''
            )} */}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSelectedUser = (item: any) => {
    return (
      <TouchableOpacity
        onPress={() => handleAddUser(item)}
        style={{
          width: 60,
          display: 'flex',
          alignItems: 'center',
          marginLeft: 10,
        }}>
        <Text
          style={{
            position: 'absolute',
            zIndex: 10,
            right: 5,
            top: 5,
            color: '#187afa',
          }}>
          x
        </Text>

        <View
          style={{
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
          }}>
          {loggedUser ? (
            <Text style={styles.profileText}>
              {getUserFirstLetter(item?.name)}
            </Text>
          ) : null}
        </View>
        <Text
          style={{
            backgroundColor: 'white',
            color: 'black',
            fontSize: 10,
            textAlign: 'center',
          }}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View>
        <View style={{marginLeft: 20}}>
          {selectedChat && (
            <Text style={{color: '#187afa'}}>{selectedChat.groupName}</Text>
          )}
          <Text>Number of members in group : {selectedChat.users.length}</Text>
        </View>
      </View>
      {
        <View style={styles.searchContainer}>
          <Image style={styles.icon} source={require('../assets/search.png')} />
          <TextInput
            style={styles.input}
            placeholder="Search users..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#888"
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={{position: 'absolute', right: 10, top: 22}}
            onPress={() => setSearchText('')}>
            <Image
              style={{
                width: 20,
                height: 20,
                opacity: 0.5,
              }}
              source={require('../assets/remove.png')}
            />
          </TouchableOpacity>
        </View>
      }

      {loading ? (
        <View
          style={{
            height: '80%',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <ActivityIndicator size="large" />
          <Text style={{color: 'grey'}}>Loading Wait.....</Text>
          <Text style={{color: 'grey'}}>It depends on your internet speed</Text>
        </View>
      ) : (
        <View style={{flex: 1}}>
          {selectedUsers.length > 0 && (
            <View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: 0,
                }}>
                {selectedUsers.map(u => renderSelectedUser(u))}
              </ScrollView>
            </View>
          )}
          <View style={{flex: 1, marginTop: 10}}>
            <ScrollView
              contentContainerStyle={{
                paddingHorizontal: 10,
                paddingVertical: 10,
              }}
              showsVerticalScrollIndicator={true}
              style={{flex: 1}}>
              {filteredUsers && filteredUsers.map(user => renderItem(user))}
            </ScrollView>
          </View>
        </View>
      )}
      {error && <Text>Error: {error}</Text>}

      {selectedUsers.length > 0 && (
        <View
          style={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            position: 'absolute',
            alignItems: 'center',
            bottom: 20,
          }}>
          <TouchableOpacity
            onPress={handleAddUserToGroup}
            style={{
              backgroundColor: '#187afa',
              width: '90%',
              padding: 15,
              borderRadius: 10,
            }}>
            <Text
              style={{
                color: 'white',
                textAlign: 'center',
                fontSize: 16,
                fontWeight: 700,
              }}>
              Add new {selectedUsers.length} member in Group
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <Modal
        transparent={true}
        animationType="fade"
        visible={addUserloading}
        onRequestClose={() => {}} // Prevent closing modal manually
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.loadingText}>Processing...</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 5,
    paddingVertical: 10,
    backgroundColor: 'white',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 30,
    marginVertical: 10,
    margin: 15,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingLeft: 8,
  },
  icon: {
    marginRight: 8,
    width: 30,
    height: 30,
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
  },
  profileCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 1,
  },
  profileText: {
    fontSize: 20,
    color: '#333',
  },
  userTypeText: {
    fontSize: 12,
    color: 'grey',
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  userInfo: {
    flex: 1,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 20,
    margin: 20,
  },
  inputGroup: {
    color: '#333',
    fontSize: 20,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContent: {
    backgroundColor: '#333',
    padding: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
});

export default AddUserToGroupScreen;
