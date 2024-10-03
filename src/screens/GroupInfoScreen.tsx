import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Modal,
  TextInput,
} from 'react-native';
import {useAuth} from '../context/userContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getUserFirstLetter} from '../misc/misc';
import GroupInfoProfilePhoto from '../components/smallComponents/GroupInfoProfilePhoto';
import Toast from 'react-native-toast-message';
import {removeUserFromGroup, renameGroupName} from '../services/chatService';

const GroupInfoScreen: React.FC<{route: any; navigation: any}> = ({
  route,
  navigation,
}) => {
  const {selectedChat, loggedUser, FetchChatsAgain, setSelectedChat} =
    useAuth() as {
      selectedChat: any;
      loggedUser: any;
      FetchChatsAgain: any;
      setSelectedChat: any;
    };
  const [renameGroup, setRenameGroup] = useState('');
  const [openRenameModal, setOpenRenameModal] = useState<boolean>(false);
  const [renameLoading, setRenameLoading] = useState<boolean>(false);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState(null);
  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const handleRemoveUser = async (item: any) => {
    Alert.alert(
      `Remove ${item.name}`, // Title of the alert
      `Are you sure you want to remove ${item.name} from the ${selectedChat.groupName}?`, // Message of the alert
      [
        {
          text: 'Cancel', // Text for the cancel button
          onPress: () => console.log('User not removed'), // Action for cancel
          style: 'cancel',
        },
        {
          text: 'OK', // Text for the confirm button
          onPress: () => removeUser(item), // Action for confirm
        },
      ],
      {cancelable: false}, // Prevent closing the alert by tapping outside
    );
  };

  const removeUser = async (item: any) => {
    setLoading(true);
    setError(null);
    try {
      const data = await removeUserFromGroup(selectedChat._id, item._id);
      FetchChatsAgain();
      setSelectedChat(data.chat);
      Toast.show({
        type: 'success',
        text2: `${item.name} removed from ${selectedChat.groupName}`,
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text2: `${error.message}`,
      });
      setError(error.message);
    } finally {
      FetchChatsAgain();
      setLoading(false);
    }
  };

  const handleRenameGroup = async () => {
    setRenameLoading(true);
    setError(null);
    try {
      const data = await renameGroupName(selectedChat._id, renameGroup);
      FetchChatsAgain();
      setSelectedChat(data.chat);
      Toast.show({
        type: 'success',
        text2: `New name of group is ${data.chat.groupName}`,
      });
      setOpenRenameModal(false);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text2: `${error.message}`,
      });
      setError(error.message);
    } finally {
      FetchChatsAgain();
      setRenameLoading(false);
    }
  };

  const handleAddUserToGroup = () => {
    navigation.navigate('AddUserToGroup');
  };
  const handleModalClose = () => {
    setOpenRenameModal(false);
  };
  const renderItem = (item: any) => (
    <>
      {console.log(item.name)}
      <View style={styles.userContainer}>
        <View style={styles.profileCircle}>
          {loggedUser ? (
            <Text style={styles.profileText}>
              {getUserFirstLetter(item?.name)}
            </Text>
          ) : null}
        </View>

        <View style={styles.userInfo}>
          <View style={styles.userHeader}>
            <Text style={styles.username}>{item?.name}</Text>
            {loggedUser._id !== item._id && loggedUser ? (
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 10,
                }}>
                <Text style={styles.userTypeText}>{item?.userType}</Text>
                {item.userType !== 'Super-Admin' && (
                  <TouchableOpacity onPress={() => handleRemoveUser(item)}>
                    <Image
                      style={styles.removeUser}
                      source={require('../assets/delete.png')}
                    />
                  </TouchableOpacity>
                )}
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </>
  );
  return (
    <ScrollView style={styles.container}>
      {/* ----Top Group name--  */}
      <View
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'white',
          paddingTop: 20,
          paddingBottom: 30,
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
        }}>
        {GroupInfoProfilePhoto(selectedChat.groupName)}
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            opacity: 0.8,
          }}>
          {selectedChat && (
            <Text style={{color: '#187afa', fontSize: 20}}>
              {selectedChat.groupName}
            </Text>
          )}
          <TouchableOpacity onPress={() => setOpenRenameModal(true)}>
            <Image
              style={{width: 30, height: 30}}
              source={require('../assets/edit.png')}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* -----all members of group-----  */}
      <View
        style={{
          marginTop: 10,
          backgroundColor: 'white',
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          borderRadius: 30,
        }}>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Text style={{marginTop: 25, marginLeft: 30, color: 'grey'}}>
            Total members : {selectedChat.users.length}
          </Text>
          {loading && (
            <View>
              <ActivityIndicator
                style={{marginTop: 30, marginRight: 20}}
                size="small"
              />
            </View>
          )}
        </View>
        <>
          <View
            style={[
              styles.allUserContainer,
              {maxHeight: expanded ? undefined : 200},
            ]}>
            {selectedChat &&
              selectedChat.users.map((user: any) => (
                <View key={user.user.id}>{renderItem(user.user)}</View>
              ))}
          </View>
          {selectedChat && selectedChat.users.length > 3 && (
            <TouchableOpacity
              onPress={toggleExpand}
              style={styles.showMoreButton}>
              <Text style={styles.showMoreText}>
                {expanded ? 'Show Less' : 'Show All Members'}
              </Text>
            </TouchableOpacity>
          )}
        </>
      </View>

      {/* ---add users and exit group button ----  */}
      <View
        style={{
          flex: 1,
          marginTop: 10,
          backgroundColor: 'white',
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          borderRadius: 30,
          paddingTop: 30,
          paddingBottom: 30,
          paddingHorizontal: 40,
        }}>
        <TouchableOpacity
          onPress={handleAddUserToGroup}
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            marginBottom: 20,
          }}>
          <Image
            style={{width: 25, height: 25, opacity: 0.6}}
            source={require('../assets/user.png')}
          />
          <Text style={{color: 'grey', fontSize: 18}}>Add Users</Text>
        </TouchableOpacity>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
          }}>
          <Image
            style={{width: 25, height: 25, opacity: 0.6}}
            source={require('../assets/logout.png')}
          />
          <Text style={{color: 'grey', fontSize: 18}}>Exit Group</Text>
        </View>
      </View>

      {/* ----modal for groupRename processs */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={openRenameModal}
        onRequestClose={handleModalClose} // Prevent closing modal manually
      >
        <TouchableWithoutFeedback
          onPress={() => {
            renameLoading !== true ? handleModalClose() : '';
          }}>
          <View style={styles.modalBackground}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                {!renameLoading && (
                  <View>
                    <View style={styles.inputContainer}>
                      <TextInput
                        placeholder="Enter New Group Name"
                        placeholderTextColor="grey"
                        value={renameGroup}
                        onChangeText={setRenameGroup}
                        style={styles.textInput}
                      />
                    </View>
                    {renameGroup.length < 5 && renameGroup.length > 0 && (
                      <Text>minimum 5 character</Text>
                    )}
                    {renameGroup.length >= 5 && (
                      <View>
                        <TouchableOpacity
                          onPress={handleRenameGroup}
                          style={{
                            width: '100%',
                            marginHorizontal: 2,
                            marginVertical: 4,
                            paddingHorizontal: 8,
                            backgroundColor: '#187afa',
                            borderRadius: 10,
                          }}>
                          <Text
                            style={{
                              textAlign: 'center',
                              color: 'white',
                              margin: 10,
                              fontWeight: 700,
                            }}>
                            Rename
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}

                {renameLoading && (
                  <>
                    <ActivityIndicator size="large" color="grey" />
                    <Text style={styles.loadingText}>Processing...</Text>
                  </>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  allUserContainer: {minHeight: 200, overflow: 'hidden'},
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
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
  removeUser: {
    width: 22,
    height: 22,
    opacity: 0.5,
  },
  showMoreButton: {
    marginTop: 30,
    marginLeft: 30,
    marginBottom: 30,
  },
  showMoreText: {
    color: '#007bff',
    fontSize: 14,
    fontWeight: '400',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'grey',
    marginTop: 10,
    fontSize: 16,
  },
  inputContainer: {
    borderColor: 'grey',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 2,
    // marginTop: 10,
    width: '100%', // Adjust width as per your layout
  },
  textInput: {
    color: 'grey', // Color for the entered text
    fontSize: 16,
  },
});

export default GroupInfoScreen;
