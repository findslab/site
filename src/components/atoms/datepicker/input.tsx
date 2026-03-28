import {useCallback, useState} from "react";
import clsx from "clsx";

type props = {
  value?: string,
  onClick?(): void
  className?: string
}

export const CDatePickerInput = ({value, onClick, className}: props) => {
  const [show, setShow] = useState(false);

  const onShow = useCallback(() => {
    if (!show && onClick) onClick();
    setShow(!show);
  }, [show]);

  return (
    <div
      className={clsx(
        "w-full flex items-center border text-base border-gray-300 shadow focus:shadow-focus rounded bg-white transition-all duration-300 px-10 min-w-[100px] text-black pr-50 whitespace-pre cursor-pointer h-base",
        "hover:border-primary",
        className
      )}
      onClick={onShow}
    >
      {value}
      <div className="absolute right-10 flex items-center justify-center cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
             stroke="#D1D1D6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
          <line x1="16" x2="16" y1="2" y2="6"></line>
          <line x1="8" x2="8" y1="2" y2="6"></line>
          <line x1="3" x2="21" y1="10" y2="10"></line>
        </svg>
      </div>
    </div>
  )
};
