import express from 'express';
import sse from 'better-sse';
const app = express();
const PORT = 3000;
const TIME_IN_MILLISECONDS = (time) => (time * 1000);

/**
 * @typedef {Object} TrafficLight
 * @property {string} color
 * @property {number} time
 */

/**
 * 
 * @param {TrafficLight} currentColor 
 * @returns 
 */
const toggleTrafficLightColor = ({color: currentColor}) => {
    return currentColor === 'GREEN' ? 'RED' : 'GREEN';
};

const colorsMap = new Map([
    ['RED', { time: 2 }],
    ['GREEN', { time: 6 }]
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
 * @param {Object} request 
 * @param {Object} response 
 */
const handleSSE = async (request, response) => {
    const { createSession } = sse;
    const session = await createSession(request, response);
    let currentColor = 'GREEN';

    // Push the initial traffic light color to the client
    pushMessage(session, currentColor);

    // Start the interval to switch between green and red colors
    const interval = setInterval(() => {
        // Toggle the traffic light color
        currentColor = toggleTrafficLightColor(currentColor);
        
        // Push the new color to the client
        pushMessage(session, currentColor);
    }, TIME_IN_MILLISECONDS(colorsMap.get(currentColor).time));

    // Optionally, clear the interval when the client disconnects
    request.on('close', () => clearInterval(interval));
};


app.get('/sse', handleSSE);

app.listen(PORT || 3000);