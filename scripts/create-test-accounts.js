"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTestAccounts = createTestAccounts;
var _a = require("../lib/db"), sql = _a.sql, hashPassword = _a.hashPassword;
var testUsers = [
    // Faculty users
    {
        role: "faculty",
        firstName: "John",
        lastName: "Smith",
        email: "john.smith@faculty.test",
        password: "password123",
        facultyId: "FAC001",
        department: "Computer Science",
        specialization: "Machine Learning",
        dateOfJoining: "2020-01-15",
        dateOfBirth: "1980-05-10",
    },
    {
        role: "faculty",
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah.johnson@faculty.test",
        password: "password123",
        facultyId: "FAC002",
        department: "Electronics",
        specialization: "Signal Processing",
        dateOfJoining: "2019-08-20",
        dateOfBirth: "1975-12-03",
    },
    {
        role: "faculty",
        firstName: "Michael",
        lastName: "Brown",
        email: "michael.brown@faculty.test",
        password: "password123",
        facultyId: "FAC003",
        department: "Mechanical Engineering",
        specialization: "Robotics",
        dateOfJoining: "2021-03-10",
        dateOfBirth: "1982-09-15",
    },
    // Student users
    {
        role: "student",
        firstName: "Alice",
        lastName: "Wilson",
        email: "alice.wilson@student.test",
        password: "password123",
        registrationNumber: "STU001",
        department: "Computer Science",
        year: "3",
        cgpa: "8.5",
    },
    {
        role: "student",
        firstName: "Bob",
        lastName: "Davis",
        email: "bob.davis@student.test",
        password: "password123",
        registrationNumber: "STU002",
        department: "Electronics",
        year: "2",
        cgpa: "7.8",
    },
    {
        role: "student",
        firstName: "Carol",
        lastName: "Miller",
        email: "carol.miller@student.test",
        password: "password123",
        registrationNumber: "STU003",
        department: "Mechanical Engineering",
        year: "4",
        cgpa: "9.1",
    },
    {
        role: "student",
        firstName: "David",
        lastName: "Garcia",
        email: "david.garcia@student.test",
        password: "password123",
        registrationNumber: "STU004",
        department: "Computer Science",
        year: "1",
        cgpa: "8.0",
    },
];
function createTestAccounts() {
    return __awaiter(this, void 0, void 0, function () {
        var _i, testUsers_1, user, existingUser, passwordHash, userResult, userId, error_1, userCounts, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 14, , 15]);
                    console.log("🚀 Creating test accounts...");
                    _i = 0, testUsers_1 = testUsers;
                    _a.label = 1;
                case 1:
                    if (!(_i < testUsers_1.length)) return [3 /*break*/, 12];
                    user = testUsers_1[_i];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 10, , 11]);
                    return [4 /*yield*/, sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n          SELECT id FROM users WHERE email = ", "\n        "], ["\n          SELECT id FROM users WHERE email = ", "\n        "])), user.email)];
                case 3:
                    existingUser = _a.sent();
                    if (existingUser.length > 0) {
                        console.log("\u23ED\uFE0F  User ".concat(user.email, " already exists, skipping..."));
                        return [3 /*break*/, 11];
                    }
                    return [4 /*yield*/, hashPassword(user.password)
                        // Create user
                    ];
                case 4:
                    passwordHash = _a.sent();
                    return [4 /*yield*/, sql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n          INSERT INTO users (role, first_name, last_name, email, password_hash)\n          VALUES (", ", ", ", ", ", ", ", ", ")\n        "], ["\n          INSERT INTO users (role, first_name, last_name, email, password_hash)\n          VALUES (", ", ", ", ", ", ", ", ", ")\n        "])), user.role, user.firstName, user.lastName, user.email, passwordHash)];
                case 5:
                    userResult = _a.sent();
                    userId = userResult.insertId;
                    if (!(user.role === "faculty")) return [3 /*break*/, 7];
                    return [4 /*yield*/, sql(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n            INSERT INTO faculty_profiles (\n              user_id, faculty_id, department, specialization, \n              date_of_joining, date_of_birth\n            )\n            VALUES (\n              ", ", ", ", ", ", \n              ", ", ", ", ", "\n            )\n          "], ["\n            INSERT INTO faculty_profiles (\n              user_id, faculty_id, department, specialization, \n              date_of_joining, date_of_birth\n            )\n            VALUES (\n              ", ", ", ", ", ", \n              ", ", ", ", ", "\n            )\n          "])), userId, user.facultyId, user.department, user.specialization, user.dateOfJoining, user.dateOfBirth)];
                case 6:
                    _a.sent();
                    return [3 /*break*/, 9];
                case 7: return [4 /*yield*/, sql(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n            INSERT INTO student_profiles (\n              user_id, registration_number, department, year, cgpa\n            )\n            VALUES (\n              ", ", ", ", ", ", \n              ", ", ", "\n            )\n          "], ["\n            INSERT INTO student_profiles (\n              user_id, registration_number, department, year, cgpa\n            )\n            VALUES (\n              ", ", ", ", ", ", \n              ", ", ", "\n            )\n          "])), userId, user.registrationNumber, user.department, user.year, user.cgpa)];
                case 8:
                    _a.sent();
                    _a.label = 9;
                case 9:
                    console.log("\u2705 Created ".concat(user.role, ": ").concat(user.firstName, " ").concat(user.lastName, " (").concat(user.email, ")"));
                    return [3 /*break*/, 11];
                case 10:
                    error_1 = _a.sent();
                    console.error("\u274C Failed to create user ".concat(user.email, ":"), error_1);
                    return [3 /*break*/, 11];
                case 11:
                    _i++;
                    return [3 /*break*/, 1];
                case 12: return [4 /*yield*/, sql(templateObject_5 || (templateObject_5 = __makeTemplateObject(["\n      SELECT \n        role,\n        COUNT(*) as count\n      FROM users \n      GROUP BY role\n    "], ["\n      SELECT \n        role,\n        COUNT(*) as count\n      FROM users \n      GROUP BY role\n    "])))];
                case 13:
                    userCounts = _a.sent();
                    console.log("\n📊 User Summary:");
                    userCounts.forEach(function (row) {
                        console.log("   ".concat(row.role, ": ").concat(row.count, " users"));
                    });
                    console.log("\n🎉 Test accounts created successfully!");
                    console.log("\n📋 Test Credentials:");
                    console.log("Faculty Accounts:");
                    testUsers
                        .filter(function (u) { return u.role === "faculty"; })
                        .forEach(function (u) {
                        console.log("   \uD83D\uDCE7 ".concat(u.email, " | \uD83D\uDD11 ").concat(u.password));
                    });
                    console.log("Student Accounts:");
                    testUsers
                        .filter(function (u) { return u.role === "student"; })
                        .forEach(function (u) {
                        console.log("   \uD83D\uDCE7 ".concat(u.email, " | \uD83D\uDD11 ").concat(u.password));
                    });
                    return [3 /*break*/, 15];
                case 14:
                    error_2 = _a.sent();
                    console.error("❌ Failed to create test accounts:", error_2);
                    process.exit(1);
                    return [3 /*break*/, 15];
                case 15: return [2 /*return*/];
            }
        });
    });
}
// Run if called directly
if (require.main === module) {
    createTestAccounts()
        .then(function () {
        console.log("✨ All done!");
        process.exit(0);
    })
        .catch(function (error) {
        console.error("💥 Failed:", error);
        process.exit(1);
    });
}
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5;
