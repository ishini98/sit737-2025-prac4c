// app.js - Complete Calculator Microservice
const express = require('express');
const winston = require('winston');
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Configure Winston logger with enhanced settings
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'calculator-microservice' },
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(
                    ({ timestamp, level, message, ...metadata }) => {
                        return `[${timestamp}] ${level}: ${message} ${Object.keys(metadata).length ? JSON.stringify(metadata) : ''}`;
                    }
                )
            )
        }),
        new winston.transports.File({
            filename: path.join(logsDir, 'error.log'),
            level: 'error',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            )
        }),
        new winston.transports.File({
            filename: path.join(logsDir, 'combined.log'),
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            )
        })
    ],
    exceptionHandlers: [
        new winston.transports.File({
            filename: path.join(logsDir, 'exceptions.log')
        })
    ],
    rejectionHandlers: [
        new winston.transports.File({
            filename: path.join(logsDir, 'rejections.log')
        })
    ]
});

// Graceful shutdown handling
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

const app = express();
const PORT = process.env.PORT || 4000; // Updated port

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware with enhanced details
app.use((req, res, next) => {
    const start = Date.now();
    const { method, originalUrl, ip, headers } = req;
    
    logger.info('Incoming request', {
        method,
        url: originalUrl,
        ip,
        userAgent: headers['user-agent']
    });

    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info('Request completed', {
            method,
            url: originalUrl,
            status: res.statusCode,
            duration: `${duration}ms`
        });
    });

    next();
});

// Enhanced number validation middleware
const validateNumbers = (req, res, next) => {
    const { num1, num2 } = req.query;
    
    if (num1 === undefined || num2 === undefined) {
        logger.error('Missing parameters', {
            received: { num1, num2 },
            expected: 'Both num1 and num2 required'
        });
        return res.status(400).json({
            error: 'Both num1 and num2 are required',
            example: '/add?num1=5&num2=3',
            received: { num1, num2 }
        });
    }
    
    if (isNaN(num1) || isNaN(num2)) {
        logger.error('Invalid number parameters', {
            received: { num1, num2 },
            expected: 'Valid numbers'
        });
        return res.status(400).json({
            error: 'Parameters must be valid numbers',
            received: { num1, num2 }
        });
    }
    
    req.nums = {
        num1: parseFloat(num1),
        num2: parseFloat(num2)
    };
    next();
};

// Operation handler factory
const createOperationHandler = (operation, calculate) => (req, res) => {
    try {
        const { num1, num2 } = req.nums;
        const result = calculate(num1, num2);
        
        logger.info('Operation successful', {
            operation,
            num1,
            num2,
            result
        });
        
        res.json({
            operation,
            num1,
            num2,
            result,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        logger.error('Operation failed', {
            operation,
            error: err.message,
            stack: err.stack
        });
        res.status(500).json({
            error: `${operation} operation failed`,
            message: err.message
        });
    }
};

// Calculator endpoints
app.get('/add', validateNumbers, createOperationHandler(
    'add',
    (a, b) => a + b
));

app.get('/subtract', validateNumbers, createOperationHandler(
    'subtract',
    (a, b) => a - b
));

app.get('/multiply', validateNumbers, createOperationHandler(
    'multiply',
    (a, b) => a * b
));

app.get('/divide', validateNumbers, (req, res) => {
    const { num1, num2 } = req.nums;
    
    if (num2 === 0) {
        logger.error('Division by zero attempted', { num1, num2 });
        return res.status(400).json({
            error: 'Division by zero is not allowed',
            received: { num1, num2 }
        });
    }
    
    createOperationHandler('divide', (a, b) => a / b)(req, res);
});

// API Documentation Endpoint
app.get('/', (req, res) => {
    try {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        
        const documentation = {
            message: 'Calculator Microservice API',
            version: '1.0.0',
            endpoints: {
                add: {
                    method: 'GET',
                    path: '/add',
                    parameters: {
                        num1: 'number',
                        num2: 'number'
                    },
                    example: `${baseUrl}/add?num1=5&num2=3`
                },
                subtract: {
                    method: 'GET',
                    path: '/subtract',
                    parameters: {
                        num1: 'number',
                        num2: 'number'
                    },
                    example: `${baseUrl}/subtract?num1=10&num2=4`
                },
                multiply: {
                    method: 'GET',
                    path: '/multiply',
                    parameters: {
                        num1: 'number',
                        num2: 'number'
                    },
                    example: `${baseUrl}/multiply?num1=7&num2=6`
                },
                divide: {
                    method: 'GET',
                    path: '/divide',
                    parameters: {
                        num1: 'number',
                        num2: 'number (non-zero)'
                    },
                    example: `${baseUrl}/divide?num1=20&num2=5`
                }
            },
            healthCheck: `${baseUrl}/health`,
            note: 'All endpoints require num1 and num2 as query parameters'
        };
        
        logger.info('API documentation accessed');
        res.json(documentation);
    } catch (err) {
        logger.error('Failed to generate documentation', {
            error: err.message,
            stack: err.stack
        });
        res.status(500).json({
            error: 'Failed to load API documentation',
            message: err.message
        });
    }
});

// Health Check Endpoint
app.get('/health', (req, res) => {
    const healthcheck = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        dbConnection: 'none' // Placeholder for future database connections
    };
    
    logger.info('Health check performed', healthcheck);
    res.json(healthcheck);
});

// 404 Handler
app.use((req, res) => {
    logger.warn('Invalid endpoint accessed', {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip
    });
    
    res.status(404).json({
        error: 'Endpoint not found',
        availableEndpoints: [
            '/add',
            '/subtract',
            '/multiply',
            '/divide',
            '/health'
        ],
        documentation: `${req.protocol}://${req.get('host')}`
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    logger.error('Server error occurred', {
        error: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method
    });
    
    res.status(500).json({
        error: 'Internal server error',
        message: err.message,
        timestamp: new Date().toISOString()
    });
});

// Server Startup
const server = app.listen(PORT, () => {
    logger.info(`Server started on port ${PORT}`);
    console.log(`Calculator service running at http://localhost:${PORT}`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    logger.info('SIGINT received. Shutting down gracefully...');
    server.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });
});