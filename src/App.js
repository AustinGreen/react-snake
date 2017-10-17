import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cs from 'classnames';
import Grid from './Grid';
import Row from './Row';
import Cell from './Cell';
import { GRID_SIZE } from './constants';

import './App.css';

const TICK_RATE = 80;

const DIRECTIONS = {
  UP: 'UP',
  BOTTOM: 'BOTTOM',
  RIGHT: 'RIGHT',
  LEFT: 'LEFT'
};

const DIRECTION_TICKS = {
  UP: (x, y) => ({ x, y: y - 1 }),
  BOTTOM: (x, y) => ({ x, y: y + 1 }),
  RIGHT: (x, y) => ({ x: x + 1, y }),
  LEFT: (x, y) => ({ x: x - 1, y })
};

const KEY_CODES_MAPPER = {
  38: 'UP',
  39: 'RIGHT',
  37: 'LEFT',
  40: 'BOTTOM'
};

const KEY_CODES_MAPPER_REVERSE = {
  38: 'BOTTOM',
  39: 'LEFT',
  37: 'RIGHT',
  40: 'UP'
};

const getRandomNumberFromRange = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

const getRandomCoordinate = () => ({
  x: getRandomNumberFromRange(1, GRID_SIZE - 1),
  y: getRandomNumberFromRange(1, GRID_SIZE - 1)
});

const isBorder = (x, y) => x === 0 || y === 0 || x === GRID_SIZE || y === GRID_SIZE;

const isPosition = (x, y, diffX, diffY) => x === diffX && y === diffY;

const isSnake = (x, y, snakeCoordinates) =>
  snakeCoordinates.filter(coordinate => isPosition(coordinate.x, coordinate.y, x, y)).length;

const getSnakeHead = snake => snake.coordinates[0];

const getSnakeWithoutStub = snake => snake.coordinates.slice(0, snake.coordinates.length - 1);

const getSnakeTail = snake => snake.coordinates.slice(1);

const getIsSnakeOutside = snake =>
  getSnakeHead(snake).x >= GRID_SIZE ||
  getSnakeHead(snake).y >= GRID_SIZE ||
  getSnakeHead(snake).x <= 0 ||
  getSnakeHead(snake).y <= 0;

const getIsSnakeEating = ({ snake, snack }) =>
  isPosition(getSnakeHead(snake).x, getSnakeHead(snake).y, snack.coordinate.x, snack.coordinate.y);

export const getCellCs = (isGameOver, snake, snack, x, y) =>
  cs('grid-cell', {
    'grid-cell-border': isBorder(x, y),
    'grid-cell-snake': isSnake(x, y, snake.coordinates),
    'grid-cell-snack': isPosition(x, y, snack.coordinate.x, snack.coordinate.y),
    'grid-cell-hit': isGameOver && isPosition(x, y, getSnakeHead(snake).x, getSnakeHead(snake).y)
  });

const applySnakePosition = prevState => {
  const isSnakeEating = getIsSnakeEating(prevState);

  const snakeHead = DIRECTION_TICKS[prevState.playground.direction](
    getSnakeHead(prevState.snake).x,
    getSnakeHead(prevState.snake).y
  );

  const snakeTail = isSnakeEating ? prevState.snake.coordinates : getSnakeWithoutStub(prevState.snake);

  const snackCoordinate = isSnakeEating ? getRandomCoordinate() : prevState.snack.coordinate;

  return {
    snake: {
      coordinates: [snakeHead, ...snakeTail]
    },
    snack: {
      coordinate: snackCoordinate
    }
  };
};

const applyGameOver = prevState => ({
  playground: {
    isGameOver: true
  }
});

const doChangeDirection = direction => () => ({
  playground: {
    direction
  }
});

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      score: 0,
      playground: {
        direction: DIRECTIONS.RIGHT,
        isGameOver: false
      },
      snake: {
        coordinates: [getRandomCoordinate()]
      },
      snack: {
        coordinate: getRandomCoordinate()
      }
    };

    this.updateScore = this.updateScore.bind(this);
    this.handleReset = this.handleReset.bind(this);
  }

  getChildContext() {
    return { isGameOver: this.state.playground.isGameOver, snake: this.state.snake, snack: this.state.snack };
  }

  handleReset() {
    this.setState({
      score: 0,
      playground: {
        direction: DIRECTIONS.RIGHT,
        isGameOver: false
      },
      snake: {
        coordinates: [getRandomCoordinate()]
      },
      snack: {
        coordinate: getRandomCoordinate()
      }
    });
  }

  componentDidMount() {
    this.interval = setInterval(this.onTick, TICK_RATE);

    window.addEventListener('keydown', this.onChangeDirection, false);
  }

  componentWillUnmount() {
    clearInterval(this.interval);

    window.removeEventListener('keydown', this.onChangeDirection, false);
  }

  updateScore() {
    this.setState(prevState => {
      const isSnakeEating = getIsSnakeEating(prevState);
      if (isSnakeEating) {
        return { score: prevState.score + 1 };
      }
      return null;
    });
  }

  onChangeDirection = event => {
    if (
      KEY_CODES_MAPPER[event.keyCode] &&
      this.state.playground.direction !== KEY_CODES_MAPPER_REVERSE[event.keyCode]
    ) {
      this.setState(doChangeDirection(KEY_CODES_MAPPER[event.keyCode]));
    }
  };

  onTick = () => {
    getIsSnakeOutside(this.state.snake) ? this.setState(applyGameOver) : this.setState(applySnakePosition);
    this.updateScore();
  };

  render() {
    const { snake, snack, playground } = this.state;

    return (
      <div className="app">
        <h1>Snake!</h1>
        <button onClick={this.handleReset}>Reset</button>
        <h3>Score: {this.state.score}</h3>
        <Grid />
      </div>
    );
  }
}

App.childContextTypes = {
  isGameOver: PropTypes.bool,
  snake: PropTypes.object,
  snack: PropTypes.object
};

export default App;
