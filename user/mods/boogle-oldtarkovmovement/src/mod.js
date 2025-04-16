"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mod = void 0;
const json5_1 = __importDefault(require("C:/snapshot/project/node_modules/json5"));
const node_path_1 = __importDefault(require("node:path"));
const LogTextColor_1 = require("C:/snapshot/project/obj/models/spt/logging/LogTextColor");
const LogBackgroundColor_1 = require("C:/snapshot/project/obj/models/spt/logging/LogBackgroundColor");
class Mod {
    modConfig;
    preSptLoad(container) {
        const dynamicRouter = container.resolve("DynamicRouterModService");
        const jsonUtil = container.resolve("JsonUtil");
        const logger = container.resolve("WinstonLogger");
        const filesystem = container.resolve("FileSystemSync");
        // Read in the json 5 config content and parse it into json
        const modConfigJson5 = json5_1.default.parse(filesystem.read(node_path_1.default.resolve(__dirname, "../config/settings.jsonc")));
        this.modConfig = modConfigJson5;
        dynamicRouter.registerDynamicRouter("otmGetConfig", [
            {
                url: "/OldTarkovMovement/GetConfig",
                action: async () => {
                    try {
                        return jsonUtil.serialize(modConfigJson5);
                    }
                    catch (e) {
                        console.error("Failed to read config file", e);
                    }
                }
            }
        ], "OldTarkovMovement");
        // This is a terrible, janky way to dynamically have bundles or not
        // It might be evil, but I am tired of dealing with the old animations being a seperate mod
        if (!this.modConfig.NostalgiaMode) {
            logger.logWithColor("[Old Tarkov Movement] Using modern animations", LogTextColor_1.LogTextColor.CYAN);
            filesystem.writeJson(node_path_1.default.resolve(__dirname, "../bundles.json"), {
                manifest: []
            }, null);
        }
        else {
            logger.logWithColor("[Old Tarkov Movement] Using old animations (You may encounter issues with BTR and notice differences in sprinting)", LogTextColor_1.LogTextColor.BLACK, LogBackgroundColor_1.LogBackgroundColor.YELLOW);
            const trueBundlesJson = filesystem.read(node_path_1.default.resolve(__dirname, "../true_bundles.json"));
            filesystem.write(node_path_1.default.resolve(__dirname, "../bundles.json"), trueBundlesJson);
        }
    }
    postDBLoad(container) {
        // get database from server
        const databaseServer = container.resolve("DatabaseServer");
        // Get all the in-memory json found in /assets/database
        const tables = databaseServer.getTables();
    }
}
exports.mod = new Mod();
//# sourceMappingURL=mod.js.map