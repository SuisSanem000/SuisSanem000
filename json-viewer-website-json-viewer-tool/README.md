# Dadroit Website - JSON Viewer Product Site

A comprehensive marketing and sales platform for Dadroit Desktop JSON Viewer, featuring user authentication, licensing management, and a technical blog.

## Tech Stack

- **React / Next.js** - Frontend framework
- **JavaScript** - Core scripting language
- **Axios** - HTTP client for API communication
- **RESTful API** - Backend integration

## Purpose

This website serves as the primary marketing, sales, and support platform for the Dadroit Desktop JSON Viewer product. It handles user registration, account management, license purchasing, and provides educational content through technical articles. As a key project early in my career (2020), I was responsible for both initial development and ongoing maintenance/feature additions.

## Main Features

- User registration and authentication system
- License purchase and upgrade workflows
- Seat management for multi-device licenses
- Email verification and password reset
- Billing portal integration (likely Stripe)
- Technical blog with 12+ articles
- Contact form and support system
- Account deletion and subscription management
- RESTful API architecture

## Complex Features - Technical Details

### 1. Comprehensive Authentication System
Full user lifecycle management from registration to account deletion.

**Technical Implementation:**
```javascript
apiLogin(email, password, device) {
    const res = axios.post('/api/user/login', { email, password, device });
    setupUserProfile(res.data.access_token, null);
}
```

- Token-based authentication with access tokens
- localStorage persistence for session management
- Device identification for license seat tracking
- Email verification workflow
- Password reset with token validation

### 2. License and Seat Management System
Multi-tier licensing with device seat allocation and management.

**Technical Implementation:**
- Seat request/revoke API endpoints
- Device ID tracking per seat
- Downloadable license files per device
- License upgrade path from lower to higher tiers
- Billing portal redirect for subscription changes

**Key Operations:**
```javascript
apiRequestSeat(deviceId, deviceName) // Allocate new seat
apiRevokeSeat(deviceId) // Free up seat
apiDownloadSeat(deviceId) // Get license file
apiLicenseUpgrade() // Upgrade to higher tier
```

### 3. FormData-Based API Layer
Consistent API communication using form-encoded data.

**Technical Implementation:**
```javascript
JSONToFormData(json) {
    let fd = new FormData();
    for (const [key, value] of Object.entries(json)) 
        if (value) fd.append(key, value);
    return fd;
}
```

- Converts JSON to FormData for backend compatibility
- Filters out null/undefined values
- Content-Type: `application/x-www-form-urlencoded`
- Axios interceptor for authentication header injection

### 4. Event Logging and Analytics
User behavior tracking with anonymous UID generation.

**Technical Implementation:**
```javascript
getUserUid() {
    if (!localStorage.getItem("uid")) {
        localStorage.setItem("uid", crypto.randomUUID());
    }
    return localStorage.getItem("uid");
}
```

- UUID v4 generation for anonymous tracking
- Event logging with custom metadata
- Page view tracking
- Action tracking (downloads, purchases, etc.)

## System Design Approach

**API Client Architecture**
- Centralized API module (`api.js`)
- All backend communication abstracted into functions
- Consistent error handling across endpoints
- Token management separated from  business logic

**Client-Side State Management**
- localStorage for auth tokens and user profile
- Session persistence across page reloads
- Profile caching to reduce API calls
- Clear state on logout

**JAMstack Architecture**
- Static site generation for blog content
- Client-side rendering for dynamic features
- API calls for user-specific data
- CDN delivery for performance

## Algorithms & Data Structures

**Data Structures:**

- **User Profile Object**
  ```javascript
  { first_name, last_name, email, company, isVerified }
  ```
  - Cach ed in localStorage as serialized JSON

- **License Object**
  ```javascript
  { type, seats[], expiryDate, tier }
  ```

- **Seat Array**
  ```javascript
  [{ device_id, device_name, requestedAt, status }]
  ```

**Algorithms:**

- **Token Refresh Pattern**
  - Check token on each API call
  - Redirect to login if expired
  - Store new tokens from successful auth

- **Form Validation**
  - Client-side validation before API submission
  - Email format regex validation
  - Password strength requirements

- **UUID Generation**
  - Crypto.randomUUID() for anonymous user tracking
  - Persistent storage in localStorage
  - Used for analytics correlation
