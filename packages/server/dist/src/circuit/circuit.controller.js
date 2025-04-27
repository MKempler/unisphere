"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const circuit_service_1 = require("./circuit.service");
let CircuitController = class CircuitController {
    constructor(circuitService) {
        this.circuitService = circuitService;
    }
    async createCircuit(createCircuitDto, req) {
        if (createCircuitDto.isAlgo) {
            if (!createCircuitDto.query) {
                throw new common_1.BadRequestException('Algorithmic circuit requires a query');
            }
            try {
                const query = JSON.parse(createCircuitDto.query);
                const result = await this.circuitService.createAlgorithmic(createCircuitDto.name, createCircuitDto.description, req.user.id, query);
                if (!result.ok) {
                    throw new common_1.BadRequestException(result.error);
                }
                return result;
            }
            catch (error) {
                if (error instanceof common_1.BadRequestException) {
                    throw error;
                }
                throw new common_1.BadRequestException('Invalid query format');
            }
        }
        else {
            const result = await this.circuitService.createManual(createCircuitDto.name, createCircuitDto.description, req.user.id);
            if (!result.ok) {
                throw new common_1.BadRequestException(result.error);
            }
            return result;
        }
    }
    async addPost(circuitId, postId, req) {
        if (!postId) {
            throw new common_1.BadRequestException('Post ID is required');
        }
        const result = await this.circuitService.addPost(circuitId, postId, req.user.id);
        if (!result.ok) {
            throw new common_1.BadRequestException(result.error);
        }
        return result;
    }
    async followCircuit(circuitId, req) {
        const result = await this.circuitService.follow(circuitId, req.user.id);
        if (!result.ok) {
            throw new common_1.BadRequestException(result.error);
        }
        return result;
    }
    async unfollowCircuit(circuitId, req) {
        const result = await this.circuitService.unfollow(circuitId, req.user.id);
        if (!result.ok) {
            throw new common_1.BadRequestException(result.error);
        }
        return result;
    }
    async getCircuit(circuitId, req) {
        const result = await this.circuitService.getById(circuitId, req.user.id);
        if (!result.ok) {
            throw new common_1.BadRequestException(result.error);
        }
        return result;
    }
    async listCircuits(req, cursor, limit) {
        const result = await this.circuitService.listDirectory(cursor, limit ? Number(limit) : undefined, req.user.id);
        if (!result.ok) {
            throw new common_1.BadRequestException(result.error);
        }
        return result;
    }
    async getCircuitFeed(circuitId, req, cursor, limit) {
        const result = await this.circuitService.listFeed(circuitId, cursor, limit ? Number(limit) : undefined, req.user.id);
        if (!result.ok) {
            throw new common_1.BadRequestException(result.error);
        }
        return result;
    }
};
exports.CircuitController = CircuitController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new circuit' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Circuit created successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CircuitController.prototype, "createCircuit", null);
__decorate([
    (0, common_1.Post)(':id/add'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Add a post to a circuit' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Post added to circuit successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('postId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], CircuitController.prototype, "addPost", null);
__decorate([
    (0, common_1.Post)(':id/follow'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Follow a circuit' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Circuit followed successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CircuitController.prototype, "followCircuit", null);
__decorate([
    (0, common_1.Post)(':id/unfollow'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Unfollow a circuit' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Circuit unfollowed successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CircuitController.prototype, "unfollowCircuit", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get a circuit by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Circuit retrieved successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CircuitController.prototype, "getCircuit", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'List circuits directory ordered by popularity' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Circuits listed successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('cursor')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number]),
    __metadata("design:returntype", Promise)
], CircuitController.prototype, "listCircuits", null);
__decorate([
    (0, common_1.Get)(':id/feed'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get circuit feed (posts in the circuit)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Circuit feed retrieved successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Query)('cursor')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, Number]),
    __metadata("design:returntype", Promise)
], CircuitController.prototype, "getCircuitFeed", null);
exports.CircuitController = CircuitController = __decorate([
    (0, swagger_1.ApiTags)('circuits'),
    (0, common_1.Controller)('circuits'),
    __metadata("design:paramtypes", [circuit_service_1.CircuitService])
], CircuitController);
//# sourceMappingURL=circuit.controller.js.map