"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitModule = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const circuit_service_1 = require("./circuit.service");
const circuit_controller_1 = require("./circuit.controller");
const circuit_algo_runner_service_1 = require("./circuit-algo-runner.service");
const prisma_module_1 = require("../prisma/prisma.module");
const user_module_1 = require("../user/user.module");
const post_module_1 = require("../post/post.module");
let CircuitModule = class CircuitModule {
};
exports.CircuitModule = CircuitModule;
exports.CircuitModule = CircuitModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            user_module_1.UserModule,
            post_module_1.PostModule,
            schedule_1.ScheduleModule.forRoot(),
        ],
        controllers: [circuit_controller_1.CircuitController],
        providers: [circuit_service_1.CircuitService, circuit_algo_runner_service_1.CircuitAlgoRunnerService],
        exports: [circuit_service_1.CircuitService],
    })
], CircuitModule);
//# sourceMappingURL=circuit.module.js.map