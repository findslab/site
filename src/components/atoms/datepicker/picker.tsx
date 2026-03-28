import {default as CDatePicker} from "react-datepicker";
import {ko} from 'date-fns/locale/ko';
import "react-datepicker/dist/react-datepicker.css";
import "./index.css";
import {CDatePickerHeader} from "./header";
import {CDatePickerInput} from "./input";
import {Control, Controller} from "react-hook-form";

type props = {
  minDate?: Date,
  maxDate?: Date,
  name: string,
  timeIntervals?: number,
  onlyTime?: boolean,
  onlyDate?: boolean,
  disabledDates?: Date[],
  control?: Control<any>,
  className?: string,
}

const DatePicker = ({minDate, maxDate, name, timeIntervals = 10, onlyTime, onlyDate, className, disabledDates, control}: props) => {
  return (
    <Controller
      control={control}
      name={name || ''}
      render={({field: {onChange, value}}) => (
        <CDatePicker
          onChange={(date: Date | null) => {
            if (!date) return;
            const utcDate = new Date(Date.UTC(
              date.getFullYear(),
              date.getMonth(),
              date.getDate(),
              date.getHours(),
              date.getMinutes()
            ));
            onChange(utcDate);
          }}
          selected={
            value
              ? typeof value === 'string'
                ? new Date(value)
                : new Date(
                  value.getUTCFullYear(),
                  value.getUTCMonth(),
                  value.getUTCDate(),
                  value.getUTCHours(),
                  value.getUTCMinutes(),
                  value.getUTCSeconds()
                )
              : null
          }
          yearDropdownItemNumber={10}
          locale={ko}
          minDate={minDate}
          maxDate={maxDate}
          timeIntervals={timeIntervals}
          showTimeSelect={!onlyDate}
          showTimeSelectOnly={onlyTime}
          excludeDates={disabledDates}
          timeInputLabel="Time"
          popperProps={{strategy: 'fixed'}}
          dateFormat={!onlyTime ? !onlyDate ? 'yyyy-MM-dd HH:mm' : 'yyyy-MM-dd' : 'HH:mm'}
          renderCustomHeader={({
                                 date,
                                 changeYear,
                                 prevMonthButtonDisabled,
                                 nextMonthButtonDisabled,
                                 increaseMonth,
                                 decreaseMonth,
                               }: {
            date: Date,
            prevMonthButtonDisabled: boolean,
            nextMonthButtonDisabled: boolean,
            increaseMonth(): void,
            decreaseMonth(): void,
            changeYear(year: number): void,
          }) => (
            <CDatePickerHeader date={date}
                               changeYear={changeYear}
                               prevMonthButtonDisabled={prevMonthButtonDisabled}
                               nextMonthButtonDisabled={nextMonthButtonDisabled}
                               increaseMonth={increaseMonth}
                               decreaseMonth={decreaseMonth}
            />
          )}
          customInput={<CDatePickerInput className={className}/>}
        />
      )}
    />
  );
}

export default DatePicker;
