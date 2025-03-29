# Calculator Microservice

A simple calculator microservice built with Node.js and Express that provides basic arithmetic operations.

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the server: `node app.js`

## Logging

Logs are stored in the `logs` directory:

- `combined.log` - All log messages
- `error.log` - Error messages only

# Enhanced Calculator Microservice (4.2C)

## Features

- **New Operations**: Exponentiation, Square Root, Modulo
- **Improved Error Handling**: Circuit Breaker (via `Opossum`), Retry Pattern
- **Logging**: Winston for request tracking

## API Endpoints

| Endpoint                 | Example  | Result |
| ------------------------ | -------- | ------ |
| `/power?num1=2&num2=3`   | `2^3`    | 8      |
| `/sqrt?num1=9`           | `√9`     | 3      |
| `/modulo?num1=10&num2=3` | `10 % 3` | 1      |

## Error Handling Strategies (Report)

- **Circuit Breaker**: Stops requests to failing services.
- **Retry Pattern**: Auto-retries transient failures.
- **Fallback**: Provides default responses.

## How to Run

````bash
npm install
node app.js

## Testing

Use curl or Postman to test the endpoints:

## Setup Instructions

1. Clone repository:

```bash
git clone https://github.com/ishini98/sit737-2025-prac4c.git
````
