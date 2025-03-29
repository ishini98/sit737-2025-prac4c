const express = require("express");
const winston = require("winston");
const app = express();
const port = 3000;

// Enhanced Winston logger configuration
const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: "logs/error.log", level: "error" }),
        new winston.transports.File({ filename: "logs/combined.log" })
    ]
});

app.use(express.json());

// Input validation middleware
const validateNumbers = (req, res, next) => {
    const { num1, num2 } = req.query;
    if (num1 === undefined || num2 === undefined || isNaN(num1) || isNaN(num2)) {
        logger.error("Invalid input parameters");
        return res.status(400).json({ error: "Both num1 and num2 must be valid numbers" });
    }
    req.numbers = { num1: parseFloat(num1), num2: parseFloat(num2) };
    next();
};

// Single number validation for sqrt
const validateSingleNumber = (req, res, next) => {
    const { num } = req.query;
    if (num === undefined || isNaN(num)) {
        logger.error("Invalid input parameter for sqrt");
        return res.status(400).json({ error: "num must be a valid number" });
    }
    req.number = parseFloat(num);
    next();
};

// API Endpoints
app.get("/add", validateNumbers, (req, res) => {
    const { num1, num2 } = req.numbers;
    const result = num1 + num2;
    logger.info(`Addition: ${num1} + ${num2} = ${result}`);
    res.json({ operation: "add", num1, num2, result });
});

app.get("/subtract", validateNumbers, (req, res) => {
    const { num1, num2 } = req.numbers;
    const result = num1 - num2;
    logger.info(`Subtraction: ${num1} - ${num2} = ${result}`);
    res.json({ operation: "subtract", num1, num2, result });
});

app.get("/multiply", validateNumbers, (req, res) => {
    const { num1, num2 } = req.numbers;
    const result = num1 * num2;
    logger.info(`Multiplication: ${num1} * ${num2} = ${result}`);
    res.json({ operation: "multiply", num1, num2, result });
});

app.get("/divide", validateNumbers, (req, res) => {
    const { num1, num2 } = req.numbers;
    if (num2 === 0) {
        logger.error("Division by zero attempted");
        return res.status(400).json({ error: "Division by zero not allowed" });
    }
    const result = num1 / num2;
    logger.info(`Division: ${num1} / ${num2} = ${result}`);
    res.json({ operation: "divide", num1, num2, result });
});

// 4.2C Additional Operations
app.get("/power", validateNumbers, (req, res) => {
    const { num1, num2 } = req.numbers;
    const result = Math.pow(num1, num2);
    logger.info(`Exponentiation: ${num1}^${num2} = ${result}`);
    res.json({ operation: "power", base: num1, exponent: num2, result });
});

app.get("/sqrt", validateSingleNumber, (req, res) => {
    const num = req.number;
    if (num < 0) {
        logger.error("Square root of negative number attempted");
        return res.status(400).json({ error: "Cannot calculate square root of negative number" });
    }
    const result = Math.sqrt(num);
    logger.info(`Square root: √${num} = ${result}`);
    res.json({ operation: "sqrt", num, result });
});

app.get("/modulo", validateNumbers, (req, res) => {
    const { num1, num2 } = req.numbers;
    if (num2 === 0) {
        logger.error("Modulo by zero attempted");
        return res.status(400).json({ error: "Modulo by zero not allowed" });
    }
    const result = num1 % num2;
    logger.info(`Modulo: ${num1} % ${num2} = ${result}`);
    res.json({ operation: "modulo", num1, num2, result });
});

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error(`Server error: ${err.message}`);
    res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
    logger.info(`Calculator microservice running on port ${port}`);
});