import {Control, Controller} from "react-hook-form";
import {memo} from "react";
import clsx from "clsx";

type props = {
  items?: itemsTypes[];
  name?: string;
  value?: string | number;
  placeholder?: string;
  essential?: boolean;
  theme?: SelectTheme;
  onChange?(value: string | number): void;
  control?: Control<any>;
}

type itemsTypes = {
  value?: string | number,
  text?: string,
}

type SelectTheme = 'normal' | 'border';

const themes: Record<SelectTheme, string> = {
  normal: "border border-gray-300",
  border: "border border-primary"
};

const Select2 = ({items, essential, control, name, theme = 'normal', placeholder, onChange: _onChange}: props) => {
  return (
    <Controller
      control={control}
      name={name || ''}
      render={({field: {onChange, value}, fieldState: {error}}) => (
        <select
          value={value}
          name={name}
          className={clsx(
            "px-10 pr-36 py-8 rounded-md cursor-pointer appearance-none bg-white outline-none transition-all shadow hover:border-primary focus:shadow-focus h-base text-base",
            "bg-[url('data:image/svg+xml,%3csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2218%22%20height=%2218%22%20viewBox=%220%200%2024%2024%22%20fill=%22none%22%20stroke=%22currentColor%22%20stroke-width=%221%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22%3e%3cpath%20d=%22m6%209%206%206%206-6%22/%3e%3c/svg%3e')] bg-no-repeat bg-[right_8px_center] bg-[length:1.5em_1.5em]",
            themes[theme],
            !essential && (value === '' || value === undefined) ? "text-gray-800" : "text-black",
            error && "border-red-500"
          )}
          onChange={(e) => {
            onChange(e);
            _onChange?.(e.target.value);
          }}
        >
          {!essential && <option value={''}> {placeholder || '선택'} </option>}
          {items && items.map((v, index) => (
            <option key={index} value={v.value}> {v.text} </option>
          ))}
        </select>
      )}
    />
  )
}

export default memo(Select2);
