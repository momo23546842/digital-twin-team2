module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[project]/digital-twin-frontend/src/lib/persistent-auth-db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "persistentAuthDB",
    ()=>persistentAuthDB
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
;
;
const DB_FILE = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.cwd(), 'users-db.json');
// Initialize database with default users
function initializeDB() {
    try {
        if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(DB_FILE)) {
            const data = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(DB_FILE, 'utf-8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error reading database:', error);
    }
    // Default database with test users
    const defaultDB = {
        users: [
            {
                id: 'user_test',
                email: 'test@example.com',
                password: 'password123',
                name: 'Test User'
            },
            {
                id: 'user_demo',
                email: 'demo@example.com',
                password: 'demo12345',
                name: 'Demo User'
            }
        ]
    };
    try {
        __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].writeFileSync(DB_FILE, JSON.stringify(defaultDB, null, 2));
    } catch (error) {
        console.error('Error writing default database:', error);
    }
    return defaultDB;
}
// Read current database
function readDB() {
    try {
        if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(DB_FILE)) {
            const data = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(DB_FILE, 'utf-8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error reading database:', error);
    }
    return initializeDB();
}
// Write to database
function writeDB(db) {
    try {
        __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
    } catch (error) {
        console.error('Error writing database:', error);
    }
}
const persistentAuthDB = {
    getUserByEmail: (email)=>{
        const db = readDB();
        return db.users.find((u)=>u.email === email);
    },
    createUser: (email, password, name)=>{
        const db = readDB();
        const newUser = {
            id: `user_${Date.now()}`,
            email,
            password,
            name
        };
        db.users.push(newUser);
        writeDB(db);
        console.log('User created and persisted:', email);
        return newUser;
    },
    userExists: (email)=>{
        const db = readDB();
        return db.users.some((u)=>u.email === email);
    },
    getAllUsers: ()=>{
        const db = readDB();
        return db.users;
    }
};
}),
"[project]/digital-twin-frontend/src/app/api/auth/signup/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$digital$2d$twin$2d$frontend$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/digital-twin-frontend/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$digital$2d$twin$2d$frontend$2f$src$2f$lib$2f$persistent$2d$auth$2d$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/digital-twin-frontend/src/lib/persistent-auth-db.ts [app-route] (ecmascript)");
;
;
// Simple JWT-like token generator (In production, use proper JWT)
function generateToken(userId, email) {
    const header = btoa(JSON.stringify({
        alg: 'HS256',
        typ: 'JWT'
    }));
    const payload = btoa(JSON.stringify({
        userId,
        email,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60
    }));
    const signature = btoa(`${header}.${payload}`);
    return `${header}.${payload}.${signature}`;
}
async function POST(request) {
    try {
        const body = await request.json();
        const { email, password, name } = body;
        // Validation
        if (!email || !password || !name) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$digital$2d$twin$2d$frontend$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                message: 'Email, password, and name are required'
            }, {
                status: 400
            });
        }
        if (password.length < 8) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$digital$2d$twin$2d$frontend$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                message: 'Password must be at least 8 characters long'
            }, {
                status: 400
            });
        }
        // Check if user already exists
        if (__TURBOPACK__imported__module__$5b$project$5d2f$digital$2d$twin$2d$frontend$2f$src$2f$lib$2f$persistent$2d$auth$2d$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["persistentAuthDB"].userExists(email)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$digital$2d$twin$2d$frontend$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                message: 'User with this email already exists'
            }, {
                status: 409
            });
        }
        // Create new user
        const newUser = __TURBOPACK__imported__module__$5b$project$5d2f$digital$2d$twin$2d$frontend$2f$src$2f$lib$2f$persistent$2d$auth$2d$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["persistentAuthDB"].createUser(email, password, name);
        // Generate token
        const token = generateToken(newUser.id, newUser.email);
        // Create response with token in cookie
        const response = __TURBOPACK__imported__module__$5b$project$5d2f$digital$2d$twin$2d$frontend$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            message: 'Account created successfully',
            token,
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name
            }
        }, {
            status: 201
        });
        // Set auth token in cookie
        response.cookies.set('auth_token', token, {
            httpOnly: false,
            secure: ("TURBOPACK compile-time value", "development") === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60
        });
        return response;
    } catch (error) {
        console.error('Signup error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$digital$2d$twin$2d$frontend$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            message: 'Internal server error'
        }, {
            status: 500
        });
    }
}
function GET() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$digital$2d$twin$2d$frontend$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        message: 'This endpoint accepts POST requests only',
        users: __TURBOPACK__imported__module__$5b$project$5d2f$digital$2d$twin$2d$frontend$2f$src$2f$lib$2f$persistent$2d$auth$2d$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["persistentAuthDB"].getAllUsers()
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__c6bc5f03._.js.map