import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "./socket";

// Room list component
const RoomList = ({ rooms, onJoin }) => (
  <div className="w-full max-w-md bg-gray-800 p-4 rounded-lg mb-4">
    <h3 className="text-lg font-semibold mb-2">Available Rooms</h3>
    {rooms.length > 0 ? (
      <ul>
        {rooms.map((room) => (
          <li key={room} className="flex justify-between items-center mb-2">
            <span className="text-gray-300">{room}</span>
            <button
              onClick={() => onJoin(room)}
              className="bg-green-500 px-3 py-1 rounded text-sm"
            >
              Join
            </button>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-gray-400">No rooms available. Create one below!</p>
    )}
  </div>
);


const Home = () => {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [rooms, setRooms] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    // Get initial room list
    socket.emit("getRooms", (roomList) => {
      setRooms(roomList);
    });

    // Listen for room updates
    socket.on("roomListUpdate", (updatedRooms) => {
      setRooms(updatedRooms);
    });

    return () => {
      socket.off("roomListUpdate");
    };
  }, []);


  const joinRoom = (roomName = room) => {
    if (!username.trim()) {

      alert("Username is required!");
      return;
    }
    if (!roomName.trim()) {

      alert("Room Name is required!");
      return;
    }

    socket.emit("joinRoom", { username, room: roomName }, (response) => {
      if (response.error) {
        alert(response.error);
      } else {
        navigate(`/chat/${roomName}`, { state: { username, room: roomName } });

      }
    });
  };

  const createRoom = () => {
    if (!room.trim()) {
      alert("Please enter a room name!");
      return;
    }

    joinRoom();
  };


  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-4 text-neon">Hey Chat</h1>
      <div className="w-full max-w-md">
        <RoomList rooms={rooms} onJoin={joinRoom} />
        
        <div className="bg-gray-800 p-4 rounded-lg">
          <input
            type="text"
            placeholder="Enter Username"
            className="w-full p-2 rounded mb-2 text-black"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter Room Name"
            className="w-full p-2 rounded mb-2 text-black"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              onClick={joinRoom}
              className="flex-1 bg-blue-500 px-4 py-2 rounded text-white hover:bg-blue-600 transition-colors"
            >
              Join Room
            </button>
            <button
              onClick={createRoom}
              className="flex-1 bg-purple-500 px-4 py-2 rounded text-white hover:bg-purple-600 transition-colors"
            >
              Create Room
            </button>
          </div>
        </div>
      </div>
    </div>

  );
};

export default Home;
