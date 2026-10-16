import {memo, ReactNode} from "react";
import clsx from "clsx";
import {Spinner2} from "@/components/atoms/spinner";

type ButtonTheme = 'normal' | 'black' | 'white' | 'border' | 'underline' | 'plain';

type props = {
  children?: ReactNode;
  theme?: ButtonTheme;
  isValid?: boolean;
  isPending?: boolean;
  onClick?(): void;
  className?: string;
  disabled?: boolean;
}

const themes: Record<ButtonTheme, string> = {
  normal: 'bg-primary text-white',
  white: 'bg-white text-primary shadow-none!',
  black: 'bg-black text-white',
  border: 'border border-primary text-primary bg-white',
  underline: 'underline text-gray-700 bg-transparent',
  plain: 'text-gray-700 bg-transparent shadow-none!',
};

const Button = ({children, theme = 'normal', isValid = true, isPending, onClick, className}: props) => {
  return (
    <button
      type="button"
      className={clsx(
        "flex items-center justify-center border-0 transition-all px-10 h-base rounded-[12px] text-[19px] font-medium shadow focus:shadow-focus",
        themes[theme],
        isValid ? "opacity-100 cursor-pointer hover:opacity-80" : "opacity-30 cursor-not-allowed",
        className
      )}
      onClick={isValid && !isPending ? onClick : undefined}
      disabled={!isValid || isPending}
    >
      {isPending ? <Spinner2/> : children}
    </button>
  )
}

export default memo(Button);
