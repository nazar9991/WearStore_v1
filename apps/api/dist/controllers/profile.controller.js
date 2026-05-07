"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAddress = exports.updateAddress = exports.addAddress = exports.getAddresses = exports.changePassword = exports.updateProfile = exports.getProfile = void 0;
const zod_1 = require("zod");
const profile_service_js_1 = require("../services/profile.service.js");
const updateProfileSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(2).optional(),
    lastName: zod_1.z.string().min(2).optional(),
    phone: zod_1.z.string().optional(),
});
const changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string(),
    newPassword: zod_1.z.string().min(8),
});
const addressSchema = zod_1.z.object({
    label: zod_1.z.string().min(1),
    city: zod_1.z.string().min(1),
    street: zod_1.z.string().min(1),
    building: zod_1.z.string().min(1),
    apartment: zod_1.z.string().optional(),
    postalCode: zod_1.z.string().min(1),
    isDefault: zod_1.z.boolean().optional(),
});
const getProfile = async (req, res, next) => {
    try {
        const profile = await profile_service_js_1.profileService.getProfile(req.user.userId);
        res.json({ success: true, data: profile });
    }
    catch (error) {
        next(error);
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res, next) => {
    try {
        const input = updateProfileSchema.parse(req.body);
        const profile = await profile_service_js_1.profileService.updateProfile(req.user.userId, input);
        res.json({ success: true, data: profile });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProfile = updateProfile;
const changePassword = async (req, res, next) => {
    try {
        const input = changePasswordSchema.parse(req.body);
        await profile_service_js_1.profileService.changePassword(req.user.userId, input);
        res.json({ success: true, message: 'Пароль успішно змінено' });
    }
    catch (error) {
        next(error);
    }
};
exports.changePassword = changePassword;
const getAddresses = async (req, res, next) => {
    try {
        const addresses = await profile_service_js_1.profileService.getAddresses(req.user.userId);
        res.json({ success: true, data: addresses });
    }
    catch (error) {
        next(error);
    }
};
exports.getAddresses = getAddresses;
const addAddress = async (req, res, next) => {
    try {
        const input = addressSchema.parse(req.body);
        const address = await profile_service_js_1.profileService.addAddress(req.user.userId, input);
        res.status(201).json({ success: true, data: address });
    }
    catch (error) {
        next(error);
    }
};
exports.addAddress = addAddress;
const updateAddress = async (req, res, next) => {
    try {
        const { id } = req.params;
        const input = addressSchema.parse(req.body);
        const address = await profile_service_js_1.profileService.updateAddress(req.user.userId, id, input);
        res.json({ success: true, data: address });
    }
    catch (error) {
        next(error);
    }
};
exports.updateAddress = updateAddress;
const deleteAddress = async (req, res, next) => {
    try {
        const { id } = req.params;
        await profile_service_js_1.profileService.deleteAddress(req.user.userId, id);
        res.json({ success: true, message: 'Адресу видалено' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteAddress = deleteAddress;
//# sourceMappingURL=profile.controller.js.map