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
"[project]/digital-twin-frontend/src/lib/auth-db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "authDatabase",
    ()=>authDatabase
]);
// Shared mock user database - In production, use a real database
// This is stored in memory during development
const usersDB = new Map();
// Pre-populate with test users for development
usersDB.set('test@example.com', {
    id: 'user_test',
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User'
});
usersDB.set('demo@example.com', {
    id: 'user_demo',
    email: 'demo@example.com',
    password: 'demo12345',
    name: 'Demo User'
});
const authDatabase = {
    getUserByEmail: (email)=>{
        console.log('Looking up user:', email);
        console.log('Users in database:', Array.from(usersDB.keys()));
        return usersDB.get(email);
    },
    createUser: (email, password, name)=>{
        const newUser = {
            id: `user_${Date.now()}`,
            email,
            password,
            name
        };
        usersDB.set(email, newUser);
        console.log('User created:', email);
        console.log('All users now:', Array.from(usersDB.keys()));
        return newUser;
    },
    userExists: (email)=>{
        return usersDB.has(email);
    },
    getAllUsers: ()=>{
        return Array.from(usersDB.values());
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
var __TURBOPACK__imported__module__$5b$project$5d2f$digital$2d$twin$2d$frontend$2f$src$2f$lib$2f$auth$2d$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/digital-twin-frontend/src/lib/auth-db.ts [app-route] (ecmascript)");
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
        if (__TURBOPACK__imported__module__$5b$project$5d2f$digital$2d$twin$2d$frontend$2f$src$2f$lib$2f$auth$2d$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authDatabase"].userExists(email)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$digital$2d$twin$2d$frontend$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                message: 'User with this email already exists'
            }, {
                status: 409
            });
        }
        // Create new user
        const newUser = __TURBOPACK__imported__module__$5b$project$5d2f$digital$2d$twin$2d$frontend$2f$src$2f$lib$2f$auth$2d$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authDatabase"].createUser(email, password, name);
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
        users: __TURBOPACK__imported__module__$5b$project$5d2f$digital$2d$twin$2d$frontend$2f$src$2f$lib$2f$auth$2d$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authDatabase"].getAllUsers()
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__18a06bf2._.js.map