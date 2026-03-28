import clsx from "clsx";
import {LoaderCircle} from "lucide-react";

interface SpinnerProps {
  className?: string;
}

export const Spinner1 = ({ className }: SpinnerProps) => (
  <div className={clsx('mx-auto mt-20', className)}>
    <LoaderCircle className={'animate-spin stroke-gray-400'} size={32} strokeWidth={1.5}></LoaderCircle>
  </div>
)

export const Spinner2 = ({ className }: SpinnerProps) => (
  <div className={clsx('mx-auto', className)}>
    <LoaderCircle className={'animate-spin stroke-white'} size={22} strokeWidth={1.5}></LoaderCircle>
  </div>
)

export const Spinner3 = ({className}: SpinnerProps) => (
  <div className={clsx("flex items-center justify-center gap-10 mt-10", className)}>
    <div className="w-14 h-14 bg-white rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
    <div className="w-14 h-14 bg-white rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
    <div className="w-14 h-14 bg-white rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
  </div>
);
