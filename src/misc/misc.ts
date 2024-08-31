interface User {
  _id: string;
  username?: string;
  // Add other properties as needed
}

export const getSenderName = (loggedUser: User, chatUsers: any[]) => {
  if (chatUsers) {
    // Filter out the loggedUser from the chat users to get the sender
    const sender = chatUsers.find(
      chatUser => chatUser.user._id.toString() !== loggedUser._id.toString(),
    );

    // Return the sender's name, or a fallback if no sender is found
    return sender ? sender.user.name : 'Unknown Sender';
  } else {
    return null;
  }
};
export const getSendedType = (loggedUser: User, chatUsers: any[]) => {
  if (chatUsers) {
    // Filter out the loggedUser from the chat users to get the sender
    const sender = chatUsers.find(
      chatUser => chatUser.user._id.toString() !== loggedUser._id.toString(),
    );

    // Return the sender's name, or a fallback if no sender is found
    return sender ? sender.user.userType : 'Unknown Type';
  } else {
    return null;
  }
};
