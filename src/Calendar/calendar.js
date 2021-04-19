import React, {
  useEffect,
  useState,
  useRef,
  createRef,
  useReducer,
} from "react";
import "./calendar.css";
import { getMonthDetails } from "../shared/dates.js";
import PropTypes from "prop-types";

const date = new Date();
const oneDay = 60 * 60 * 24 * 1000;
const todayTimestamp =
  Date.now() -
  (Date.now() % oneDay) +
  new Date().getTimezoneOffset() * 1000 * 60;
const inputRef = React.createRef();
var f = true;

export default function Calendar(props) {
  const el = useRef(null);
  const inputRef = createRef();
  
  const [showCalendar, setShowCalendar] = useState(false);

  const addBackDrop = (e) => {
    if (showCalendar && !(el.current.contains(e.target))) {
      setShowCalendar(false);
    }
  };

  useEffect(() => {
    window.addEventListener("click", addBackDrop);
    //setDateToInput(state.selectedDay);
    return () => {
      window.removeEventListener("click", addBackDrop);
    };
  }, [showCalendar]);

  var initialState;
  if(props.type === "single"){
  initialState = {
    todayTimestamp: todayTimestamp,
    year: date.getFullYear(),
    month: date.getMonth(),
    selectedDay: todayTimestamp,
    monthDetails: getMonthDetails(date.getFullYear(), date.getMonth()),
  };
  }
  else if(props.type === "range")
  {
  initialState = {
    todayTimestamp: todayTimestamp,
    year: date.getFullYear(),
    yearSecond: date.getFullYear(),
    month: date.getMonth(),
    monthSecond: date.getMonth() + 1,
    selectedRangeStart: todayTimestamp,
    selectedRangeEnd: todayTimestamp,
    monthDetails: getMonthDetails(date.getFullYear(), date.getMonth()),
    monthDetailsSecond: getMonthDetails(date.getFullYear(), date.getMonth())
  };
  }
  const [state, dispatch] = useReducer(reducer, initialState);

  const monthMap = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const isCurrentDay = (day) => {
    return day.timestamp === todayTimestamp;
  };
  const isSelectedDay = (day) => {
    return day.timestamp === state.selectedDay || day.timestamp === state.selectedRangeStart || day.timestamp === state.selectedRangeEnd;
  };
  const isSelectedRange = (day) =>{
    return day.timestamp > state.selectedRangeStart && day.timestamp < state.selectedRangeEnd;
  }
  const getMonthStr = (month) =>
    monthMap[Math.max(Math.min(11, month), 0)] || "Month";

  const getDateStringFromTimestamp = (timestamp) => {
    const dateObject = new Date(timestamp);
    const month = dateObject.getMonth() + 1;
    const date = dateObject.getDate();
    return (
      dateObject.getFullYear() +
      "-" +
      (month < 10 ? "0" + month : month) +
      "-" +
      (date < 10 ? "0" + date : date)
    );
  };

  const setDate = (dateData) => {
    const selectedDay = new Date(
      dateData.year,
      dateData.month - 1,
      dateData.date
    ).getTime();
    dispatch({ type: "selectedDay", value: selectedDay });
    props.onChange(selectedDay);
  };

  const getDateFromDateString = (dateValue) => {
    const dateData = dateValue.split("-").map((d) => parseInt(d, 10));

    if (dateData.length < 3) {
      return null;
    }

    const year = dateData[0];
    const month = dateData[1];
    const date = dateData[2];
    return { year, month, date };
  };

  const updateDateFromInput = () => {
    const dateValue = inputRef.current.value;
    const dateData = getDateFromDateString(dateValue);
    if (dateData !== null) {
      setDate(dateData);
      dispatch({ type: "year", value: dateData.year });
      dispatch({ type: "month", value: dateData.month - 1 });
      dispatch({
        type: "monthDetails",
        value: getMonthDetails(dateData.year, dateData.month - 1),
      });
    }
  };

  const setDateToInput = (timestamp) => {
    const dateString = getDateStringFromTimestamp(timestamp);
    inputRef.current.value = dateString;
  };

  let onDateClick;
  
  if(props.type === "single"){
  onDateClick = (day) => {
    dispatch({ type: "selectedDay", value: day.timestamp });
    //setDateToInput(day.timestamp);
    props.onChange(day.timestamp);
  }
  }
  else if(props.type === "range"){
    onDateClick = (day) => {
      if(!f && day.timestamp < state.selectedRangeStart)
      {
        f = true;
        state.selectedRangeEnd = null;
      }
      else if(f && day.timestamp > state.selectedRangeEnd)
      {
        f = false;
      }
      if(f){
        dispatch({type: "selectedRangeStart", value:day.timestamp});
        f = !f;
      }
      else{
        dispatch({type: "selectedRangeEnd", value:day.timestamp});
        f = !f;
      }
      props.onChange(day.timestamp);
    }
  }
  const setYear = (index,offset) => {
    if(index === 1)
    {
      const year = state.year + offset;
      dispatch({ type: "year", value: year });
      dispatch({
        type: "monthDetails",
        value: getMonthDetails(year, state.month),
      });
    }
    else if(index === 2)
    {
      const yearSecond = state.yearSecond + offset;
      dispatch({ type: "yearSecond", value: yearSecond });
      dispatch({
        type: "monthDetailsSecond",
        value: getMonthDetails(yearSecond, state.month),
      });
    }

  };
  const setMonth = (index, offset) => {
    if(index === 1)
    {
    let year = state.year;
    let month = state.month + offset;
    if (month === -1) {
      month = 11;
      year--;
    } else if (month === 12) {
      month = 0;
      year++;
    }
    dispatch({ type: "year", value: year });
    dispatch({ type: "month", value: month });
    dispatch({ type: "monthDetails", value: getMonthDetails(year, month) });
  }else if(index === 2)
  {
    let yearSecond = state.yearSecond;
    let monthSecond = state.monthSecond + offset;
    if (monthSecond === -1) {
      monthSecond = 11;
      yearSecond--;
    } else if (monthSecond === 12) {
      monthSecond = 0;
      yearSecond++;
    }
    dispatch({ type: "yearSecond", value: yearSecond });
    dispatch({ type: "monthSecond", value: monthSecond });
    dispatch({
      type: "monthDetailsSecond",
      value: getMonthDetails(yearSecond, monthSecond),
    });
  }
  };

  
  

  if(props.type === "single")
  {
    const daysMarkup = state.monthDetails.map((day, index) => (
      <div
        className={
          "c-day-container " +
          (day.month !== 0 ? " disabled" : "") +
          (isCurrentDay(day) ? " highlight" : "") +
          (isSelectedDay(day) ? " highlight-orange" : "") +
          (isSelectedRange(day) ? " highlight-range" : "")
        }
        key={index}
      >
        <div className="cdc-day">
          <span onClick={() => onDateClick(day)}>{day.date}</span>
        </div>
      </div>
    ));
    const calendarMarkup = (
      <div className="c-container">
        <div className="cc-head">
          {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d, i) => (
            <div key={i} className="cch-name">
              {d}
            </div>
          ))}
        </div>
        <div className="cc-body">{daysMarkup}</div>
      </div>
    );
  return (
    <div ref={el} className="Calendar">
      <div className="cal-container">
        <div className="cal-label" onClick={() => setShowCalendar(true)}>
          <label>{getDateStringFromTimestamp(state.selectedDay)}</label>
        </div>
        <div className="calc-head">
          <div className="calch-button">
            <div className="calchb-inner" onClick={() => setYear(1,-1)}>
              <span className="calchbi-left-arrows"></span>
            </div>
          </div>
          <div className="calch-button">
            <div className="calchb-inner" onClick={() => setMonth(1,-1)}>
              <span className="calchbi-left-arrow"></span>
            </div>
          </div>
          <div className="calch-container">
            {getMonthStr(state.month)} {state.year}
          </div> 
          <div className="calch-button">
            <div className="calchb-inner" onClick={() => setMonth(1,1)}>
              <span className="calchbi-right-arrow"></span>
            </div>
          </div>
          <div className="calch-button" onClick={() => setYear(1,1)}>
            <div className="calchb-inner">
              <span className="calchbi-right-arrows"></span>
            </div>
          </div>
        </div>
        <div className="calc-body">{calendarMarkup}</div>
      </div>
    </div>
  );
  }
  else if(props.type === "range")
  {
    const daysMarkup = state.monthDetails.map((day, index) => (
      <div
        className={
          "c-day-container " +
          (day.month !== 0 ? " disabled" : "") +
          (isCurrentDay(day) ? " highlight" : "") +
          (isSelectedDay(day) ? " highlight-orange" : "") +
          (isSelectedRange(day) ? " highlight-range" : "")
        }
        key={index}
      >
        <div className="cdc-day">
          <span onClick={() => onDateClick(day)}>{day.date}</span>
        </div>
      </div>
    ));
    const calendarMarkup = (
      <div className="c-container">
        <div className="cc-head">
          {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d, i) => (
            <div key={i} className="cch-name">
              {d}
            </div>
          ))}
        </div>
        <div className="cc-body">{daysMarkup}</div>
      </div>
    );
    const daysMarkupSecond = state.monthDetailsSecond.map((day, index) => (
      <div
        className={
          "c-day-container " +
          (day.month !== 0 ? " disabled" : "") +
          (isCurrentDay(day) ? " highlight" : "") +
          (isSelectedDay(day) ? " highlight-orange" : "") +
          (isSelectedRange(day) ? " highlight-range" : "")
        }
        key={index}
      >
        <div className="cdc-day">
          <span onClick={() => onDateClick(day)}>{day.date}</span>
        </div>
      </div>
    ));

    const calendarMarkupSecond = (
      <div className="c-container">
        <div className="cc-head">
          {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d, i) => (
            <div key={i} className="cch-name">
              {d}
            </div>
          ))}
        </div>
        <div className="cc-body">{daysMarkupSecond}</div>
      </div>
    );
  return (
    <div ref={el} className="Calendar">
      <div className="cal-container">
        <div className="cal-label" onClick={() => setShowCalendar(true)}>
          <label>{getDateStringFromTimestamp(state.selectedRangeStart)}</label>
          <label>{getDateStringFromTimestamp(state.selectedRangeEnd)}</label>
        </div>
        <div className="calc-head">
          <div className="calch-button">
            <div className="calchb-inner" onClick={() => setYear(1,-1)}>
              <span className="calchbi-left-arrows"></span>
            </div>
          </div>
          <div className="calch-button">
            <div className="calchb-inner" onClick={() => setMonth(1,-1)}>
              <span className="calchbi-left-arrow"></span>
            </div>
          </div>
          <div className="calch-container">
            {getMonthStr(state.month)} {state.year}
          </div>
          <div className="calch-button">
            <div className="calchb-inner" onClick={() => setMonth(1,1)}>
              <span className="calchbi-right-arrow"></span>
            </div>
          </div>
          <div className="calch-button" onClick={() => setYear(1,1)}>
            <div className="calchb-inner">
              <span className="calchbi-right-arrows"></span>
            </div>
          </div>
        </div>
        <div className="calc-body">{calendarMarkup}</div>
      </div>
      <div className="cal-container2">
        <div className="cal-label" onClick={() => setShowCalendar(true)}>
          <label>{getDateStringFromTimestamp(state.selectedRangeStart)}</label>
          <label>{getDateStringFromTimestamp(state.selectedRangeEnd)}</label>
        </div>
        <div className="calc-head">
          <div className="calch-button">
            <div className="calchb-inner" onClick={() => setYear(2,-1)}>
              <span className="calchbi-left-arrows"></span>
            </div>
          </div>
          <div className="calch-button">
            <div className="calchb-inner" onClick={() => setMonth(2,-1)}>
              <span className="calchbi-left-arrow"></span>
            </div>
          </div>
          <div className="calch-container">
            {getMonthStr(state.monthSecond)} {state.yearSecond}
          </div>
          <div className="calch-button">
            <div className="calchb-inner" onClick={() => setMonth(2,1)}>
              <span className="calchbi-right-arrow"></span>
            </div>
          </div>
          <div className="calch-button" onClick={() => setYear(2,1)}>
            <div className="calchb-inner">
              <span className="calchbi-right-arrows"></span>
            </div>
          </div>
        </div>
        <div className="calc-body">{calendarMarkupSecond}</div>
      </div>
    </div>
  );
  }
}

function reducer(state, action) {
  if (state.hasOwnProperty(action.type)) {
    return {
      ...state,
      [`${action.type}`]: action.value,
    };
  }
  console.log(`Unknown key in state: ${action.type}`);
}

Calendar.propTypes = {
  onChange: PropTypes.func.isRequired,
};
