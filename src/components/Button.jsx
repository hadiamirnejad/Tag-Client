import React from 'react';
import { TooltipComponent } from '@syncfusion/ej2-react-popups';

const Button = ({
  icon,
  bgColor,
  color,
  bgHoverColor,
  fontSize,
  size,
  text,
  borderRadius,
  width,
  costumFunc,
  classN,
  btnDisabled,
  tooltip,
  dotColor,
  direction = 'ltr'
}) => {

  return (
    <TooltipComponent content={tooltip} position="BottomCenter" className={`${classN?classN:" "}`}>
      <button
        disabled={btnDisabled}
        type="button"
        onClick={costumFunc}
        style={{  color, borderRadius , backgroundColor: `${btnDisabled?'gray':bgColor}`, fontSize, direction}}
        className={`p-1 ${width && `w-${width}`} ${size && `text-${size}`} flex items-center justify-around gap-2 hover:drop-shadow-xl text-center shrink hover:bg-${bgHoverColor}`}
      >
        <span
          style={{ background: dotColor }}
          className="absolute inline-flex rounded-full h-2 w-2 right-2 top-2 px-3"
        />
        {icon}{text}
      </button>
    </TooltipComponent>
  );
};

export default Button;
