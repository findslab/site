import {memo, ReactNode} from "react";
import clsx from "clsx";

type props = {
  children?: ReactNode;
  theme?: TagTheme;
  className?: string;
  onClick?(): void;
}

type TagTheme = 'normal' | 'black' | 'red' | 'navy' | 'green' | 'orange' | 'violet' | 'gray';

const themes: Record<TagTheme, string> = {
  normal: "bg-primary text-white",
  black: "bg-black text-white",
  gray: "bg-gray-700 text-white",
  red: "bg-red-500 text-white",
  navy: "bg-blue-600 text-white",
  green: "bg-green-500 text-white",
  orange: "bg-orange-500 text-white",
  violet: "bg-purple-600 text-white",
};

const Tag = ({children, className, theme = 'normal', onClick}: props) => {
  return (
    <span
      className={clsx(
        "flex mx-auto px-8 py-6 max-w-[60px] rounded-md text-sm font-medium items-center justify-center whitespace-nowrap",
        className,
        themes[theme],
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
    >
      {children}
    </span>
  )
}

export default memo(Tag);
