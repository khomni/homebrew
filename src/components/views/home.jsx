import React from 'react';
import { render } from 'react-dom';
import {
  BrowserRouter as Router,
  Route,
  Link,
  Media,
} from 'react-router-dom';

const Home = ({match}) => (
  <div>
    <h1>Home</h1>
    <pre>{JSON.stringify(match,null,'  ')}</pre>
  </div>
)

export default Home

