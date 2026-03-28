import DatePicker from "react-datepicker";
import {ko} from 'date-fns/locale/ko';
import "react-datepicker/dist/react-datepicker.css";
import "./index.css";
import {CDatePickerHeader} from "./header";
import {CDatePickerInput} from "./input";
import {Danger} from "@/components/atoms/danger";
import {Control, Controller, UseFormSetValue} from "react-hook-form";
import {format} from "date-fns";

type props = {
  timeIntervals?: number,
  name?: string,
  control: Control<any>,
  onChange?: (dates: [Date | null, Date | null]) => void,
  setValue?: UseFormSetValue<any>,
}

const DatePickerRange = ({name, timeIntervals = 10, control, setValue, onChange: _onChange}: props) => {
  return (
    <Controller
      control={control}
      name={name || ''}
      render={({field: {onChange, value}, fieldState: {error}}) => (
        <>
          <DatePicker
            onChange={(dates: [Date | null, Date | null]) => {
              setValue?.('startDate', format(dates?.[0] || new Date(), 'yyyy-MM-dd'));
              setValue?.('endDate', format(dates?.[1] || new Date(), 'yyyy-MM-dd'));
              _onChange?.(dates);
              onChange(dates);
            }}
            startDate={value && value[0]}
            endDate={value && value[1]}
            locale={ko}
            timeIntervals={timeIntervals}
            dateFormat={'yyyy-MM-dd'}
            renderCustomHeader={({date, prevMonthButtonDisabled, nextMonthButtonDisabled, increaseMonth, decreaseMonth}: {
              date: Date,
              prevMonthButtonDisabled: boolean,
              nextMonthButtonDisabled: boolean,
              increaseMonth(): void,
              decreaseMonth(): void
            }) => (
              <CDatePickerHeader date={date}
                                 prevMonthButtonDisabled={prevMonthButtonDisabled}
                                 nextMonthButtonDisabled={nextMonthButtonDisabled}
                                 increaseMonth={increaseMonth}
                                 decreaseMonth={decreaseMonth}
              />
            )}
            customInput={<CDatePickerInput/>}
            selectsRange
            onCalendarClose={() => {
              if (!value[1]) {
                setValue?.('startDate', null);
                setValue?.('endDate', null);
                onChange([null, null]);
              }
            }}
          />

          {error && <Danger>{error.message}</Danger>}
        </>
      )}
    />
  );
}

export default DatePickerRange;
