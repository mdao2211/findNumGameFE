import React, { useState, useEffect } from 'react';

interface NumberButtonProps {
  number: number;
  color?: string;
  selected?: boolean;
}

const NumberButton: React.FC<NumberButtonProps> = ({ number, color, selected }) => {
  const [dataUri, setDataUri] = useState('');

  useEffect(() => {
    const canvas = document.createElement('canvas');
    // Đặt kích thước canvas theo mong muốn
    canvas.width = 60;
    canvas.height = 60;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Lấy màu dựa vào trạng thái selected, nếu không thì dùng màu mặc định
      const fillColor = color || (selected ? "blue" : "black");
      ctx.fillStyle = fillColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "32px Arial";
      ctx.fillText(number.toString(), canvas.width / 2, canvas.height / 2);
      // Chuyển canvas thành data URI PNG
      const uri = canvas.toDataURL("image/png");
      setDataUri(uri);
    }
  }, [number, color, selected]);

  return <img src={dataUri} alt="" className="w-full h-full object-contain" />;
};

export default NumberButton;
