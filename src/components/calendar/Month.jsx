import React from 'react';
import { render } from 'react-dom';

import Event from './Event';

export const Day = ({day}) => (
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

export const Week = ({week}) => (
  <tr className="week">
    {week.map((day,i) => <Day key={i} day={day}/>)}
  </tr>
)

export const Month = ({match, calendar, month}) => (
  <table className="calendar month fixed">
    <thead>
      <tr>
        <th colSpan={calendar.weekdays.length}>{month.name}</th>
      </tr>
      <tr>
        {calendar.weekdays.map(day => <th key={day}>{day}</th>)}
      </tr>
    </thead>
    <tbody>
      {month.weeks.map((week,i) => <Week key={i} week={week}/>)}
    </tbody>
  </table>
)

export const Events =  ({calendar, years}) => (
  <div>
    { years.map(year => (
      <div key={year.year}>
        <h3>{year.year}</h3>
        { year.months.map(month => <Month key={month.name} month={month} calendar={calendar} />)} 
      </div>
    ))}
  </div>
)

export default Events


