interface User {
  _id: string;
  username?: string;
  // Add other properties as needed
}

export const Sender = (
  loggedUser: any | null,
  users: any | null,
): User | null => {
  // Return null if loggedUser is null or users is null
  if (!loggedUser || !users) return null;

  // Ensure users is an array before calling map
  const validUsers = Array.isArray(users) ? users : [];

  // Extract the relevant data from users if it's wrapped in a specific structure
  const extractedUsers = validUsers.map(user => user._j || user);

  // Check if loggedUser is part of the extracted users array
  const isLoggedUserInUsers = extractedUsers.some(
    user => user._id === loggedUser._id,
  );

  if (!isLoggedUserInUsers) return null;

  // Determine the sender user
  const senderUser =
    extractedUsers.find(user => user._id !== loggedUser._id) || null;

  return senderUser;
};
