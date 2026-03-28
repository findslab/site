import {memo, ReactNode} from "react";
import clsx from "clsx";

type props = {
  children?: ReactNode;
  theme?: LinkTheme;
  size?: string;
  shape?: string;
  href?: string;
}

type LinkTheme = 'normal' | 'plain';

const themes: Record<LinkTheme, string> = {
  normal: 'bg-primary text-white',
  plain: 'h-auto text-gray-600',
};

const Link = ({children, theme = 'normal', shape, size, href}: props) => {
  return (
    <a 
      className={clsx(
        "flex items-center justify-center border-0 transition-all duration-300 px-10",
        themes[theme],
        size && `h-[${size}]`,
        shape
      )}
      href={href}
    >
      {children}
    </a>
  )
}

export default memo(Link);
