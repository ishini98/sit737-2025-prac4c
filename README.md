# Enhanced Calculator Microservice (4.2C)

![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![Express](https://img.shields.io/badge/Express-4.x-lightgrey)
[![GitHub License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

## Overview

Enhanced calculator microservice implementing advanced arithmetic operations with robust error handling, fulfilling requirements for **SIT323/SIT737 Task 4.2C**.

## Features

### Core Operations

- Addition (`/add?num1=X&num2=Y`)
- Subtraction (`/subtract?num1=X&num2=Y`)
- Multiplication (`/multiply?num1=X&num2=Y`)
- Division (`/divide?num1=X&num2=Y`)

### Advanced Operations (4.2C Requirements)

- Exponentiation (`/power?base=X&exponent=Y`)
- Square Root (`/sqrt?num=X`)
- Modulo (`/modulo?num1=X&num2=Y`)

### Error Handling

- Input validation for all parameters
- Division/modulo by zero protection
- Negative square root prevention
- Winston logging (`logs/` directory)

## Setup Instructions

1. **Clone repository**:
   ```bash
   git clone https://github.com/ishini98/sit737-2025-prac4c.git
   cd sit737-2025-prac4c
   ```
