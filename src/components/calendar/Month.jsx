import React from 'react';
import { render } from 'react-dom';

import Event from './Event';

const Day = ({day}) => (
  <td className="day">
    {day && (
      <div>
        {day.date && <div className="date-number">{day.date}</div>}
        <div className="events">
          {day.events && day.events.map(event => <Event key={event.id} event={event}/>)}
        </div>
      </div>
    )}
  </td>
)

const Week = ({week}) => (
  <tr className="week">
    {week.day.map(day => <Day key={day.date} day={day}/>)}
  </tr>
)

const Month = ({match, calendar, month}) => (
  <table className="calendar month">
    <thead>
      <tr>
        {calendar.weekdays.map(day => <th key={day}>{day}</th>)}
      </tr>
    </thead>
    <tbody>
      {month.week.map((week,i) => <Week key={i} week={week}/>)}
    </tbody>
  </table>
)

export default Month


