import Button from "@/components/atoms/button";
import {memo, useEffect, useState} from "react";
import {alertLevels, useStoreAlert, useStoreAlertValue} from "@/store/alert";
import {CircleAlert} from "lucide-react";

const Alert = () => {
  const {show, title, level, hasClose, onSubmit} = useStoreAlertValue();
  const {closeAlert} = useStoreAlert();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!show) setIsLoading(false);
  }, [show]);

  const getAlertColor = () => {
    switch (level) {
      case alertLevels.normal:
        return "fill-green-600";
      case alertLevels.warning:
        return "fill-orange-600";
      default:
        return "fill-red-600";
    }
  };

  if (show) return (
    <div className="fixed w-full h-full top-0 left-0 flex items-center justify-center bg-black/30 px-40 z-[5] animate-fadeIn max-md:px-20">
      <div
        className="w-full max-w-[300px] max-h-[80vh] bg-white rounded-lg shadow-lg flex flex-col justify-between p-20 gap-30 relative m-[10vh_auto_auto_auto] animate-slideYMargin"
      >
        <div className="flex flex-col items-center justify-center gap-20 text-[15px]">
          <CircleAlert
            width={36}
            height={36}
            strokeWidth={1.5}
            stroke={'#fff'}
            className={getAlertColor()}
          />
          {title ? title : <br/>}
        </div>
        <div className="flex items-center justify-center gap-20">
          {hasClose && (
            <Button
              onClick={closeAlert}
              className="w-full max-w-[100px] !font-semibold !bg-gray-100 !text-gray-500"
            >
              취소
            </Button>
          )}
          <Button
            onClick={() => {
              setIsLoading(true);
              onSubmit?.();
            }}
            isPending={isLoading}
            className="w-full max-w-[100px] !font-semibold"
          >
            확인
          </Button>
        </div>
      </div>
    </div>
  );
  return null;
};

export default memo(Alert);
