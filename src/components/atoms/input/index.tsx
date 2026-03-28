import {ChangeEvent, KeyboardEvent, memo, useState} from "react";
import {Danger} from "@/components/atoms/danger";
import {Control, Controller} from "react-hook-form";
import {Eye} from 'lucide-react';
import clsx from "clsx";

type props = {
  theme?: InputTheme;
  placeholder?: string;
  disabled?: boolean;
  type?: string;
  maxLength?: number;
  min?: number;
  max?: number;
  name?: string;
  className?: string;
  control?: Control<any>;
  onKeyDown?(): void;
  onChange?(): void;
}

type InputTheme = 'normal' | 'white' | 'border' | 'borderBottom' | 'plain';

const themes: Record<InputTheme, string> = {
  normal: "border border-gray-300 focus:border-primary hover:border-primary",
  white: "border border-white bg-white text-black",
  border: "border border-primary focus:border-primary",
  borderBottom: "border-0 rounded-none bg-primary text-white border-b-2 border-white focus:border-white placeholder:text-white",
  plain: "border-0 bg-transparent"
};

const Input = ({
                 className,
                 type,
                 max,
                 min,
                 theme = 'normal',
                 placeholder,
                 control,
                 name,
                 disabled,
                 maxLength,
                 onKeyDown,
                 onChange: _onChange
               }: props) => {
  const [isViewPassword, setIsViewPassword] = useState(false);

  const onAfterChange = (e: ChangeEvent<HTMLInputElement>, onChange: (value: string | number) => void) => {
    let value = e.target.value;

    if (type === 'number') {
      value = value.replace(/[^0-9.]/g, '');

      const dotCount = (value.match(/\./g) || []).length;
      if (dotCount > 1) value = value.replace(/\.+$/, '');

      if (max && Number(value) >= max) value = max.toString();
      if (min && Number(value) >= min) value = min.toString();
    }
    if (maxLength) value = value.substring(0, maxLength);
    e.target.value = value;

    _onChange?.();
    onChange(value);
  };

  const onAfterKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.keyCode === 13) onKeyDown?.();
  };

  return (
    <Controller
      control={control}
      name={name || ''}
      render={({field: {onChange, value}, fieldState: {error}}) => (
        <div className={'w-full relative'}>
          <input
            type={type === "password" ? isViewPassword ? "text" : "password" : type}
            value={value ?? ''}
            disabled={disabled}
            name={name}
            placeholder={placeholder}
            onKeyDown={onAfterKeyDown}
            onChange={(e) => {onAfterChange(e, onChange)}}
            onWheel={(e) => (e.target as HTMLElement).blur()}
            inputMode={type === "number" ? "numeric" : "text"}
            className={clsx(
              "w-full py-10 px-15 transition-all shadow focus:shadow-focus h-base text-base rounded-4xl",
              className,
              themes[theme],
              error && "border-red-500 bg-red-50 placeholder:text-red-500"
            )}
          />

          {type === 'password' && (
            <Eye
              width={18}
              height={18}
              stroke="#D1D1D6"
              strokeWidth={1.5}
              onClick={() => setIsViewPassword((prev) => !prev)}
              className="absolute right-10 top-10 cursor-pointer"
            />
          )}

          {error && <Danger>{error.message}</Danger>}
        </div>
      )}
    />
  )
};

export default memo(Input);
