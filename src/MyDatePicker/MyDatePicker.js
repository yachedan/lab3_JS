import React, { useEffect,useState,useRef,createRef,useReducer } from "react";
import ReactDOM from "react-dom";
import "./MyDatePicker.css";
import {
  getDateStringFromTimestamp,
  monthMap,
  getMonthDetails
} from "../shared/dates.js";
import PropTypes from "prop-types";

const date = new Date();
const oneDay = 60 * 60 * 24 * 1000;
console.log(Date.now());
const todayTimestamp =
  Date.now() -
  (Date.now() % oneDay) +
  new Date().getTimezoneOffset() * 1000 * 60;
const inputRef = React.createRef();

const initialState = {
  todayTimestamp: todayTimestamp, // or todayTimestamp, for short
  year: date.getFullYear(),
  month: date.getMonth(),
  selectedDay: todayTimestamp,
  monthDetails: getMonthDetails(date.getFullYear(), date.getMonth()),
};

export default function DatePicker(props) {
  const el = useRef(null);
  const inputRef = createRef();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const addBackDrop = (e) => {
    if (
      showDatePicker &&
      !(el.current.contains(e.target))
    ) {
      setShowDatePicker(false);
    }
  };

  useEffect(() => {
    window.addEventListener("click", addBackDrop);
    setDateToInput(state.selectedDay);
    return () => {
      window.removeEventListener("click", addBackDrop);
    };
  }, [showDatePicker]);

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
    return day.timestamp === state.selectedDay;
  };

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

  const onDateClick = (day) => {
    /* this.setState({ selectedDay: day.timestamp }, () =>
      setDateToInput(day.timestamp)
    ); */
    dispatch({ type: "selectedDay", value: day.timestamp });
    setDateToInput(day.timestamp);
    props.onChange(day.timestamp);
  };

  const setYear = (offset) => {
    const year = state.year + offset;
    dispatch({ type: "year", value: year });
    dispatch({
      type: "monthDetails",
      value: getMonthDetails(year, state.month),
    });
    /* let month = this.state.month;
    this.setState({
      year,
      monthDetails: this.getMonthDetails(year, month),
    }); */
  };

  const setMonth = (offset) => {
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
    /* this.setState({
      year,
      month,
      monthDetails: this.getMonthDetails(year, month), */
  };
  const daysMarkup = state.monthDetails.map((day, index) => (
    <div
      className={
        "c-day-container " +
        (day.month !== 0 ? " disabled" : "") +
        (isCurrentDay(day) ? " highlight" : "") +
        (isSelectedDay(day) ? " highlight-green" : "")
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

  /**
   *  Renderers
   */

  return (
    <div ref={el} className="MyDatePicker">
      <div className="mdp-input" onClick={() => setShowDatePicker(true)}>
        <input type="date" readOnly ref={inputRef} onChange={updateDateFromInput} />
      </div>
      {showDatePicker ? (
        <div className="mdp-container">
          <div className="mdpc-head">
            <div className="mdpch-button">
              <div className="mdpchb-inner" onClick={() => setYear(-1)}>
                <span className="mdpchbi-left-arrows"></span>
              </div>
            </div>
            <div className="mdpch-button">
              <div className="mdpchb-inner" onClick={() => setMonth(-1)}>
                <span className="mdpchbi-left-arrow"></span>
              </div>
            </div>
            <div className="mdpch-container">
              <div className="mdpchc-year">{state.year}</div>
              <div className="mdpchc-month">{getMonthStr(state.month)}</div>
            </div>
            <div className="mdpch-button">
              <div className="mdpchb-inner" onClick={() => setMonth(1)}>
                <span className="mdpchbi-right-arrow"></span>
              </div>
            </div>
            <div className="mdpch-button" onClick={() => setYear(1)}>
              <div className="mdpchb-inner">
                <span className="mdpchbi-right-arrows"></span>
              </div>
            </div>
          </div>
          <div className="mdpc-body">{calendarMarkup}</div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

  function reducer(state, action) {

    if (state.hasOwnProperty(action.type)) {
      return {
        ...state,
        [`${action.type}`]: action.value
      }
    }

    console.log(`Unknown key in state: ${action.type}`)
}

DatePicker.propTypes = {
  onChange: PropTypes.func.isRequired
}
