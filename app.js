const express = require("express");
const winston = require("winston");
const fs = require("fs");
const path = require("path");
const app = express();
const port = 3000;

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, "logs");
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Logger setup using Winston
const logger = winston.createLogger({
    level: "info",
    format: winston.format.json(),
    defaultMeta: { service: "calculator-microservice" },
    transports: [
        new winston.transports.Console({ format: winston.format.simple() }),
        new winston.transports.File({ filename: "logs/error.log", level: "error" }),
        new winston.transports.File({ filename: "logs/combined.log" }),
    ],
});

app.use(express.json());

app.get("/", (req, res) => {
    res.send(`
        <h1>Welcome to the Enhanced Calculator Microservice</h1>
        <p>Available endpoints:</p>
        <ul>
            <li>/add?num1=X&num2=Y</li>
            <li>/subtract?num1=X&num2=Y</li>
            <li>/multiply?num1=X&num2=Y</li>
            <li>/divide?num1=X&num2=Y</li>
            <li>/power?base=X&exponent=Y</li>
            <li>/sqrt?num=X</li>
            <li>/modulo?num1=X&num2=Y</li>
        </ul>
    `);
});

// Enhanced validateNumbers function to handle single parameter cases
const validateNumbers = (num1, num2, isSingle = false) => {
    if (isSingle) {
        return num1 !== undefined && !isNaN(num1);
    }
    return num1 !== undefined && num2 !== undefined && !isNaN(num1) && !isNaN(num2);
};

// Addition
app.get("/add", (req, res) => {
    const num1 = parseFloat(req.query.num1);
    const num2 = parseFloat(req.query.num2);
    const operation = "+";

    if (!validateNumbers(num1, num2)) {
        logger.error(`Invalid input: num1=${req.query.num1}, num2=${req.query.num2}`);
        return res.status(400).json({ error: "Invalid input. Both parameters must be valid numbers." });
    }

    const result = num1 + num2;
    logger.info(`New ${operation} operation: ${num1} ${operation} ${num2} = ${result}`);
    res.json({ operation, num1, num2, result });
});

// Subtraction
app.get("/subtract", (req, res) => {
    const num1 = parseFloat(req.query.num1);
    const num2 = parseFloat(req.query.num2);
    const operation = "-";

    if (!validateNumbers(num1, num2)) {
        logger.error(`Invalid input: num1=${req.query.num1}, num2=${req.query.num2}`);
        return res.status(400).json({ error: "Invalid input. Both parameters must be valid numbers." });
    }

    const result = num1 - num2;
    logger.info(`New ${operation} operation: ${num1} ${operation} ${num2} = ${result}`);
    res.json({ operation, num1, num2, result });
});

// Multiplication
app.get("/multiply", (req, res) => {
    const num1 = parseFloat(req.query.num1);
    const num2 = parseFloat(req.query.num2);
    const operation = "*";

    if (!validateNumbers(num1, num2)) {
        logger.error(`Invalid input: num1=${req.query.num1}, num2=${req.query.num2}`);
        return res.status(400).json({ error: "Invalid input. Both parameters must be valid numbers." });
    }

    const result = num1 * num2;
    logger.info(`New ${operation} operation: ${num1} ${operation} ${num2} = ${result}`);
    res.json({ operation, num1, num2, result });
});

// Division
app.get("/divide", (req, res) => {
    const num1 = parseFloat(req.query.num1);
    const num2 = parseFloat(req.query.num2);
    const operation = "/";

    if (!validateNumbers(num1, num2)) {
        logger.error(`Invalid input: num1=${req.query.num1}, num2=${req.query.num2}`);
        return res.status(400).json({ error: "Invalid input. Both parameters must be valid numbers." });
    }

    if (num2 === 0) {
        logger.error(`Division by zero error: ${num1} / ${num2}`);
        return res.status(400).json({ error: "Division by zero is not allowed." });
    }

    const result = num1 / num2;
    logger.info(`New ${operation} operation: ${num1} ${operation} ${num2} = ${result}`);
    res.json({ operation, num1, num2, result });
});

// Exponentiation
app.get("/power", (req, res) => {
    const base = parseFloat(req.query.base);
    const exponent = parseFloat(req.query.exponent);
    const operation = "^";

    if (!validateNumbers(base, exponent)) {
        logger.error(`Invalid input: base=${req.query.base}, exponent=${req.query.exponent}`);
        return res.status(400).json({ error: "Invalid input. Both parameters must be valid numbers." });
    }

    const result = Math.pow(base, exponent);
    logger.info(`New ${operation} operation: ${base} ${operation} ${exponent} = ${result}`);
    res.json({ operation: "power", base, exponent, result });
});

// Square Root
app.get("/sqrt", (req, res) => {
    const num = parseFloat(req.query.num);
    const operation = "√";

    if (!validateNumbers(num, null, true)) {
        logger.error(`Invalid input: num=${req.query.num}`);
        return res.status(400).json({ error: "Invalid input. The parameter must be a valid number." });
    }

    if (num < 0) {
        logger.error(`Square root of negative number error: sqrt(${num})`);
        return res.status(400).json({ error: "Cannot calculate square root of negative number." });
    }

    const result = Math.sqrt(num);
    logger.info(`New ${operation} operation: ${operation}${num} = ${result}`);
    res.json({ operation: "sqrt", num, result });
});

// Modulo
app.get("/modulo", (req, res) => {
    const num1 = parseFloat(req.query.num1);
    const num2 = parseFloat(req.query.num2);
    const operation = "%";

    if (!validateNumbers(num1, num2)) {
        logger.error(`Invalid input: num1=${req.query.num1}, num2=${req.query.num2}`);
        return res.status(400).json({ error: "Invalid input. Both parameters must be valid numbers." });
    }

    if (num2 === 0) {
        logger.error(`Modulo by zero error: ${num1} % ${num2}`);
        return res.status(400).json({ error: "Modulo by zero is not allowed." });
    }

    const result = num1 % num2;
    logger.info(`New ${operation} operation: ${num1} ${operation} ${num2} = ${result}`);
    res.json({ operation: "modulo", num1, num2, result });
});

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error(`Server error: ${err.message}`);
    res.status(500).json({ error: "Internal server error", message: err.message });
});

app.listen(port, () => {
    logger.info(`Server is running at http://localhost:${port}`);
});