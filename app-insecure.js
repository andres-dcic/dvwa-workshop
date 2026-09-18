#!/usr/bin/env node

/**
 * ❌ VULNERABLE APPLICATION - DevSecOps Workshop
 *
 * This app contains multiple security vulnerabilities:
 * 1. SQL Injection - Login
 * 2. IDOR (Insecure Direct Object References) - User profiles
 * 3. XSS (Cross-Site Scripting) - Comments
 * 4. Broken Authentication - Weak credentials
 * 5. Hardcoded Secrets - API keys in code
 * 6. Weak Cryptography - MD5 for passwords
 * 7. CSRF - No token protection
 * 8. Sensitive Data Exposure - Exposed in responses
 */

const express = require('express');
const crypto = require('crypto');
const app = express();

// ========== MIDDLEWARE ==========
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// ========== MOCK DATABASE ==========
const users = [
  {
    id: 1,
    username: 'admin',
    password: '5f4dcc3b5aa765d61d8327deb882cf99', // MD5: "hello" - WEAK!
    email: 'admin@vulnerable.app',
    role: 'admin',
    profile: 'Administrator user',
    credit_card: '4532-1234-5678-9010', // Hardcoded sensitive data!
    ssn: '123-45-6789'
  },
  {
    id: 2,
    username: 'user',
    password: '5f4dcc3b5aa765d61d8327deb882cf99', // MD5: "hello"
    email: 'user@vulnerable.app',
    role: 'user',
    profile: 'Regular user',
    credit_card: '5425-0000-0000-0000',
    ssn: '987-65-4321'
  },
  {
    id: 3,
    username: 'guest',
    password: '5f4dcc3b5aa765d61d8327deb882cf99', // MD5: "hello"
    email: 'guest@vulnerable.app',
    role: 'guest',
    profile: 'Guest user',
    credit_card: '3782-822463-10005',
    ssn: '456-78-9012'
  }
];

const comments = [];

// ========== HARDCODED SECRETS ==========

// ========== HELPER: MD5 Hash (WEAK) ==========
function md5Hash(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

// ========== ROUTE: Home ==========
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Vulnerable App - Workshop</title>
      <style>
        body { font-family: Arial; margin: 40px; background: #f5f5f5; }
        .header { background: #d32f2f; color: white; padding: 20px; border-radius: 5px; }
        .section { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; }
        a { color: #d32f2f; text-decoration: none; margin: 10px; display: inline-block; }
        a:hover { text-decoration: underline; }
        .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🔴 Vulnerable Web Application</h1>
        <p>DevSecOps Workshop - Multiple Security Vulnerabilities</p>
      </div>

      <div class="warning">
        <strong>⚠️ WARNING:</strong> This application contains intentional security vulnerabilities.
        <strong>DO NOT use in production!</strong>
      </div>

      <div class="section">
        <h2>Vulnerabilities to Explore:</h2>
        <ul>
          <li>
            <strong>1. Login (SQL Injection)</strong><br>
            Try: username <code>admin' --</code> password <code>anything</code><br>
            <a href="/login">→ Go to Login</a>
          </li>
          <li>
            <strong>2. User Profiles (IDOR)</strong><br>
            Try: Change user ID in URL (<code>/user/1</code> → <code>/user/2</code>)<br>
            <a href="/user/1">→ View User 1</a> |
            <a href="/user/2">→ View User 2</a> |
            <a href="/user/3">→ View User 3</a>
          </li>
          <li>
            <strong>3. Comments (XSS)</strong><br>
            Try: <code>&lt;script&gt;alert('XSS')&lt;/script&gt;</code><br>
            <a href="/comments">→ Go to Comments</a>
          </li>
          <li>
            <strong>4. API Secrets</strong><br>
            Hardcoded API keys in source code<br>
            <a href="/api/secrets">→ View Secrets (hardcoded!)</a>
          </li>
        </ul>
      </div>

      <div class="section">
        <h2>Scan with Tools:</h2>
        <pre>
# SAST Analysis
semgrep --config=p/owasp-top-ten .

# Dependency Scan
trivy fs .

# Secret Detection
gitleaks detect --source . --verbose
        </pre>
      </div>
    </body>
    </html>
  `);
});

// ========== ROUTE: Login (SQL Injection Vulnerable) ==========
app.get('/login', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Login</title>
      <style>
        body { font-family: Arial; margin: 40px; background: #f5f5f5; }
        form { background: white; padding: 20px; border-radius: 5px; max-width: 400px; }
        input { width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; box-sizing: border-box; }
        button { background: #d32f2f; color: white; padding: 10px; border: none; cursor: pointer; width: 100%; }
        .payload { background: #f0f0f0; padding: 10px; margin: 20px 0; border-radius: 3px; }
      </style>
    </head>
    <body>
      <h1>🔓 Login</h1>

      <form method="POST" action="/login">
        <h2>Login</h2>
        <input type="text" name="username" placeholder="Username" value="admin">
        <input type="password" name="password" placeholder="Password" value="hello">
        <button type="submit">Login</button>
      </form>

      <div class="payload">
        <h3>Try SQL Injection:</h3>
        <p><strong>Username:</strong> <code>admin' --</code></p>
        <p><strong>Password:</strong> <code>anything</code></p>
        <p style="color: red;">This bypasses password check!</p>
      </div>

      <div class="payload">
        <h3>Or try:</h3>
        <p><strong>Username:</strong> <code>admin' OR '1'='1</code></p>
        <p><strong>Password:</strong> <code>anything</code></p>
      </div>
    </body>
    </html>
  `);
});

// ========== ROUTE: Login POST (SQL Injection Vulnerable) ==========
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // ❌ VULNERABLE: Simple string concatenation (SQL Injection!)
  // In real SQL this would be: SELECT * FROM users WHERE username = 'username' AND password = 'password'
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

  console.log('[SQL Query]', query); // Shows the vulnerability!

  // ❌ Check if SQL injection markers are in query
  if (query.includes("'") && (query.includes('--') || query.includes("OR") || query.includes('='))) {
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head><title>SQL Injection Detected</title></head>
      <body style="font-family: Arial; margin: 40px;">
        <h1 style="color: red;">🚨 SQL INJECTION SUCCESSFUL!</h1>
        <p><strong>Query:</strong></p>
        <pre style="background: #f0f0f0; padding: 10px;">${query}</pre>
        <p style="color: red;">✅ Attacker bypassed password check!</p>
        <p><a href="/">← Back</a></p>
      </body>
      </html>
    `);
  }

  // Normal login (if no injection detected)
  const user = users.find(u => u.username === username && u.password === md5Hash(password));

  if (user) {
    return res.send(`
      <h1>✅ Login Successful</h1>
      <p>Welcome ${user.username}!</p>
      <p><a href="/user/${user.id}">View Profile</a></p>
    `);
  }

  res.send('<h1>❌ Login Failed</h1><p><a href="/login">Try Again</a></p>');
});

// ========== ROUTE: User Profile (IDOR Vulnerable) ==========
app.get('/user/:id', (req, res) => {
  const userId = req.params.id;

  // ❌ VULNERABLE: No authorization check!
  // Anyone can view any user profile by changing the ID
  const user = users.find(u => u.id == userId);

  if (!user) {
    return res.status(404).send('<h1>User not found</h1>');
  }

  // ❌ Exposing sensitive data (IDOR + Sensitive Data Exposure)
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>User Profile</title>
      <style>
        body { font-family: Arial; margin: 40px; background: #f5f5f5; }
        .profile { background: white; padding: 20px; border-radius: 5px; }
        .sensitive { color: red; background: #ffe6e6; padding: 10px; margin: 10px 0; border-radius: 3px; }
      </style>
    </head>
    <body>
      <div class="profile">
        <h1>👤 User Profile (ID: ${user.id})</h1>

        <p><strong>Username:</strong> ${user.username}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Role:</strong> ${user.role}</p>
        <p><strong>Profile:</strong> ${user.profile}</p>

        <div class="sensitive">
          <h3>🔴 SENSITIVE DATA EXPOSED:</h3>
          <p><strong>Credit Card:</strong> ${user.credit_card}</p>
          <p><strong>SSN:</strong> ${user.ssn}</p>
          <p style="color: darkred; font-size: 12px;">⚠️ This data should NEVER be exposed to unauthorized users!</p>
        </div>

        <h3>Try IDOR Attack:</h3>
        <p>Change the ID in URL:</p>
        <a href="/user/1">View User 1</a> |
        <a href="/user/2">View User 2</a> |
        <a href="/user/3">View User 3</a>
      </div>
    </body>
    </html>
  `);
});

// ========== ROUTE: Comments (XSS Vulnerable) ==========
app.get('/comments', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Comments</title>
      <style>
        body { font-family: Arial; margin: 40px; background: #f5f5f5; }
        form { background: white; padding: 20px; border-radius: 5px; max-width: 600px; }
        textarea { width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; box-sizing: border-box; }
        button { background: #d32f2f; color: white; padding: 10px; border: none; cursor: pointer; width: 100%; }
        .comment { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #ddd; }
        .payload { background: #f0f0f0; padding: 10px; margin: 20px 0; border-radius: 3px; }
      </style>
    </head>
    <body>
      <h1>💬 Comments Section</h1>

      <form method="POST" action="/comments">
        <textarea name="comment" placeholder="Leave a comment..." rows="5"></textarea>
        <button type="submit">Post Comment</button>
      </form>

      <div class="payload">
        <h3>Try XSS Attack:</h3>
        <p>Paste this in comment: <code>&lt;script&gt;alert('XSS Vulnerable!')&lt;/script&gt;</code></p>
        <p>Or: <code>&lt;img src=x onerror="alert('XSS')"&gt;</code></p>
      </div>

      <h2>Comments:</h2>
      ${comments.map((c, i) => `
        <div class="comment">
          <p><strong>Comment ${i + 1}:</strong></p>
          <p>${c.text}</p>
        </div>
      `).join('')}
    </body>
    </html>
  `);
});

// ========== ROUTE: Comments POST (XSS Vulnerable) ==========
app.post('/comments', (req, res) => {
  const { comment } = req.body;

  // ❌ VULNERABLE: No sanitization, directly stored and displayed!
  comments.push({ text: comment });

  res.redirect('/comments');
});

// ========== ROUTE: API Secrets (Hardcoded Secrets) ==========
app.get('/api/secrets', (req, res) => {
  // ❌ VULNERABLE: Exposing hardcoded secrets via API!
  res.json({
    status: 'success',
    data: {
      aws_secret_key: AWS_SECRET,
      db_password: DB_PASSWORD
    },
    warning: 'These secrets should NEVER be hardcoded in source code!'
  });
});

// ========== ROUTE: Health Check ==========
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════╗
║  🔴 VULNERABLE APPLICATION RUNNING      ║
║  Port: ${PORT}
║  http://localhost:${PORT}
║                                          ║
║  ⚠️  Contains intentional vulnerabilities ║
║  For educational purposes ONLY!         ║
╚══════════════════════════════════════════╝
  `);
});
