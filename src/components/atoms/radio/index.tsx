import {memo, ReactNode, ChangeEvent} from "react";
import {Control, Controller} from "react-hook-form";
import {Danger} from "@/components/atoms/danger";
import clsx from "clsx";

type props = {
  children?: ReactNode,
  name?: string,
  id?: string,
  value?: any,
  theme?: RadioTheme,
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  control?: Control<any>;
  disabled?: boolean;
}

type RadioTheme = 'check' | 'radio' | 'button';

const themes: Record<RadioTheme, {
  label: string;
  before?: string;
  checked: string;
  disabled?: string;
}> = {
  check: {
    label: "cursor-pointer flex items-center justify-center w-full gap-10 text-center",
    before: "before:content-[''] before:w-[18px] before:h-[18px] before:bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2218%22%20height=%2218%22%20viewBox=%220%200%2020%2020%22%20fill=%22none%22%3E%3Crect%20x=%220.5%22%20y=%220.5%22%20width=%2219%22%20height=%2219%22%20rx=%2210%22%20stroke=%22%23D1D1D6%22/%3E%3C/svg%3E')] before:bg-no-repeat before:bg-center",
    checked: "peer-checked:before:bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2218%22%20height=%2218%22%20viewBox=%220%200%2020%2020%22%20fill=%22none%22%3E%3Crect%20width=%2220%22%20height=%2220%22%20rx=%2210%22%20fill=%22%230591FF%22/%3E%3Cpath%20d=%22M14.6666%206.79166L8.24992%2013.2083L5.33325%2010.2917%22%20stroke=%22white%22%20strokeWidth=%221.5%22%20strokeLinecap=%22round%22%20strokeLinejoin=%22round%22/%3E%3C/svg%3E')]"
  },
  radio: {
    label: "cursor-pointer flex items-center justify-center w-full gap-10 text-center",
    before: "before:content-[''] before:w-[42px] before:h-[18px] before:bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2242%22%20height=%2218%22%20viewBox=%220%200%2048%2024%22%20fill=%22none%22%3E%3Crect%20width=%2248%22%20height=%2224%22%20rx=%2212%22%20fill=%22%23D1D1D6%22%20stroke=%22%23D1D1D6%22/%3E%3Ccircle%20cx=%2212%22%20cy=%2212%22%20r=%2210%22%20fill=%22white%22/%3E%3C/svg%3E')] before:bg-no-repeat before:bg-center",
    checked: "peer-checked:before:bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2242%22%20height=%2218%22%20viewBox=%220%200%2048%2024%22%20fill=%22none%22%3E%3Crect%20width=%2248%22%20height=%2224%22%20rx=%2212%22%20fill=%22%230591FF%22/%3E%3Ccircle%20cx=%2236%22%20cy=%2212%22%20r=%2210%22%20fill=%22white%22/%3E%3C/svg%3E')]"
  },
  button: {
    label: "cursor-pointer flex items-center justify-between w-full h-base bg-white text-gray-800 border border-gray-100 px-16 py-14 rounded-lg",
    checked: "peer-checked:bg-primary peer-checked:text-white peer-checked:[&_path]:stroke-white peer-checked:[&_svg]:stroke-white",
    disabled: "peer-disabled:opacity-30"
  }
};

const Radio = ({children, name, id, disabled, value, control, onChange, theme = 'check'}: props) => {
  return (
    <Controller
      control={control}
      name={name || ''}
      defaultValue={value}
      render={({field: {onChange: _onChange, value: controlValue}, fieldState: {error}}) => (
        <>
          <div className="flex items-center justify-center text-center">
            <input
              type="radio"
              name={name}
              id={id}
              checked={value === controlValue}
              value={value}
              onChange={(e) => {
                onChange?.(e)
                _onChange(value)
              }}
              disabled={disabled}
              className={clsx("peer hidden")}
            />
            <label
              htmlFor={id}
              className={clsx(
                themes[theme].label,
                themes[theme].before,
                themes[theme].checked,
                themes[theme].disabled,
                error && "before:bg-[url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"18\" height=\"18\" viewBox=\"0 0 20 20\" fill=\"none\"%3E%3Crect x=\"0.5\" y=\"0.5\" width=\"19\" height=\"19\" rx=\"10\" stroke=\"red\"/%3E%3C/svg%3E')]"
              )}
            >
              {children}
            </label>
          </div>

          {error && <Danger>{error.message}</Danger>}
        </>
      )}
    />
  );
};

export default memo(Radio);
