# Quick Chat - MERN Stack

A real-time messaging application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) and Socket.io for real-time communication.

## Features

- 👥 **Contact List** - View all available users
- 💬 **Individual Chat Conversations** - Private messaging between users
- 🟢 **Online/Offline Status** - Real-time user status indicators
- ⌨️ **Typing Indicators** - See when someone is typing
- 💾 **Message Persistence** - All messages saved in MongoDB
- 📱 **Responsive Design** - Works on mobile and desktop
- 🎨 **Modern UI** - Clean and intuitive interface
- ⚡ **Real-time Updates** - Instant message delivery
- 🕐 **Message Timestamps** - See when messages were sent
- 👤 **User Avatars** - Visual representation with initials

## Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB object modeling
- **Socket.io** - Real-time communication
- **CORS** - Cross-origin resource sharing

### Frontend
- **React.js** - UI library
- **Socket.io-client** - Real-time client
- **Axios** - HTTP client
- **CSS3** - Styling with modern features

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v14 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **npm** or **yarn**

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
       cd quick-chat-app
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Set up environment variables**
   - Copy `env.example` to `.env`
   - Update the MongoDB connection string if needed:
     ```
     MONGODB_URI=mongodb://localhost:27017/chat-app
     PORT=5000
     NODE_ENV=development
     ```

## Running the Application

### Development Mode

1. **Start the backend server**
   ```bash
   npm run server
   ```
   The server will run on `http://localhost:5000`

2. **Start the React frontend** (in a new terminal)
   ```bash
   npm run client
   ```
   The client will run on `http://localhost:3000`

3. **Or run both simultaneously**
   ```bash
   npm run dev
   ```

### Production Mode

1. **Build the React app**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Enter your username and click "Start Chatting"
3. You'll see a list of all users in the sidebar
4. Click on any user to start a private conversation
5. Send messages and see real-time updates

### Features in Action

- **Contact List**: All users are displayed in the left sidebar
- **Online Status**: Green dots indicate online users
- **Private Chats**: Click any contact to start a conversation
- **Real-time Messaging**: Messages appear instantly
- **Typing Indicators**: See when someone is typing
- **Message History**: Previous conversations are loaded automatically

## API Endpoints

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user
- `PUT /api/users/:username/online` - Update user online status

### Messages
- `GET /api/messages/:sender/:receiver` - Get conversation between two users
- `POST /api/messages` - Send a new message

## Socket.io Events

### Client to Server
- `userLogin` - User logs in
- `sendMessage` - Send a message to another user
- `typing` - User starts typing
- `stopTyping` - User stops typing

### Server to Client
- `newMessage` - Receive a new message
- `messageSent` - Confirm message was sent
- `userTyping` - Another user is typing
- `userStopTyping` - Another user stopped typing
- `userStatusChange` - User online/offline status changed

## Project Structure

```
quick-chat-app/
├── client/                 # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js         # Main Quick Chat component
│   │   ├── App.css        # Modern styles
│   │   ├── index.js       # React entry point
│   │   └── index.css      # Global styles
│   └── package.json
├── server.js              # Express + Socket.io server
├── package.json           # Backend dependencies
├── env.example           # Environment variables template
├── .gitignore            # Git ignore rules
└── README.md
```

## Database Schema

### User Collection
```javascript
{
  username: String (unique),
  avatar: String,
  isOnline: Boolean,
  lastSeen: Date
}
```

### Message Collection
```javascript
{
  sender: String,
  receiver: String,
  message: String,
  timestamp: Date,
  isRead: Boolean
}
```

## Key Features Explained

### Contact List
- Displays all registered users
- Shows online/offline status with colored indicators
- Click to start a conversation

### Individual Chats
- Private conversations between two users
- Message history is preserved
- Real-time message delivery

### Online Status
- Real-time updates when users come online/offline
- Last seen timestamps for offline users
- Visual indicators in the contact list

### Typing Indicators
- Shows when someone is typing in real-time
- Animated dots for typing indication
- Automatically disappears when typing stops

## Customization

### Styling
- Modify `client/src/App.css` to change the appearance
- The app uses a modern color scheme and design patterns
- Responsive design for mobile and desktop

### Features
- Add user profile pictures by modifying the avatar system
- Implement message reactions
- Add file sharing capabilities
- Implement group chats
- Add message search functionality

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Make sure MongoDB is running locally or update the connection string
   - For MongoDB Atlas, use the connection string from your cluster

2. **Port Already in Use**
   - Change the port in `.env` file or kill the process using the port

3. **Socket.io Connection Issues**
   - Ensure the server is running before starting the client
   - Check that the Socket.io URL in `App.js` matches your server

4. **No Users Appearing**
   - Make sure multiple users have logged in
   - Check the browser console for any errors

### Performance Tips

- The app loads conversation history efficiently
- Real-time updates are optimized for performance
- Consider implementing message pagination for very long conversations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

If you encounter any issues or have questions, please open an issue on the repository. 