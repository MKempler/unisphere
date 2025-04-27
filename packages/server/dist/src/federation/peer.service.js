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
var PeerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeerService = void 0;
const common_1 = require("@nestjs/common");
let PeerService = PeerService_1 = class PeerService {
    constructor() {
        this.logger = new common_1.Logger(PeerService_1.name);
        this.peers = [];
        this.initPeers();
    }
    initPeers() {
        const peersEnv = process.env.PEERS;
        if (!peersEnv) {
            this.logger.log('No peers configured');
            return;
        }
        const peers = peersEnv.split(',').map(p => p.trim()).filter(Boolean);
        this.peers.push(...peers);
        this.logger.log(`Initialized with ${this.peers.length} peers`);
    }
    getPeers() {
        return [...this.peers];
    }
};
exports.PeerService = PeerService;
exports.PeerService = PeerService = PeerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PeerService);
//# sourceMappingURL=peer.service.js.map