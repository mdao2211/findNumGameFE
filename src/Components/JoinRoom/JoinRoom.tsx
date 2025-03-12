// src/Components/JoinRoom/JoinRoom.tsx
import React, { useEffect, useState } from "react";
import { socket } from "../../services/socket";
import CreateRoomForm from "../CreateRoomForm/CreateRoomForm";
import { Player } from "../../types/game";

interface JoinRoomProps {
  player: Player;
  onJoin: (roomId: string) => void;
}

interface Room {
  id: string;
  name: string;
  playersCount: number;
}

const JoinRoom: React.FC<JoinRoomProps> = ({ player, onJoin }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showCreateRoomForm, setShowCreateRoomForm] = useState(false);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch("http://localhost:8080/room");
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

  const handleShowCreateRoomForm = () => {
    if (!player || !player.name || player.name.trim() === "") {
      alert("Vui lòng nhập tên của bạn");
      return;
    }
    setShowCreateRoomForm(true);
  };

  const handleCreateRoom = async (roomName: string) => {
    try {
      const response = await fetch("http://localhost:8080/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: roomName }),
      });
      if (!response.ok) {
        throw new Error("Error creating room");
      }
      const room: Room = await response.json();
      // Sử dụng room.id từ kết quả trả về để join vào phòng mới tạo
      socket.emit("joinRoom", { roomId: room.id, playerId: player.id });
      onJoin(room.id);
      setShowCreateRoomForm(false);
    } catch (error) {
      console.error("Error creating room: ", error);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    try {
      const response = await fetch(`http://localhost:8080/room/${roomId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error("Error delete room");
      }
      setRooms((prevRooms) => prevRooms.filter((room) => room.id !== roomId));
    } catch (error) {
      console.error("Error delete room: ", error);
    }
  };

  const handleJoinRoom = (roomId: string) => {
    if (player.name.trim() === "") {
      alert("Vui lòng nhập tên của bạn");
      return;
    }
    socket.emit("joinRoom", { roomId, playerId: player.id });
    onJoin(roomId);
  };

  return (
    <div className="bg-white rounded-lg p-8 shadow-xl">
      <h1 className="text-3xl font-bold text-center mb-6">
        Tham gia phòng chơi
      </h1>
      {showCreateRoomForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative bg-white rounded-3xl p-8 shadow-2xl w-full max-w-md">
            <button
              onClick={() => setShowCreateRoomForm(false)}
              className="absolute top-2 right-2 text-2xl font-bold text-gray-600 hover:text-gray-800"
            >
              &times;
            </button>
            <CreateRoomForm onCreateRoom={handleCreateRoom} />
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <button
              onClick={handleShowCreateRoomForm}
              className="w-full px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
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
                    className="flex justify-between items-center p-2 border rounded mb-2"
                  >
                    <div>
                      <span className="font-bold">{room.name}</span>
                      <span className="ml-2 text-sm text-gray-600">
                        ({room.playersCount} người)
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleJoinRoom(room.id)}
                        className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Tham gia
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(room.id)}
                        className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default JoinRoom;
