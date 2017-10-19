import React from 'react';
import { Route, Switch } from 'react-router-dom';

const Lore = ({ match, lore }) => (
  <div dangerouslySetInnerHTML={{ __html: lore.$content }}/>
)

export default Lore
