import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { socket } from "./socket";

const ChatRoom = () => {
  const location = useLocation();
  const { username, room } = location.state || {};
  
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!username || !room) return;

    const handleReceiveMessage = (data) => {
      console.log("Received message:", data); // Add this line for debugging

      setMessages((prev) => [...prev, { ...data, type: "message" }]);
    };

    const handleUserJoined = (message) => {
      setMessages((prev) => [...prev, { system: true, message, type: "notification" }]);
    };

    const handleUserLeft = (message) => {
      setMessages((prev) => [...prev, { system: true, message, type: "notification" }]);
    };

    const handleUserTyping = (message) => {
      setIsTyping(message);
      setTimeout(() => setIsTyping(false), 2000);
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("userJoined", handleUserJoined);
    socket.on("userLeft", handleUserLeft);
    socket.on("userTyping", handleUserTyping);

    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("userJoined", handleUserJoined);
      socket.off("userLeft", handleUserLeft);
      socket.off("userTyping", handleUserTyping);
    };
  }, [username, room]);

  const handleTyping = () => {
    if (message.trim()) {
      socket.emit("typing", { room, username });
    }
  };

  const sendMessage = () => {
    if (message.trim()) {
      console.log("Sending message:", { room, message, username }); // Debugging line
      socket.emit("sendMessage", { room, message, username });
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white p-4">
      <h2 className="text-xl font-bold text-center mb-4 text-neon">Chat Room: {room}</h2>
      <div className="flex-1 overflow-y-auto border border-gray-700 p-4" style={{ maxHeight: '70vh' }}>
        {messages.map((msg, index) => {
          const isCurrentUser = msg.username === username;
          return (
            <div key={index} className={`mb-4 ${
              msg.system ? "text-gray-400 text-center" : 
              isCurrentUser ? "ml-auto max-w-[75%]" : "mr-auto max-w-[75%]"
            }`}>
              {msg.system ? (
                <i className="text-sm">{msg.message}</i>
              ) : (
                <div className={`p-3 rounded-lg ${
                  isCurrentUser ? 
                    "bg-blue-600 text-white" : 
                    "bg-gray-700 text-white"
                }`}>
                  <p className="text-sm font-semibold">{msg.username}</p>
                  <p className="break-words">{msg.message}</p>
                  <small className="text-gray-300 text-xs block mt-1">
                    {msg.timestamp}
                  </small>
                </div>
              )}
            </div>
          );
        })}
        {isTyping && (
          <div className="text-gray-400 text-sm italic">
            {isTyping}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 p-2 text-black rounded"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            handleTyping();
          }}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button 
          onClick={sendMessage} 
          className="bg-blue-500 px-4 py-2 rounded text-white hover:bg-blue-600 transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;
