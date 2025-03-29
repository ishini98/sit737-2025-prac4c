# Calculator Microservice

A simple calculator microservice built with Node.js and Express that provides basic arithmetic operations.

## Features

- Addition, subtraction, multiplication, and division operations
- Input validation
- Comprehensive logging using Winston
- Error handling

## Endpoints

- `GET /add?num1=X&num2=Y` - Adds two numbers
- `GET /subtract?num1=X&num2=Y` - Subtracts two numbers
- `GET /multiply?num1=X&num2=Y` - Multiplies two numbers
- `GET /divide?num1=X&num2=Y` - Divides two numbers

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the server: `node app.js`

## Logging

Logs are stored in the `logs` directory:

- `combined.log` - All log messages
- `error.log` - Error messages only

## Testing

Use curl or Postman to test the endpoints:

```bash
curl "http://localhost:3000/add?num1=5&num2=3"
```
