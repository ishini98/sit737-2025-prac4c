# Error Handling Strategies in Microservices

## 1. Circuit Breaker Pattern

**Implementation**: Uses libraries like `opossum`  
**Purpose**: Prevents cascading failures when services are unavailable  
**Example**:

```javascript
const CircuitBreaker = require("opossum");
const breaker = new CircuitBreaker(apiCall, {
  timeout: 3000,
  errorThresholdPercentage: 50,
});
```
