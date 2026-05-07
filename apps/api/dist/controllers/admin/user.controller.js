"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateStatus = exports.updateRole = exports.getUserById = exports.getUsers = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const user_service_js_1 = require("../../services/admin/user.service.js");
const getUsersSchema = zod_1.z.object({
    role: zod_1.z.nativeEnum(client_1.UserRole).optional(),
    status: zod_1.z.nativeEnum(client_1.UserStatus).optional(),
    search: zod_1.z.string().optional(),
    page: zod_1.z.coerce.number().positive().optional(),
    limit: zod_1.z.coerce.number().positive().optional(),
});
const getUsers = async (req, res, next) => {
    try {
        const input = getUsersSchema.parse(req.query);
        const result = await user_service_js_1.adminUserService.getUsers(input);
        res.json({ success: true, ...result });
    }
    catch (error) {
        next(error);
    }
};
exports.getUsers = getUsers;
const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await user_service_js_1.adminUserService.getUserById(id);
        res.json({ success: true, data: user });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserById = getUserById;
const updateRole = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role } = zod_1.z.object({ role: zod_1.z.nativeEnum(client_1.UserRole) }).parse(req.body);
        const user = await user_service_js_1.adminUserService.updateRole(id, role, req.user.userId);
        res.json({ success: true, data: user });
    }
    catch (error) {
        next(error);
    }
};
exports.updateRole = updateRole;
const updateStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = zod_1.z.object({ status: zod_1.z.nativeEnum(client_1.UserStatus) }).parse(req.body);
        const user = await user_service_js_1.adminUserService.updateStatus(id, status, req.user.userId);
        res.json({ success: true, data: user });
    }
    catch (error) {
        next(error);
    }
};
exports.updateStatus = updateStatus;
const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        await user_service_js_1.adminUserService.deleteUser(id, req.user.userId);
        res.json({ success: true, message: 'Користувача видалено' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteUser = deleteUser;
//# sourceMappingURL=user.controller.js.map