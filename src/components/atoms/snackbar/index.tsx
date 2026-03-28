import {memo, useEffect} from "react";
import {snackbarLevels, useStoreSnackbar, useStoreSnackbarValue} from "@/store/snackbar";
import {CircleCheck, CircleAlert, CircleX} from "lucide-react";
import clsx from "clsx";

const Snackbar = () => {
  const {show, title, level} = useStoreSnackbarValue();
  const {closeSnackbar} = useStoreSnackbar();

  useEffect(() => {
    if (show) {
      const closeTimeout = setTimeout(() => closeSnackbar(), 3000);
      return () => clearTimeout(closeTimeout);
    }
  }, [show]);

  // 레벨별 아이콘
  const getIcon = () => {
    switch (level) {
      case snackbarLevels.normal:
        return <CircleCheck className="w-20 h-20 text-green-500" strokeWidth={2} />
      case snackbarLevels.warning:
        return <CircleAlert className="w-20 h-20 text-orange-500" strokeWidth={2} />
      case snackbarLevels.danger:
        return <CircleX className="w-20 h-20 text-red-500" strokeWidth={2} />
      default:
        return <CircleCheck className="w-20 h-20 text-green-500" strokeWidth={2} />
    }
  }

  if (show) return (
    <div className="fixed top-0 left-0 right-0 z-[100] flex items-start justify-center pointer-events-none px-20">
      <div
        onClick={closeSnackbar}
        className={clsx(
          "mt-20 max-w-[420px] w-full mx-auto pointer-events-auto",
          "bg-neutral-900 rounded-lg shadow-lg ",
          "p-16 pr-14 flex items-start gap-12",
          "animate-slideInFromTop cursor-pointer",
          "hover:shadow-xl transition-shadow duration-200"
        )}
      >
        {/* 아이콘 */}
        <div className="flex-shrink-0 mt-2">
          {getIcon()}
        </div>

        {/* 메시지 */}
        <div className="flex-1 min-w-0">
          <p className="text-base font-medium text-white leading-relaxed">
            {title}
          </p>
        </div>
      </div>
    </div>
  )
  return null;
}

export default memo(Snackbar);
