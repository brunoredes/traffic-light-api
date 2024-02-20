import 'dotenv/config';
import express from 'express';
import sse from 'better-sse';
const app = express();

/**
 *
 * @param {number} time
 * @returns
 */
const TIME_IN_MILLISECONDS = (time) => time * 1000;

/**
 * @typedef {Object} TrafficLight
 * @property {string} color
 * @property {number} time
 */

/**
 *
 * @param {string} currentColor
 * @returns {string}
 */
const toggleTrafficLightColor = (currentColor) => {
  return currentColor === 'GREEN' ? 'RED' : 'GREEN';
};

const colorsMap = new Map([
  ['RED', { time: 20 }],
  ['GREEN', { time: 40 }],
]);

/**
 * Function to push a message to the session
 * @param {Object} session
 * @param {string} color
 */
const pushMessage = (session, color) => {
  session.push(color, 'trafficLightCurrentColor');
};

/**
 * Function to handle SSE requests
 * @param {import('express').Request} request
 * @param {import('express').Response} response
 */
const handleSSE = async (request, response) => {
  const { createSession } = sse;
  const session = await createSession(request, response);
  let currentColor = 'GREEN';

  pushMessage(session, currentColor);

  const interval = setInterval(() => {
    currentColor = toggleTrafficLightColor(currentColor);

    pushMessage(session, currentColor);
  }, TIME_IN_MILLISECONDS(colorsMap.get(currentColor).time));

  request.on('close', () => {
    console.log('fechou');
    clearInterval(interval);
  });
};

app.get('/sse', handleSSE);

app.listen(process.env.PORT || 3000);
