import DaumPostcode, {Address} from "react-daum-postcode";
import {Control, Controller, UseFormSetValue} from "react-hook-form";
import {memo, MouseEvent, useRef} from "react";

type props = {
  name?: string;
  maxWidth?: string;
  control?: Control<any>;
  setValue?: UseFormSetValue<any>;
  closeDaumPost?(): void;
}

const DaumPost = ({closeDaumPost, name, maxWidth, control, setValue}: props) => {
  const modalRef = useRef<HTMLDivElement>(null);

  const onModalClose = (e: MouseEvent<HTMLDivElement>) => {
    if (modalRef.current === e.target && closeDaumPost) closeDaumPost();
  };

  return (
    <div 
      className="fixed w-full h-full top-0 left-0 flex items-center justify-center bg-black/30 px-40 z-[15] animate-fadeIn max-md:px-20" 
      onClick={(e) => onModalClose(e)} 
      ref={modalRef}
    >
      <div 
        className="w-full max-h-[80vh] bg-white rounded-md shadow-[rgb(0_0_0_/_15%)_0_0_6px_0] flex flex-col items-center justify-between p-20 gap-20 relative mt-[10vh] animate-slideYMargin"
        style={{ maxWidth: maxWidth || '900px' }}
      >
        <div className="w-full flex justify-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none"
            stroke="currentColor" 
            strokeWidth="1" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            onClick={() => {
              closeDaumPost?.();
            }}
            className="absolute right-10 top-10 cursor-pointer"
          >
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
          </svg>
        </div>

        <div className="w-full overflow-auto">
          <Controller
            control={control}
            name={name || ''}
            render={({field: {onChange}}) => (
              <DaumPostcode
                onComplete={(data: Address) => {
                  setValue?.('addressNumber', data.zonecode);
                  onChange(data.address);
                }}
              />
            )}
          />
        </div>
      </div>
    </div>
  )
}

export default memo(DaumPost);
