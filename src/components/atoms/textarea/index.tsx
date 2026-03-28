import {Control, Controller} from "react-hook-form";
import {Danger} from "@/components/atoms/danger";
import {memo} from "react";
import clsx from "clsx";

type props = {
  name?: string;
  theme?: TextareaTheme;
  className?: string;
  placeholder?: string;
  control?: Control<any>,
}

type TextareaTheme = 'normal';

const themes: Record<TextareaTheme, string> = {
  normal: "text-black border border-gray-300 bg-white placeholder:text-gray-300 focus:border-primary hover:border-primary"
};

const Textarea = ({name, className, theme = 'normal', placeholder, control}: props) => {
  return (
    <Controller
      control={control}
      name={name || ''}
      render={({field: {onChange, value}, fieldState: {error}}) => (
        <>
          <textarea
            value={value}
            name={name}
            onChange={onChange}
            placeholder={placeholder}
            className={clsx(
              "rounded p-10 h-[200px] resize-none shadow transition-all focus:shadow-focus",
              className,
              themes[theme]
            )}
          />
          {error && <Danger>{error.message}</Danger>}
        </>
      )}
    />
  )
}

export default memo(Textarea);
