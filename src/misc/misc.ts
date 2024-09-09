interface User {
  _id: string;
  username?: string;
  name?: string;
  userType?: string;
}
interface OnlineUser {
  socketId: string;
  userId: string;
}

export const getSenderName = (loggedUser: User, chatUsers: any[]) => {
  if (chatUsers && loggedUser) {
    const sender = chatUsers.find(
      chatUser => chatUser.user?._id.toString() !== loggedUser._id.toString(),
    );

    return sender ? sender.user?.name || 'Unknown Sender' : 'Unknown Sender';
  } else {
    return 'Unknown Sender';
  }
};

export const getSendedType = (loggedUser: User, chatUsers: any[]) => {
  if (chatUsers && loggedUser) {
    const sender = chatUsers.find(
      chatUser => chatUser.user?._id.toString() !== loggedUser._id.toString(),
    );
    return sender ? sender.user?.userType || 'Unknown Type' : 'Unknown Type';
  } else {
    return 'Unknown Type';
  }
};

export const getSenderStatus = (
  loggedUser: User,
  chatUsers: any[],
  onlineUsers: OnlineUser[],
) => {
  if (chatUsers && loggedUser) {
    const sender = chatUsers.find(
      chatUser => chatUser.user?._id.toString() !== loggedUser._id.toString(),
    );

    if (sender) {
      return onlineUsers?.some(user => user.userId === sender.user?._id)
        ? 'online'
        : 'offline';
    }
  }
  return 'offline';
};
