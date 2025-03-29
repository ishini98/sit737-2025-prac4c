require('dotenv').config();
const express = require('express');
const winston = require('winston');
const fs = require('fs');

// Logger Configuration
if (!fs.existsSync('logs')) fs.mkdirSync('logs');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

const app = express();
app.use(express.json());

// Request Logging Middleware
app.use((req, res, next) => {
  logger.info(`Request: ${req.method} ${req.path}`, {
    ip: req.ip,
    params: req.query
  });
  next();
});

// Original Operations (from 4.1P)
app.get('/add', (req, res) => handleOperation(req, res, 'add', (a, b) => a + b));
app.get('/subtract', (req, res) => handleOperation(req, res, 'subtract', (a, b) => a - b));
app.get('/multiply', (req, res) => handleOperation(req, res, 'multiply', (a, b) => a * b));
app.get('/divide', (req, res) => handleOperation(req, res, 'divide', (a, b) => a / b));

// Enhanced Operations (4.2C)
app.get('/power', (req, res) => {
  const { base, exponent } = req.query;
  
  if (isNaN(base) || isNaN(exponent)) {
    logger.error('Invalid power input', { base, exponent });
    return res.status(400).json({
      error: "InvalidInput",
      message: "Base and exponent must be numbers"
    });
  }

  const result = Math.pow(parseFloat(base), parseFloat(exponent));
  logger.info(`Power operation: ${base}^${exponent} = ${result}`);
  res.json({ operation: "power", input: { base, exponent }, result });
});

app.get('/sqrt', (req, res) => {
  const { num } = req.query;

  if (isNaN(num)) {
    logger.error('Invalid sqrt input', { num });
    return res.status(400).json({
      error: "InvalidInput",
      message: "Input must be a number"
    });
  }

  if (parseFloat(num) < 0) {
    logger.error('Negative sqrt input', { num });
    return res.status(400).json({
      error: "MathError",
      message: "Cannot calculate square root of negative numbers"
    });
  }

  const result = Math.sqrt(parseFloat(num));
  logger.info(`Square root: √${num} = ${result}`);
  res.json({ operation: "square_root", input: { num }, result });
});

app.get('/modulo', (req, res) => {
  const { dividend, divisor } = req.query;

  if (isNaN(dividend) || isNaN(divisor)) {
    logger.error('Invalid modulo input', { dividend, divisor });
    return res.status(400).json({
      error: "InvalidInput",
      message: "Both inputs must be numbers"
    });
  }

  if (parseFloat(divisor) === 0) {
    logger.error('Modulo by zero', { dividend, divisor });
    return res.status(400).json({
      error: "MathError",
      message: "Cannot divide by zero in modulo operation"
    });
  }

  const result = parseFloat(dividend) % parseFloat(divisor);
  logger.info(`Modulo: ${dividend} % ${divisor} = ${result}`);
  res.json({ operation: "modulo", input: { dividend, divisor }, result });
});

// Unified Operation Handler
function handleOperation(req, res, operation, calculate) {
  const { num1, num2 } = req.query;
  
  if (isNaN(num1) || isNaN(num2)) {
    logger.error(`Invalid ${operation} input`, { num1, num2 });
    return res.status(400).json({
      error: "InvalidInput",
      message: "Both parameters must be numbers"
    });
  }

  try {
    const result = calculate(parseFloat(num1), parseFloat(num2));
    logger.info(`${operation}: ${num1} ${operation} ${num2} = ${result}`);
    res.json({ operation, input: { num1, num2 }, result });
  } catch (err) {
    logger.error(`${operation} error`, { error: err.message });
    res.status(500).json({ error: "CalculationError", message: err.message });
  }
}

// Error Handling Middleware
app.use((err, req, res, next) => {
  logger.error('System error', { 
    path: req.path,
    error: err.message,
    stack: err.stack
  });
  
  res.status(500).json({
    error: "SystemError",
    message: "An unexpected error occurred",
    reference: req.id
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
  console.log(`Calculator service: http://localhost:${PORT}`);
});