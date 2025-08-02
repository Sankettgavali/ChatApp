import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import config from './config';
import './App.css';

const socket = io(config.serverUrl);

function App() {
  const [currentUser, setCurrentUser] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState({});
  const [showLogin, setShowLogin] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isLoggedIn) {
      loadUsers();
      socket.emit('userLogin', currentUser);
    }

    // Socket event listeners
    socket.on('newMessage', (message) => {
      if (selectedUser && 
          ((message.sender === selectedUser.username && message.receiver === currentUser) ||
           (message.sender === currentUser && message.receiver === selectedUser.username))) {
        setMessages(prev => [...prev, message]);
      }
    });

    socket.on('messageSent', (message) => {
      if (selectedUser && 
          ((message.sender === selectedUser.username && message.receiver === currentUser) ||
           (message.sender === currentUser && message.receiver === selectedUser.username))) {
        setMessages(prev => [...prev, message]);
      }
    });

    socket.on('userTyping', (data) => {
      if (data.sender === selectedUser?.username && data.receiver === currentUser) {
        setTypingUsers(prev => ({ ...prev, [data.sender]: true }));
      }
    });

    socket.on('userStopTyping', (data) => {
      if (data.sender === selectedUser?.username && data.receiver === currentUser) {
        setTypingUsers(prev => ({ ...prev, [data.sender]: false }));
      }
    });

    socket.on('userStatusChange', (data) => {
      setUsers(prev => prev.map(user => 
        user.username === data.username 
          ? { ...user, isOnline: data.isOnline, lastSeen: new Date() }
          : user
      ));
    });

    return () => {
      socket.off('newMessage');
      socket.off('messageSent');
      socket.off('userTyping');
      socket.off('userStopTyping');
      socket.off('userStatusChange');
    };
  }, [isLoggedIn, currentUser, selectedUser]);

  const loadUsers = async () => {
    try {
      const response = await axios.get(`${config.serverUrl}/api/users`);
      setUsers(response.data.filter(user => user.username !== currentUser));
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadMessages = async (sender, receiver) => {
    try {
      const response = await axios.get(`${config.serverUrl}/api/messages/${sender}/${receiver}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (currentUser.trim()) {
      try {
        // Try to create user (will fail if already exists, which is fine)
        await axios.post(`${config.serverUrl}/api/users`, { username: currentUser });
      } catch (error) {
        // User already exists, which is fine
      }
      
      setIsLoggedIn(true);
      setShowLogin(false);
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    loadMessages(currentUser, user.username);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && selectedUser) {
      socket.emit('sendMessage', {
        sender: currentUser,
        receiver: selectedUser.username,
        message: newMessage
      });
      setNewMessage('');
      socket.emit('stopTyping', {
        sender: currentUser,
        receiver: selectedUser.username
      });
    }
  };

  const handleTyping = () => {
    if (selectedUser) {
      socket.emit('typing', {
        sender: currentUser,
        receiver: selectedUser.username
      });
      setTimeout(() => {
        socket.emit('stopTyping', {
          sender: currentUser,
          receiver: selectedUser.username
        });
      }, 1000);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatLastSeen = (timestamp) => {
    const now = new Date();
    const lastSeen = new Date(timestamp);
    const diffInMinutes = Math.floor((now - lastSeen) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getInitials = (username) => {
    return username.charAt(0).toUpperCase();
  };

  if (showLogin) {
    return (
      <div className="login-container">
        <div className="login-box">
                     <div className="login-header">
             <h1>Quick Chat</h1>
             <p>Enter your username to start chatting</p>
           </div>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Enter your username"
              value={currentUser}
              onChange={(e) => setCurrentUser(e.target.value)}
              required
            />
            <button type="submit">Start Chatting</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="quick-chat-container">
      {/* Sidebar - Contact List */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="current-user">
            <div className="avatar">
              {getInitials(currentUser)}
            </div>
            <div className="user-info">
              <h3>{currentUser}</h3>
              <span className="status">Online</span>
            </div>
          </div>
        </div>
        
        <div className="contacts-list">
          {users.map((user) => (
            <div 
              key={user.username}
              className={`contact-item ${selectedUser?.username === user.username ? 'active' : ''}`}
              onClick={() => handleUserSelect(user)}
            >
              <div className="contact-avatar">
                {getInitials(user.username)}
                <div className={`online-indicator ${user.isOnline ? 'online' : 'offline'}`}></div>
              </div>
              <div className="contact-info">
                <h4>{user.username}</h4>
                <span className="last-seen">
                  {user.isOnline ? 'Online' : `Last seen ${formatLastSeen(user.lastSeen)}`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="chat-area">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="chat-header">
              <div className="chat-user-info">
                <div className="chat-avatar">
                  {getInitials(selectedUser.username)}
                  <div className={`online-indicator ${selectedUser.isOnline ? 'online' : 'offline'}`}></div>
                </div>
                <div>
                  <h3>{selectedUser.username}</h3>
                  <span className="status">
                    {selectedUser.isOnline ? 'Online' : `Last seen ${formatLastSeen(selectedUser.lastSeen)}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Messages Container */}
            <div className="messages-container">
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`message ${message.sender === currentUser ? 'sent' : 'received'}`}
                >
                  <div className="message-content">
                    {message.message}
                  </div>
                  <div className="message-time">
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              ))}
              {typingUsers[selectedUser.username] && (
                <div className="typing-indicator">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form className="message-input-container" onSubmit={handleSendMessage}>
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleTyping}
              />
              <button type="submit">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            </form>
          </>
        ) : (
          <div className="no-chat-selected">
                       <div className="welcome-message">
             <h2>Welcome to Quick Chat</h2>
             <p>Select a contact to start chatting</p>
           </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App; 