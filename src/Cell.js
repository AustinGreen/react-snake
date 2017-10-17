import React from 'react';
import PropTypes from 'prop-types';
import { GRID } from './constants';
import { getCellCs } from './App';

const Cell = ({ x, y }, { isGameOver, snake, snack }) => <div className={getCellCs(isGameOver, snake, snack, x, y)} />;

Cell.contextTypes = {
  isGameOver: PropTypes.bool,
  snake: PropTypes.object,
  snack: PropTypes.object
};

export default Cell;
