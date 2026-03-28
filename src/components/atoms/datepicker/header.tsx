type props = {
  date: Date,
  prevMonthButtonDisabled: boolean,
  nextMonthButtonDisabled: boolean,
  increaseMonth(): void,
  decreaseMonth(): void
  changeYear?(year: number): void,
}

export const CDatePickerHeader = ({date, prevMonthButtonDisabled, nextMonthButtonDisabled, decreaseMonth, increaseMonth, changeYear}: props) => {
  return (
    <div className="flex px-10 pb-10 text-[14px] justify-between items-center">
      <div className="flex">
        {
          changeYear &&
          <span onClick={() => changeYear(date.getFullYear() - 1)} className="cursor-pointer p-3 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m11 17-5-5 5-5"/>
              <path d="m18 17-5-5 5-5"/>
            </svg>
          </span>
        }

        <span onClick={decreaseMonth} aria-disabled={prevMonthButtonDisabled} className="cursor-pointer p-3 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </span>
      </div>

      <div className="flex items-center gap-10 z-[999]">
        <span className="text-[16px] font-semibold">{date.getFullYear()}</span>
        <span className="text-[16px] font-semibold text-primary">{date.getMonth() + 1}월</span>
      </div>

      <div className="flex">
        <span onClick={increaseMonth} aria-disabled={nextMonthButtonDisabled} className="cursor-pointer p-3 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </span>

        {
          changeYear &&
          <span onClick={() => changeYear(date.getFullYear() + 1)} className="cursor-pointer p-3 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 17 5-5-5-5"/>
              <path d="m13 17 5-5-5-5"/>
            </svg>
          </span>
        }
      </div>
    </div>
  )
};
