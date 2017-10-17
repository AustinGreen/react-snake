import React from 'react';
import { GRID } from './constants';
import Row from './Row';

const Grid = () => <div>{GRID.map(y => <Row y={y} key={y} />)}</div>;

export default Grid;
