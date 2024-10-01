import React, {useEffect, useState} from 'react';
import moment from 'moment';
import {
  Image,
  Text,
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  GestureHandlerRootView,
  State,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Pdf from 'react-native-pdf'; // Add this import for PDF viewing
// import Video from 'react-native-video';
import RNFS from 'react-native-fs';
import {WebView} from 'react-native-webview';
import {check, PERMISSIONS, request, RESULTS} from 'react-native-permissions';
import {useAuth} from '../../context/userContext';
// import DocumentViewer from 'react-native-document-viewer';
const {width: SCREEN_WIDTH} = Dimensions.get('window');

const RenderMessage = ({
  item,
  loggedUserId,
  onLeftSwipe,
  onRightSwipe,
}: {
  item: any;
  loggedUserId: string;
  onLeftSwipe: any;
  onRightSwipe: any;
}) => {
  const isSender = item.sender === loggedUserId;
  const {fileType, fileUrl, message} = item;
  const translateX = useSharedValue(0);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null);
  const [selectedFileType, setSelectedFileType] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const {selectedChat} = useAuth() as {
    selectedChat: any;
  };

  const onGestureEvent = (event: PanGestureHandlerGestureEvent) => {
    if (isSender) {
      // Sender's message:
      translateX.value = Math.min(event.nativeEvent.translationX, 0); // Only move to left
    } else {
      // Receiver's message:
      translateX.value = Math.max(event.nativeEvent.translationX, 0); // Only move to right
    }
  };

  const onHandlerStateChange = (event: PanGestureHandlerGestureEvent) => {
    if (event.nativeEvent.state === State.END) {
      // Use GestureState.END for clarity
      if (isSender) {
        if (event.nativeEvent.translationX < -100) {
          translateX.value = withSpring(SCREEN_WIDTH / 2);
          onLeftSwipe(); // Trigger right swipe action
          translateX.value = withSpring(0);
        } else {
          translateX.value = withSpring(0); // Return to original position
        }
      } else {
        if (event.nativeEvent.translationX > 100) {
          translateX.value = withSpring(SCREEN_WIDTH / 2);
          onRightSwipe(); // Trigger right swipe action
          translateX.value = withSpring(0);
        } else {
          translateX.value = withSpring(0); // Return to original position
        }
      }
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{translateX: translateX.value}],
  }));

  const openFileModal = (url: string, type: string) => {
    setSelectedFileUrl(url);
    setSelectedFileType(type);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedFileUrl(null);
    setSelectedFileType(null);
  };

  const requestStoragePermission = async () => {
    console.log('Permission request triggered');
    if (Platform.OS === 'android') {
      const androidVersion = parseInt(Platform.Version.toString(), 10);

      try {
        if (androidVersion >= 33) {
          // Android 13 and above
          const mediaPermissions = [
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
          ];

          // Check if permissions are already granted
          const alreadyGranted = await Promise.all(
            mediaPermissions.map(permission =>
              PermissionsAndroid.check(permission),
            ),
          );

          const allPermissionsGranted = alreadyGranted.every(
            granted => granted,
          );

          if (allPermissionsGranted) {
            console.log('All permissions are already granted');
            return true;
          } else {
            // Request permissions if not granted
            const grantedResults = await Promise.all(
              mediaPermissions.map(permission =>
                PermissionsAndroid.request(permission),
              ),
            );

            const anyGranted = grantedResults.some(
              result => result === PermissionsAndroid.RESULTS.GRANTED,
            );

            if (anyGranted) {
              console.log('At least one media access granted');
              return true;
            } else {
              console.log('All media access denied');
              return false;
            }
          }
        } else {
          // Below Android 13
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            {
              title: 'External Storage Permission',
              message:
                'This app needs access to your external storage to upload files',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );

          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('You can send documents');
            return true;
          } else {
            console.log('Permission denied');
            return false;
          }
        }
      } catch (err) {
        console.warn('Error requesting permissions', err);
        return false;
      }
    } else if (Platform.OS === 'ios') {
      try {
        const result = await check(PERMISSIONS.IOS.PHOTO_LIBRARY);
        if (result === RESULTS.GRANTED) {
          console.log('Photo library access granted');
          return true;
        } else {
          const requestResult = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
          if (requestResult === RESULTS.GRANTED) {
            console.log('Photo library access granted');
            return true;
          } else {
            console.log('Photo library access denied');
            return false;
          }
        }
      } catch (err) {
        console.warn('Error requesting iOS permissions', err);
        return false;
      }
    }
  };

  const downloadFile = async (url: any, message: any) => {
    const permissionGranted = await requestStoragePermission();
    if (!permissionGranted) {
      console.error('Storage permission denied');
      return; // Stop further execution
    }
    const sanitizedMessage = message.replace(/\s+/g, '_'); // Replace spaces with underscores

    console.log();
    const downloadDir = RNFS.DownloadDirectoryPath; // Use the correct download directory
    const path = `${downloadDir}/${sanitizedMessage}`;
    console.log('download', path);

    const options = {
      fromUrl: url,
      toFile: path,
      progress: (res: any) => {
        const progress = res.bytesWritten / res.contentLength;
        setDownloadProgress(progress * 100); // Update progress percentage
      },
      progressDivider: 1, // Update every byte
    };

    try {
      setIsDownloading(true); // Start downloading
      const response = await RNFS.downloadFile(options).promise;
      if (response.statusCode === 200) {
        console.log('File downloaded successfully to:', path);

        // Check if file exists
        const fileExists = await RNFS.exists(path);
        console.log('File exists:', fileExists); // This should log true if the file exists
      } else {
        console.error('Download failed:', response.statusCode);
      }
      setIsDownloading(false); // Download complete

      if (response.statusCode === 200) {
        console.log('File downloaded successfully to:', path);
        // Optionally, notify the user here
      } else {
        console.error('Download failed:', response.statusCode);
      }
    } catch (error) {
      setIsDownloading(false); // Download failed
      console.error('Download error:', error);
    }
  };

  const renderRepyingMessage = (repliedMessage: any) => {
    if (!repliedMessage) return null;

    const {fileType, fileUrl, message, senderName} = repliedMessage;

    return (
      <View style={styles.renderRepyingMessage}>
        <Text style={{color: '#25d366'}}>
          {senderName ? senderName : 'You'}
        </Text>
        {fileType === 'image/png' ||
        fileType === 'image/jpeg' ||
        fileType === 'image/jpg' ? (
          <View style={{backgroundColor: 'red'}}>
            <Image
              source={{uri: fileUrl}}
              style={{width: 100, height: 100, resizeMode: 'contain'}}
            />
            <Text>{item.progress}</Text>
            <Text style={{color: 'grey'}}>{item.status}</Text>
          </View>
        ) : (
          <Text style={{color: 'grey'}}>{message}</Text>
        )}
      </View>
    );
  };

  const renderFileContent = (
    fileType: string,
    fileUrl: string,
    message: string,
    isSender: boolean,
  ) => {
    // -----Image Message----
    if (fileType.startsWith('image/')) {
      return (
        <TouchableOpacity onPress={() => openFileModal(fileUrl, fileType)}>
          <View style={{width: 200, height: 200}}>
            {item.status === 'uploading' ? (
              <View
                style={{
                  width: '100%',
                  height: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <>
                  <ActivityIndicator size="large" />
                  <Text>{item.fileName}</Text>
                </>
                {/* <Text style={{fontSize:20}} >{item.progress}</Text> */}
              </View>
            ) : fileUrl ? (
              <>
                <Image
                  source={{uri: fileUrl}}
                  style={{width: 200, height: 200, resizeMode: 'contain'}}
                />
                {/* <TouchableOpacity
                  onPress={() => downloadFile(fileUrl, message)}
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    backgroundColor: '#4CAF50',
                    padding: 10,
                    borderRadius: 5,
                  }}>
                  <Text style={{color: '#fff'}}>Download</Text>
                </TouchableOpacity> */}
                {isDownloading && (
                  <View style={{position: 'absolute', top: 10, left: 10}}>
                    <Text
                      style={{
                        color: '#fff',
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 5,
                        borderRadius: 20,
                      }}>
                      {Math.round(downloadProgress)}%
                    </Text>
                    <ActivityIndicator size="small" />
                  </View>
                )}
              </>
            ) : null}
          </View>
        </TouchableOpacity>
      );
    }

    // -----pdf message----
    if (fileType === 'application/pdf' || fileType.startsWith('application/')) {
      return (
        <TouchableOpacity onPress={() => openFileModal(fileUrl, fileType)}>
          <View
            style={{
              width: 200,
              height: 100,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            {item.status === 'uploading' ? (
              <View
                style={{
                  width: '100%',
                  height: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <ActivityIndicator size="large" />
              </View>
            ) : (
              <>
                <View>
                  <Text style={{color: 'grey', textAlign: 'center'}}>
                    {item.message}
                  </Text>
                  <Text
                    style={{color: 'blue', opacity: 0.5, textAlign: 'center'}}>
                    {item.fileType}
                  </Text>
                </View>

                {isDownloading && (
                  <View style={{position: 'absolute', top: 10, left: 10}}>
                    <Text
                      style={{
                        color: '#fff',
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 5,
                        borderRadius: 20,
                      }}>
                      {Math.round(downloadProgress)}%
                    </Text>
                    <ActivityIndicator size="small" />
                  </View>
                )}
              </>
            )}
          </View>
          {item.status === 'uploading' && (
            <>
              <Text style={{fontSize: 20}}>{item.progress}</Text>
              <Text style={styles.documentText}>{item.fileType}</Text>
            </>
          )}
        </TouchableOpacity>
      );
    }

    // ------video message ------
    if (fileType === 'video/mp4' || String(fileType).startsWith('video/')) {
      return (
        <TouchableOpacity onPress={() => openFileModal(fileUrl, fileType)}>
          <View
            style={{
              width: 200,
              height: 200,
            }}>
            {item.status === 'uploading' ? (
              <View
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <ActivityIndicator size="large" />
                <Text>{item.fileName}</Text>
              </View>
            ) : fileUrl ? (
              <>
                <WebView
                  source={{
                    html: `
              <video controls autoplay style="width:85%;height:80%;" playsinline muted="false">
                <source src="${fileUrl}" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            `,
                  }}
                  style={{width: '100%', height: '90%'}}
                  allowsInlineMediaPlayback={true}
                  javaScriptEnabled={true}
                />

                {isDownloading && (
                  <View style={{position: 'absolute', top: 10, left: 10}}>
                    <Text
                      style={{
                        color: '#fff',
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 5,
                        borderRadius: 20,
                      }}>
                      {Math.round(downloadProgress)}%
                    </Text>
                    <ActivityIndicator size="small" />
                  </View>
                )}
              </>
            ) : null}
          </View>
        </TouchableOpacity>
      );
    }

    // --------- text message ------
    if (fileType === 'text') {
      return (
        <Text
          style={
            isSender ? styles.senderMessageText : styles.receiverMessageText
          }>
          {message}
        </Text>
      );
    }

    return null; // Return null for unsupported file types
  };

  return (
    <GestureHandlerRootView>
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}>
        <Animated.View
          style={[
            styles.messageContainer,
            isSender ? styles.senderContainer : styles.receiverContainer,
            animatedStyle,
          ]}>
          {selectedChat?.chatType === 'group' && !isSender && (
            <Text
              style={{
                color: 'grey',
                backgroundColor: 'white',
                position: 'absolute',
                fontSize: 10,
                padding: 2,
                top: -7,
                paddingHorizontal: 4,
                borderRadius: 10,
              }}>
              {item.senderName}
            </Text>
          )}

          {item.replyingMessage && renderRepyingMessage(item.replyingMessage)}
          <View style={styles.message}>
            {renderFileContent(fileType, fileUrl, message, isSender)}
          </View>
          <View style={styles.messageInfoContainer}>
            <Text style={styles.timeText}>
              {moment(item.createdAt).format('hh:mm A')}
            </Text>
            {/* {isSender && (
              <Image
                source={require('../../assets/double-check.png')}
                style={styles.tickIcon}
              />
            )} */}
            {isSender && item.status === 'uploading' && (
              <Image
                source={require('../../assets/time.png')}
                style={styles.tickIcon}
              />
            )}
            {isSender && item.status === 'unsent' && (
              <Image
                source={require('../../assets/time.png')}
                style={styles.tickIcon}
              />
            )}
            {isSender && item.status === 'sent' && (
              <Image
                source={require('../../assets/check.png')}
                style={styles.tickIcon}
              />
            )}
          </View>
        </Animated.View>
      </PanGestureHandler>
      {/* Modal for viewing PDFs, images, or videos */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        onRequestClose={closeModal}>
        <View style={styles.modalContainer}>
          {selectedFileType === 'application/pdf' && selectedFileUrl ? (
            <Pdf
              trustAllCerts={false}
              scale={0.8}
              minScale={0.5}
              renderActivityIndicator={() => (
                <ActivityIndicator color="blue" size="large" />
              )}
              source={{uri: selectedFileUrl, cache: true}}
              onError={(error: any) => console.log(error)}
              style={styles.pdf}
            />
          ) : selectedFileType?.startsWith('image/') && selectedFileUrl ? (
            <Image source={{uri: selectedFileUrl}} style={styles.fullImage} />
          ) : selectedFileType?.startsWith('video/') && selectedFileUrl ? (
            <WebView
              source={{uri: selectedFileUrl}}
              style={styles.fullVideo}
              allowsInlineMediaPlayback={true}
              javaScriptEnabled={true}
            />
          ) : null}
          {isDownloading && (
            <TouchableOpacity
              onPress={closeModal}
              style={styles.modalDownloadProgress}>
              <View style={{display: 'flex', flexDirection: 'row'}}>
                <Text
                  style={{
                    color: '#fff',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 5,
                    borderRadius: 20,
                  }}>
                  {Math.round(downloadProgress)}%
                </Text>
                <ActivityIndicator size="small" />
              </View>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={closeModal}
            style={styles.modalDownloadButton}>
            {/* <Text style={styles.closeButtonText}>Close</Text> */}
            <Image
              style={styles.closeButtonText}
              source={require('../../assets/close1.png')}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => downloadFile(fileUrl, item.message)}
            style={styles.closeButton}>
            {/* <Text style={styles.closeButtonText}>Close</Text> */}
            <Image
              style={styles.closeButtonText}
              source={require('../../assets/cloud-computing.png')}
            />
          </TouchableOpacity>
        </View>
      </Modal>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    marginVertical: 5,
    padding: 8,
    borderRadius: 10,
    maxWidth: '70%',
    flexDirection: 'column',
    flexWrap: 'wrap',
  },
  message: {
    flexShrink: 1,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  messageInfoContainer: {
    marginLeft: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  timeText: {
    color: '#808080',
    fontSize: 10,
    marginRight: 3,
  },
  tickIcon: {
    width: 12,
    height: 12,
    marginLeft: 3,
  },
  senderContainer: {
    alignSelf: 'flex-end',
    backgroundColor: '#dcf8c6',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 1,
    maxWidth: '60%',
  },
  receiverContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 1,
  },
  senderMessageText: {
    color: '#000',
    fontSize: 16,
    margin: 2,
  },
  receiverMessageText: {
    color: '#000',
    fontSize: 16,
    margin: 2,
  },
  renderRepyingMessage: {
    backgroundColor: '#F3F8EF',
    borderRadius: 5,
    padding: 10,
    display: 'flex',
    flexDirection: 'column',
  },
  documentText: {
    color: '#000',
    fontSize: 16,
    margin: 2,
    marginLeft: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  pdf: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    marginTop: 20,
    padding: 5,
    backgroundColor: '#007bff',
    borderRadius: 5,
    zIndex: 1000,
    top: 10,
    right: 60,
  },
  modalDownloadButton: {
    position: 'absolute',
    marginTop: 20,
    padding: 5,
    backgroundColor: '#007bff',
    borderRadius: 5,
    zIndex: 1000,
    top: 10,
    right: 10,
  },
  modalDownloadProgress: {
    position: 'absolute',
    marginTop: 20,
    padding: 5,
    backgroundColor: '#007bff',
    borderRadius: 5,
    zIndex: 1000,
    top: 10,
    right: 110,
  },
  closeButtonText: {
    width: 25,
    height: 25,
  },
  fullImage: {
    backgroundColor: 'black',
    width: SCREEN_WIDTH,
    height: '100%',
    resizeMode: 'contain',
  },
  fullVideo: {
    backgroundColor: 'black',
    width: SCREEN_WIDTH,
    height: '100%',
  },
});

export default RenderMessage;
