import React from 'react';
import { render } from 'react-dom';
import {
  BrowserRouter as Router,
  Route,
  Link,
  Media,
} from 'react-router-dom';

import Character from '../../containers/Character';

const Home = ({match}) => (
  <div>
    <h1>Home</h1>
  </div>
)

export default Home

