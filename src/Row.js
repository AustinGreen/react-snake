import React from 'react';
import { GRID } from './constants';
import Cell from './Cell';

const Row = ({ y }) => <div className="grid-row">{GRID.map(x => <Cell x={x} y={y} key={x} />)}</div>;

export default Row;
