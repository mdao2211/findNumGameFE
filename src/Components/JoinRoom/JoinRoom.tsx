// src/Components/JoinRoom/JoinRoom.tsx
import React, { useEffect, useState } from "react";
import { socket } from "../../services/socket";

interface JoinRoomProps {
  playerName: string;
  onJoin: (roomId: string) => void;
}

interface Room {
  id: string;
  name: string;
  playersCount: number;
}

const JoinRoom: React.FC<JoinRoomProps> = ({ playerName, onJoin }) => {
  const [rooms, setRooms] = useState<Room[]>([]);

  // Lấy danh sách phòng từ API khi component mount
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch("http://localhost:5001/room");
        if (!response.ok) {
          throw new Error("Error fetching rooms");
        }
        const data: Room[] = await response.json();
        setRooms(data);
      } catch (error) {
        console.error("Error fetching rooms: ", error);
      }
    };

    fetchRooms();
  }, []);

  // Lắng nghe các sự kiện socket khi phòng được tạo hoặc tham gia thành công
  useEffect(() => {
    const roomCreatedHandler = (room: Room) => {
      onJoin(room.id);
    };

    const roomJoinedHandler = (room: Room) => {
      onJoin(room.id);
    };

    socket.on("roomCreated", roomCreatedHandler);
    socket.on("roomJoined", roomJoinedHandler);

    return () => {
      socket.off("roomCreated", roomCreatedHandler);
      socket.off("roomJoined", roomJoinedHandler);
    };
  }, [onJoin]);

  const handleCreateRoom = () => {
    if (playerName.trim() === "") {
      alert("Vui lòng nhập tên của bạn");
      return;
    }
    // Gửi yêu cầu tạo phòng cho server qua socket
    socket.emit("createRoom", { playerName });
  };

  const handleJoinRoom = (roomId: string) => {
    if (playerName.trim() === "") {
      alert("Vui lòng nhập tên của bạn");
      return;
    }
    // Gửi yêu cầu tham gia phòng cho server qua socket
    socket.emit("joinRoom", { roomId, playerName });
  };

  return (
    <div className="bg-white rounded-lg p-8 shadow-xl">
      <h1 className="text-3xl font-bold text-center mb-6">
        Tham gia phòng chơi
      </h1>
      <div className="mb-4">
        <button
          onClick={handleCreateRoom}
          className="w-full px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
          Tạo phòng mới
        </button>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Phòng đang có</h2>
        {rooms.length === 0 ? (
          <p>Không có phòng nào. Hãy tạo phòng mới!</p>
        ) : (
          <ul>
            {rooms.map((room) => (
              <li
                key={room.id}
                className="flex justify-between items-center p-2 border rounded mb-2">
                <div>
                  <span className="font-bold">{room.name}</span>
                  <span className="ml-2 text-sm text-gray-600">
                    ({room.playersCount} người)
                  </span>
                </div>
                <button
                  onClick={() => handleJoinRoom(room.id)}
                  className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Tham gia
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default JoinRoom;
