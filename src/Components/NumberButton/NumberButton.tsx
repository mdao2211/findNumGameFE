import React, { useMemo } from "react";

interface NumberButtonProps {
  number: number;
  color?: string;
  selected?: boolean;
}

const NumberButton: React.FC<NumberButtonProps> = ({
  number,
  color,
  selected,
}) => {
  // Tính toán data URI bằng useMemo, chỉ thay đổi khi number, color, hoặc selected thay đổi.
  const dataUri = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 60;
    canvas.height = 60;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Chọn màu dựa vào props: ưu tiên color, nếu không có thì dựa vào trạng thái selected.
      const fillColor = color || (selected ? "blue" : "black");
      ctx.fillStyle = fillColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "32px Arial";
      ctx.fillText(number.toString(), canvas.width / 2, canvas.height / 2);
      return canvas.toDataURL("image/png");
    }
    return "";
  }, [number, color, selected]);

  return (
    <img
      src={dataUri}
      alt={`Number ${number}`}
      className="w-full h-full object-contain"
    />
  );
};

export default NumberButton;
