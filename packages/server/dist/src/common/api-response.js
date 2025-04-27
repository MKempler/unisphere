"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponse = void 0;
class ApiResponse {
    constructor(ok, data, error) {
        this.ok = ok;
        this.data = data;
        this.error = error;
    }
    static success(data) {
        return new ApiResponse(true, data);
    }
    static error(error) {
        return new ApiResponse(false, undefined, error);
    }
}
exports.ApiResponse = ApiResponse;
//# sourceMappingURL=api-response.js.map