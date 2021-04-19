import React from "react";
import "./App.css";
import Calendar from "./Calendar/calendar";

function onChange(timestamp) {
  console.log(timestamp);
}

function App() {
  return (
    <div className="App">
      <Calendar onChange={onChange} type="single" />
      <Calendar onChange={onChange} type="range" />
    </div>
  );
}

export default App;
