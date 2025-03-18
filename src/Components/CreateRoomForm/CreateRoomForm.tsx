// src/Components/CreateRoomForm/CreateRoomForm.tsx
import React, { useState } from "react";
import { toast } from "react-toastify";

interface CreateRoomFormProps {
  onCreateRoom: (roomName: string) => void;
}

const CreateRoomForm: React.FC<CreateRoomFormProps> = ({ onCreateRoom }) => {
  const [roomName, setRoomName] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!roomName.trim()) {
      toast.error("Vui lòng nhập tên phòng");      
      return;
    }
    onCreateRoom(roomName);
  };

  return (
    <div className="max-w-md relative flex flex-col p-4 rounded-md text-black bg-white">
      <div className="text-2xl font-bold mb-4 text-center text-[#1e0e4b]">
        Tạo phòng mới
      </div>
      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <div className="block relative">
          <label htmlFor="roomName" className="block text-gray-600 text-sm mb-2">
            Tên phòng
          </label>
          <input
            type="text"
            id="roomName"
            placeholder="Nhập tên phòng..."
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="rounded border border-gray-200 text-sm w-full p-2"
          />
        </div>
        <button
          type="submit"
          className="bg-[#7747ff] w-max m-auto px-6 py-2 rounded text-white text-sm"
        >
          Tạo phòng
        </button>
      </form>
    </div>
  );
};

export default CreateRoomForm;
