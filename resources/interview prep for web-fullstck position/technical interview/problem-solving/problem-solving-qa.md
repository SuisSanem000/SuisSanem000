# Problem Solving - Interview Study Guide

## Problem-Solving Approach

### 1. Structured Thinking
- [ ] Always clarify requirements first
- [ ] Ask about constraints (time, space, scale)
- [ ] Discuss edge cases upfront
- [ ] Think aloud during problem-solving
- [ ] Present multiple approaches

### 2. Communication
- [ ] Explain your reasoning clearly
- [ ] Discuss trade-offs between solutions
- [ ] Mention time and space complexity
- [ ] Use examples to illustrate
- [ ] Ask for feedback during process

---

## Business Logic Algorithms

### 3. Supplier Allocation
- [ ] Design algorithm for multi-factor optimization
- [ ] Consider: delivery time, stock, price, reliability
- [ ] Use weighted scoring system
- [ ] Handle edge cases (out of stock, ties)
- [ ] Scale to 10,000+ orders/minute

### 4. Inventory Management
- [ ] Track real-time stock across suppliers
- [ ] Handle concurrent order placement
- [ ] Reserve stock during checkout
- [ ] Release reserved stock on timeout
- [ ] Update stock after successful orders

### 5. Price Optimization
- [ ] Compare competitor prices
- [ ] Apply dynamic pricing rules
- [ ] Consider supplier costs and margins
- [ ] Handle bulk discounts
- [ ] Update prices based on demand

---

## Data Processing

### 6. Large Dataset Handling
- [ ] Process 5M products efficiently
- [ ] Use pagination/streaming for large results
- [ ] Batch operations when possible
- [ ] Use indexes for fast lookups
- [ ] Cache frequently accessed data

### 7. Search and Filtering
- [ ] Implement efficient product search
- [ ] Handle multiple filter criteria
- [ ] Support sorting by various fields
- [ ] Return results with pagination
- [ ] Optimize for performance

---

## Common Algorithm Patterns

### 8. Arrays and Strings
- [ ] Two-pointer technique
- [ ] Sliding window pattern
- [ ] Hash maps for O(1) lookups
- [ ] Sorting for optimization

### 9. Optimization Problems
- [ ] Greedy algorithms (when applicable)
- [ ] Dynamic programming basics
- [ ] Trade-offs between time and space

---

## Live Coding Tips

### 10. During Interview
- [ ] Start with brute force, then optimize
- [ ] Write clean, readable code
- [ ] Use meaningful variable names
- [ ] Test with examples as you code
- [ ] Discuss time/space complexity

---

## Practice Problems

### Partao-Specific
- [ ] Supplier allocation with multiple constraints
- [ ] Real-time inventory synchronization
- [ ] Product search with filters and pagination
- [ ] Price comparison across suppliers
- [ ] Order routing to optimal supplier

### General Practice
- [ ] Debounce/throttle implementation
- [ ] Deep clone object
- [ ] Flatten nested structure
- [ ] Custom Promise.all
- [ ] LRU cache implementation
