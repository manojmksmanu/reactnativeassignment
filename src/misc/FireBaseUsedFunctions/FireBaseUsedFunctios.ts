import {launchCamera, CameraOptions} from 'react-native-image-picker'; //👀
import DocumentPicker from 'react-native-document-picker';
import storage from '@react-native-firebase/storage';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {Alert, PermissionsAndroid, Platform, Linking} from 'react-native';
import mime from 'react-native-mime-types';
import Toast from 'react-native-toast-message';
import RNFS from 'react-native-fs';
import {connect} from 'socket.io-client';
const getFileTypeFromUri = (uri: string): string => {
  // Check if the URI has a file extension
  const extension = uri.split('.').pop()?.toLowerCase();

  // If extension exists, look up the MIME type
  if (extension) {
    const mimeType = mime.lookup(extension);
    if (mimeType) {
      return mimeType;
    }
  }

  // If no valid MIME type found, return 'unknown'
  return 'unknown';
};
const requestExternalStoragePermission = async () => {
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

        const allPermissionsGranted = alreadyGranted.every(granted => granted);

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
const getRealPathFromUri = async (
  uri: string,
  fileType: any,
): Promise<string | null> => {
  console.log(uri, 'uri');
  if (Platform.OS === 'android') {
    try {
      // Read the file as base64
      const fileData = await RNFS.readFile(uri, 'base64');

      // Determine the MIME type
      // const fileType = await getFileTypeFromUri(uri); // Ensure this function returns a valid MIME type
      const extension = mime.extension(fileType) || 'unknown'; // Default to 'unknown' if no extension found

      // Generate a unique name for the file
      const newFilePath = `${
        RNFS.DocumentDirectoryPath
      }/${new Date().getTime()}.${extension}`;

      // Write the base64 data to the Document Directory
      await RNFS.writeFile(newFilePath, fileData, 'base64');
      return newFilePath;
    } catch (error) {
      console.error('Error resolving URI:', error);
      return null;
    }
  } else if (Platform.OS === 'ios') {
    // For iOS, directly return the URI without the file:// prefix
    return uri.replace('file://', '');
  }
  return null;
};
export const openDocumentPicker = async (
  setSending: any,
  setIsSending: React.Dispatch<React.SetStateAction<boolean>>,
  setSendingPercentage: any,
  checkAndSaveMessageLocally: any,
  chatId: any,
  sender: string,
  senderName: string,
  replyingMessage: any,
  messageId: any,
  socket: any,
) => {
  const hasPermission = await requestExternalStoragePermission();
  console.log('Document permission is enabled:', hasPermission);

  if (hasPermission) {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });
      // Since res is an array, we access the first item
      const document = result[0];

      // Log the document details
      console.log('Document picked:', document);

      // Extract the required details
      const documentDetails = {
        name: document.name,
        type: document.type,
        uri: document.uri,
        size: document.size,
      };
      console.log(documentDetails, 'name');
      const documentUri = result[0]?.uri;
      const fileName = result[0]?.name;
      console.log('Document URI:', documentUri);
      console.log('File Name:', fileName);
      if (documentUri && fileName) {
        const fileType = documentDetails?.type;
        const decodedUri = await getRealPathFromUri(documentUri, fileType);
        console.log(decodedUri, 'decode uri');
        if (decodedUri) {
          console.log(fileType, 'file type');
          // Upload file to Firebase
          await uploadFileToFirebase(
            decodedUri,
            fileType,
            fileName,
            setSending,
            setIsSending,
            setSendingPercentage,
            checkAndSaveMessageLocally,
            chatId,
            sender,
            senderName,
            replyingMessage,
            messageId,
            socket,
          );
        } else {
          console.warn('Failed to resolve URI to a file path');
        }
      } else {
        console.warn('No document URI or file name found');
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User canceled document picker');
      } else {
        console.log('Error picking document:', err);
      }
    }
  } else {
    console.log('Permission denied');
  }
};

const requestCameraPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const permissionStatus = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.CAMERA,
      );

      if (permissionStatus) {
        console.log('Camera permission already granted');
        return true;
      }

      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Cool Photo App Camera Permission',
          message:
            'Cool Photo App needs access to your camera so you can take awesome pictures.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the camera');
        return true;
      } else {
        console.log('Camera permission denied');
        return false;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  } else if (Platform.OS === 'ios') {
    try {
      const result = await check(PERMISSIONS.IOS.CAMERA);

      if (result === RESULTS.GRANTED) {
        console.log('Camera permission already granted on iOS');
        return true;
      }

      const requestResult = await request(PERMISSIONS.IOS.CAMERA);
      if (requestResult === RESULTS.GRANTED) {
        console.log('You can use the camera on iOS');
        return true;
      } else {
        console.log('Camera permission denied on iOS');
        return false;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
};

export const openCamera = async (
  setSending: any,
  setIsSending: React.Dispatch<React.SetStateAction<boolean>>,
  setSendingPercentage: any,
  checkAndSaveMessageLocally: any,
  chatId: any,
  sender: string,
  senderName: string,
  replyingMessage: any,
  messageId: any,
  socket: any,
) => {
  const hasPermission = await requestCameraPermission();
  console.log('Camera permission status:', hasPermission);
  if (hasPermission) {
    const options: CameraOptions = {
      mediaType: 'photo',
      saveToPhotos: true,
    };
    try {
      const result = await launchCamera(options);
      console.log(result, 'data');
      if (result.assets && result.assets.length > 0) {
        const decodedUri = result.assets[0].uri;
        const fileType = result.assets[0].type || 'image/jpeg'; // Get file type
        const fileName = result.assets[0].fileName || 'image_upload.jpg';
        if (decodedUri) {
          // Upload the captured photo to Firebase
          await uploadFileToFirebase(
            decodedUri,
            fileType,
            fileName, // Pass the fileName to display in the message
            setSending,
            setIsSending,
            setSendingPercentage,
            checkAndSaveMessageLocally,
            chatId,
            sender,
            senderName,
            replyingMessage,
            messageId,
            socket,
          );
        }
      }
    } catch (error) {
      console.error('Error opening camera:', error);
    }
  } else {
    console.log('Camera permission denied');
  }
};

const uploadFileToFirebase = async (
  fileUri: string,
  fileType: any,
  fileName: string,
  setSending: any,
  setIsSending: React.Dispatch<React.SetStateAction<boolean>>,
  setSendingPercentage: any,
  checkAndSaveMessageLocally: any,
  chatId: any,
  sender: string,
  senderName: string,
  replyingMessage: any,
  messageId: any,
  socket: any,
) => {
  const reference = storage().ref(`/uploads/${fileName}`);

  const uploadTask = reference.putFile(fileUri);

  // Store the message in local state with an 'unsent' status
  const tempMessage = {
    chatId,
    sender,
    senderName,
    message: fileName,
    fileUrl: '',
    fileType,
    messageId,
    replyingMessage,
    status: 'uploading',
  };

  // Check and save the temp message locally
  checkAndSaveMessageLocally(tempMessage);

  uploadTask.on(
    'state_changed',
    snapshot => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      setSendingPercentage(`${progress.toFixed(2)}`);
      setSending(fileName);
      setIsSending(true);
    },
    async error => {
      console.error('Error uploading file:', error);
      Toast.show({type: 'error', text1: `Upload failed: ${error.message}`});
      setIsSending(false);
    },
    async () => {
      try {
        const downloadURL = await reference.getDownloadURL();
        const newMessage = {
          ...tempMessage,
          fileUrl: downloadURL,
          status: 'sent',
        };

        // Emit the message after successful upload
        if (socket) {
          socket.emit('sendDocument', newMessage);
          await checkAndSaveMessageLocally(newMessage);
        }

        setIsSending(false);
        setSending('');
      } catch (error: any) {
        console.error('Error getting download URL:', error);
        Toast.show({
          type: 'error',
          text1: `Failed to retrieve URL: ${error.message}`,
        });
        setIsSending(false);
      }
    },
  );
};
