type props = {
  source: Date,
  showTime?: boolean
  locale?: string
}

export const formatDateWithLocale = ({source, showTime}: props) => {
  const year = source.getFullYear();
  const month = (source.getMonth() + 1).toString().padStart(2, '0');
  const day = source.getDate().toString().padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;

  const formattedTime = [
    source.getHours().toString().padStart(2, '0'),
    source.getMinutes().toString().padStart(2, '0'),
    source.getSeconds().toString().padStart(2, '0'),
  ].join(':');

  return showTime ? `${formattedDate} ${formattedTime}` : formattedDate;
}

export const formatDateRange = (startDate: string, endDate: string) => {
  const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];

  const start = new Date(startDate);
  const end = new Date(endDate);

  const startMonth = start.getMonth() + 1;
  const startDay = start.getDate();
  const startDayOfWeek = daysOfWeek[start.getDay()];
  const startHour = start.getHours().toString().padStart(2, '0');
  const startMinute = start.getMinutes().toString().padStart(2, '0');

  const endDay = end.getDate();
  const endHour = end.getHours().toString().padStart(2, '0');
  const endMinute = end.getMinutes().toString().padStart(2, '0');

  const totalDays = endDay - startDay + 1;

  return `${startMonth}월 ${startDay}일(${totalDays > 1 ? `${totalDays}일` : startDayOfWeek}) ${startHour}:${startMinute} - ${endHour}:${endMinute}`;
}

export const formatDate = ({source, showTime}: props) => {
  const dateDelimiter = '-';
  const timeDelimiter = ':';

  const year = source.getFullYear();
  const month = (source.getMonth() + 1).toString().padStart(2, '0');
  const day = source.getDate().toString().padStart(2, '0');
  const date = [year, month, day].join(dateDelimiter);

  const hour = source.getHours().toString().padStart(2, '0');
  const minute = source.getMinutes().toString().padStart(2, '0');
  // const second = source.getSeconds().toString().padStart(2, '0');
  const time = [hour, minute].join(timeDelimiter);

  return showTime ? [date, time].join(' ') : date;
}
