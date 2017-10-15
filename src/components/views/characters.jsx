import React from 'react';
import { Route, Switch } from 'react-router-dom';

import CharacterSheet from '../../containers/Character';

const CharacterList = ({match}) => (
  <div>
    <h1> Characters </h1>
  </div>
)

const Character = ({match}) => (
  <Switch>
    <Route path={match.url + "/:slug"} component={CharacterSheet}/>
    <Route component={CharacterList}/>
  </Switch>
)

export default Character
