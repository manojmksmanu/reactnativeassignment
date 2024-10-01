import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Alert,
} from 'react-native';
import {createGroupChat, getAllUsers} from '../services/chatService';
import {useAuth} from '../context/userContext';
import {ScrollView, TextInput} from 'react-native-gesture-handler';
import {useNavigation} from '@react-navigation/native'; // Import the useNavigation hook

interface User {
  id: string;
  name: string;
  userType: string;
}

const GroupCreateScreen: React.FC = () => {
  const [searchText, setSearchText] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [creteGroupLoading, setCreateGroupLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {loggedUser} = useAuth();
  const [filteredUsers, setFilteredUsers] = useState<any[] | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [showNextStep, setShowNextStep] = useState<boolean>(false);
  const [groupName, setGroupName] = useState<string>(String);
  const {FetchChatsAgain} = useAuth();
  const navigation = useNavigation(); // Initialize navigation
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

  const handleCreateGroup = async () => {
    const allUsersForGroup = [...selectedUsers, loggedUser];
    setCreateGroupLoading(true);
    setError(null);
    try {
      const data = await createGroupChat(allUsersForGroup, groupName);
      FetchChatsAgain();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setCreateGroupLoading(false);
      navigation.goBack();
    }
  };

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

  const getUserFirstLetter = (userName: any) => {
    return userName ? userName.charAt(0).toUpperCase() : '';
  };

  const filterAndShowTick = (item: any) => {
    return selectedUsers.some(user => user._id === item._id);
  };

  const renderItem = (item: any) => (
    <TouchableOpacity
      onPress={() => handleAddUser(item)}
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
            source={require('../assets/check-lists.png')}
          />
        )}
      </View>

      <View style={styles.userInfo}>
        <View style={styles.userHeader}>
          <Text style={styles.username}>{item?.name}</Text>
          {loggedUser ? (
            <Text style={styles.userTypeText}>{item?.userType}</Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSelectedUser = (item: any) => {
    return (
      <TouchableOpacity
        onPress={() => !showNextStep && handleAddUser(item)}
        style={{
          width: 60,
          display: 'flex',
          alignItems: 'center',
          marginLeft: 10,
        }}>
        {!showNextStep && (
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
        )}
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
      {!showNextStep && (
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
      )}

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
        !showNextStep && (
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
        )
      )}

      {showNextStep && (
        <View>
          {selectedUsers.length > 0 && (
            <View style={{height: 180}}>
              <ScrollView
                contentContainerStyle={{
                  paddingHorizontal: 10,
                  paddingVertical: 10,
                }}
                showsVerticalScrollIndicator={true}>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                  }}>
                  {selectedUsers.map(u => renderSelectedUser(u))}
                </View>
              </ScrollView>
            </View>
          )}
          <View>
            <View style={styles.inputContainer}>
              <Image
                style={{width: 30, height: 30}}
                source={require('../assets/membership.png')}
              />
              <TextInput
                placeholder="Enter Group Name"
                placeholderTextColor="#9E9E9E"
                value={groupName}
                onChangeText={setGroupName}
                style={styles.inputGroup}
                editable={!loading}
              />
            </View>
          </View>
        </View>
      )}

      {selectedUsers.length > 1 && !showNextStep && (
        <View style={{position: 'absolute', zIndex: 20, right: 20, bottom: 20}}>
          <TouchableOpacity
            onPress={() => setShowNextStep(!showNextStep)}
            style={{
              backgroundColor: '#187afa',
              padding: 10,
              borderRadius: 15,
            }}>
            <Image
              style={{
                width: 30,
                height: 30,
              }}
              source={require('../assets/next-button.png')}
            />
          </TouchableOpacity>
        </View>
      )}
      {selectedUsers.length > 1 && showNextStep && (
        <View style={{position: 'absolute', zIndex: 20, right: 20, bottom: 20}}>
          <TouchableOpacity
            onPress={() => setShowNextStep(!showNextStep)}
            style={{
              backgroundColor: '#187afa',
              padding: 10,
              borderRadius: 15,
              transform: [{rotate: '180deg'}],
            }}>
            <Image
              style={{
                width: 30,
                height: 30,
              }}
              source={require('../assets/next-button.png')}
            />
          </TouchableOpacity>
        </View>
      )}
      {showNextStep && groupName && groupName?.length < 5 && (
        <Text style={{textAlign: 'center'}}>
          Enter Atleast 5 Character For The Group Name
        </Text>
      )}
      {selectedUsers.length > 1 &&
        groupName &&
        groupName?.length >= 5 &&
        showNextStep && (
          <View style={{display: 'flex', justifyContent: 'center'}}>
            {!creteGroupLoading && groupName && groupName?.length >= 5 && (
              <TouchableOpacity
                onPress={handleCreateGroup}
                style={{
                  backgroundColor: '#187afa',
                  borderRadius: 10,
                  paddingHorizontal: 20,
                  marginHorizontal: 15,
                }}>
                <Text
                  style={{
                    color: 'white',
                    fontSize: 20,
                    fontWeight: '700',
                    textAlign: 'center',
                    marginVertical: 10,
                  }}>
                  Create Group
                </Text>
              </TouchableOpacity>
            )}
            {creteGroupLoading && (
              <View>
                <ActivityIndicator size="large" />
              </View>
            )}
          </View>
        )}
      {error && <Text>Error: {error}</Text>}
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
});

export default GroupCreateScreen;
