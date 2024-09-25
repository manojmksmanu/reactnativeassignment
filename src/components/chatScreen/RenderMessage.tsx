import React, {useState} from 'react';
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
  const [selectedImage, setSelectedImage] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  // Gesture handler for pan gestures
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

  const openFullImage = (url: any) => {
    setSelectedImage(url);
    setModalVisible(true);
  };

  const renderFileContent = (
    fileType: string,
    fileUrl: string,
    message: string,
    isSender: boolean,
  ) => {
    if (
      fileType === 'image/png' ||
      fileType === 'image/jpeg' ||
      fileType === 'image/jpg'
    ) {
      return (
        <TouchableOpacity>
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
                <TouchableOpacity
                  onPress={() => downloadFile(fileUrl, message)}
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 10,
                    borderRadius: 5,
                  }}>
                  <Text style={{color: '#fff'}}>Download</Text>
                </TouchableOpacity>
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

    if (fileType === 'application/pdf') {
      return (
        <TouchableOpacity>
          <View style={{width: 200, height: 100, padding: 40}}>
            {item.status === 'uploading' ? (
              <View
                style={{
                  width: '100%',
                  height: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <ActivityIndicator size="large" />
                {/* <Text style={{fontSize:20}} >{item.progress}</Text> */}
              </View>
            ) : (
              <>
                <Text style={{color: 'grey', textAlign: 'center'}}>
                  {item.message}
                </Text>
                <TouchableOpacity
                  onPress={() => downloadFile(fileUrl, item.fileName)}
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 10,
                    borderRadius: 5,
                  }}>
                  <Text style={{color: '#fff'}}>Download</Text>
                </TouchableOpacity>
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

    // ------video message -----
    // if (fileType === 'video/mp4' || String(fileType).startsWith('video/')) {
    //   return (
    //     <TouchableOpacity onPress={() => openFile(fileUrl, fileType)}>
    //       <View style={{width: 200, height: 200}}>
    //         {item.status === 'uploading' ? (
    //           <View
    //             style={{
    //               width: '100%',
    //               height: '100%',
    //               justifyContent: 'center',
    //               alignItems: 'center',
    //             }}>
    //             <ActivityIndicator size="large" />
    //             <Text>{item.fileName}</Text>
    //           </View>
    //         ) : fileUrl ? (
    //           <>
    //             <Video
    //               source={{uri: fileUrl}} // The video file URL
    //               style={{width: '100%', height: '100%'}}
    //               resizeMode="contain"
    //               controls={true} // Show video controls
    //             />
    //             <TouchableOpacity
    //               onPress={() => downloadFile(fileUrl, item.fileName)}
    //               style={{
    //                 position: 'absolute',
    //                 top: 10,
    //                 right: 10,
    //                 backgroundColor: 'rgba(0, 0, 0, 0.8)',
    //                 padding: 10,
    //                 borderRadius: 5,
    //               }}>
    //               <Text style={{color: '#fff'}}>Download</Text>
    //             </TouchableOpacity>
    //             {isDownloading && (
    //               <View style={{position: 'absolute', top: 10, left: 10}}>
    //                 <Text
    //                   style={{
    //                     color: '#fff',
    //                     backgroundColor: 'rgba(0, 0, 0, 0.8)',
    //                     padding: 5,
    //                     borderRadius: 20,
    //                   }}>
    //                   {Math.round(downloadProgress)}%
    //                 </Text>
    //                 <ActivityIndicator size="small" />
    //               </View>
    //             )}
    //           </>
    //         ) : null}
    //       </View>
    //     </TouchableOpacity>
    //   );
    // }

    // --------- text message ---
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

  const downloadFile = async (url: any, fileName: any) => {
    const path = `${RNFS.DocumentDirectoryPath}/${fileName}`;

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

  const openFile = (fileUrl: string, fileType: string) => {
    if (fileType === 'application/pdf') {
      setModalVisible(true);
    } else {
      // Handle other file types if needed
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

      {/* Modal for viewing documents */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <Pdf
            source={{uri: fileUrl, cache: true}}
            onLoadComplete={(numberOfPages: number) => {
              console.log(`number of pages: ${numberOfPages}`);
            }}
            onPageChanged={(page: number) => {
              console.log(`current page: ${page}`);
            }}
            onError={(error: any) => {
              console.log(error);
            }}
            onPressLink={(uri: string) => {
              console.log(`Link pressed: ${uri}`);
            }}
            style={styles.pdf}
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}>
            <Text style={styles.closeButtonText}>Close</Text>
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
    flexDirection: 'column', // Keep the content in a row
    flexWrap: 'wrap', // Allow wrapping to handle longer texts
  },
  message: {
    flexShrink: 1, // Allow message text to shrink when necessary
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  messageInfoContainer: {
    marginLeft: 5, // Space between the message and the info container
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  timeText: {
    color: '#808080',
    fontSize: 10,
    marginRight: 3, // Slight margin for separation
  },
  tickIcon: {
    width: 12,
    height: 12,
    marginLeft: 3, // Slight margin for separation
  },
  senderContainer: {
    alignSelf: 'flex-end',
    backgroundColor: '#dcf8c6',
    shadowColor: '#000', // Shadow color
    shadowOffset: {
      width: 0, // Horizontal offset
      height: 1, // Vertical offset
    },
    shadowOpacity: 0.2, // Shadow opacity
    shadowRadius: 1, // Shadow blur radius
    elevation: 1, // Android shadow
    maxWidth: '60%',
  },
  receiverContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    shadowColor: '#000', // Shadow color
    shadowOffset: {
      width: 0, // Horizontal offset
      height: 1, // Vertical offset
    },
    shadowOpacity: 0.2, // Shadow opacity
    shadowRadius: 1, // Shadow blur radius
    elevation: 1, // Android shadow
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
    width: SCREEN_WIDTH - 40,
    height: 600,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default RenderMessage;
