import {FormEvent, ReactNode} from "react";
import clsx from "clsx";

type props = {
  onSubmit?(e: FormEvent): void,
  children?: ReactNode
}

export const Form = ({onSubmit, children}: props) => {
  const onAfterSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit?.(e);
  };

  return (
    <form onSubmit={onAfterSubmit}>
      {children}
    </form>
  )
}

type FormWrapProps = {
  children: ReactNode;
  title?: string;
  className?: string;
  index?: number;
}

export const FormWrap = ({ children, title, className, index = 1 }: FormWrapProps) => {
  return (
    <div
      className={clsx(
        "flex flex-col items-center bg-white p-20 rounded shadow-[0_1px_2px_0_rgb(0_0_0_/_0.05)] opacity-0 animate-slideX [&>div]:last:border-b [&>div]:last:border-gray-200",
        className
      )}
      style={{
        animationDelay: `calc(${index} * 0.1s)`,
        animationFillMode: 'forwards',
      }}
    >
      {title && (
        <h1 className="text-md font-medium w-full pb-20 mb-20 border-b border-gray-200">
          {title}
        </h1>
      )}
      {children}
    </div>
  );
};

type FormRowProps = {
  children: ReactNode;
  className?: string;
}

export const FormRow = ({ children, className }: FormRowProps) => {
  return (
    <div className={clsx("w-full flex max-md:flex-col", className)}>
      {children}
    </div>
  );
};

type FormLabelProps = {
  children: ReactNode;
  required?: boolean;
  className?: string;
}

export const FormLabel = ({ children, required = false, className }: FormLabelProps) => {
  return (
    <span
      className={clsx(
        "w-[150px] flex items-center px-20 bg-slate-100 border-l border-r border-t border-gray-200 text-base font-medium",
        "max-md:w-full max-md:p-10",
        required && "after:content-['*'] after:pl-5 after:text-red-500",
        className
      )}
    >
      {children}
    </span>
  );
};

type FormFieldProps = {
  children: ReactNode;
  className?: string;
}

export const FormField = ({ children, className }: FormFieldProps) => {
  return (
    <div
      className={clsx(
        "flex-1 p-10 px-20 min-h-[60px] border-r border-t border-gray-200 flex flex-col justify-center text-base",
        "[&_input_,select_,label_,.react-datepicker-wrapper]:max-w-[250px]",
        "max-md:[&_input_,select_,label_,.react-datepicker-wrapper]:max-w-[unset]",
        "max-md:p-10 max-md:border-l",
        className
      )}
    >
      {children}
    </div>
  );
};
