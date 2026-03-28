import {useStorePopup, useStorePopupValue} from "@/store/popup";
import Button from "@/components/atoms/button";
import {memo} from "react";

const Popup = () => {
  const {show, content} = useStorePopupValue();
  const {closePopup} = useStorePopup();

  const closePopupDay = () => {
    window.localStorage.setItem('cG9wdXBUaW1l', new Date().toString());
    closePopup();
  };

  if (show) return (
    <div className="fixed w-full h-full top-0 left-0 flex items-center justify-center bg-black/30 px-40 z-[5] animate-fadeIn max-md:px-20">
      <div className="w-full max-w-[300px] max-h-[80vh] bg-white rounded-md shadow-[rgb(0_0_0_/_15%)_0_0_6px_0] flex flex-col justify-between relative mt-[10vh] animate-slideYMargin">
        <div className="p-20">
          {content}
        </div>

        <div className="flex">
          <Button onClick={closePopupDay} className="w-full rounded-none rounded-bl-md">하루 동안 보지 않기</Button>
          <Button onClick={closePopup} className="w-full rounded-none rounded-br-md">닫기</Button>
        </div>
      </div>
    </div>
  )
}

export default memo(Popup);
