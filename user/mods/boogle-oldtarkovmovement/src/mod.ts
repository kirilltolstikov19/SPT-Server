import { DependencyContainer } from "tsyringe";
import JSON5 from "json5";
import { IPreSptLoadMod } from "@spt/models/external/IPreSptLoadMod";
import { DynamicRouterModService } from "@spt/services/mod/dynamicRouter/DynamicRouterModService";
import { JsonUtil } from "@spt/utils/JsonUtil";
import path from "node:path";
import { Logger } from "winston";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { LogTextColor } from "@spt/models/spt/logging/LogTextColor";
import { LogBackgroundColor } from "@spt/models/spt/logging/LogBackgroundColor";
import { DatabaseServer } from "@spt/servers/DatabaseServer";
import { IDatabaseTables } from "@spt/models/spt/server/IDatabaseTables";
import { FileSystemSync } from "@spt/utils/FileSystemSync";

class Mod implements IPreSptLoadMod 
{
    private modConfig;

    public preSptLoad(container: DependencyContainer): void 
    {
        const dynamicRouter = container.resolve<DynamicRouterModService>(
            "DynamicRouterModService"
        );
        const jsonUtil = container.resolve<JsonUtil>("JsonUtil");
        const logger = container.resolve<ILogger>("WinstonLogger");

        const filesystem = container.resolve<FileSystemSync>("FileSystemSync");

        // Read in the json 5 config content and parse it into json
        const modConfigJson5 = JSON5.parse(
            filesystem.read(path.resolve(__dirname, "../config/settings.jsonc"))
        );

        this.modConfig = modConfigJson5;

        dynamicRouter.registerDynamicRouter(
            "otmGetConfig",
            [
                {
                    url: "/OldTarkovMovement/GetConfig",
                    action: async () => 
                    {
                        try 
                        {
                            return jsonUtil.serialize(modConfigJson5);
                        }
                        catch (e) 
                        {
                            console.error("Failed to read config file", e);
                        }
                    }
                }
            ],
            "OldTarkovMovement"
        );

        // This is a terrible, janky way to dynamically have bundles or not
        // It might be evil, but I am tired of dealing with the old animations being a seperate mod
        if (!this.modConfig.NostalgiaMode) 
        {
            logger.logWithColor(
                "[Old Tarkov Movement] Using modern animations",
                LogTextColor.CYAN
            );
            filesystem.writeJson(
                path.resolve(__dirname, "../bundles.json"),
                {
                    manifest: []
                },
                null
            );
        }
        else 
        {
            logger.logWithColor(
                "[Old Tarkov Movement] Using old animations (You may encounter issues with BTR and notice differences in sprinting)",
                LogTextColor.BLACK,
                LogBackgroundColor.YELLOW
            );
            const trueBundlesJson = filesystem.read(
                path.resolve(__dirname, "../true_bundles.json")
            );
            filesystem.write(
                path.resolve(__dirname, "../bundles.json"),
                trueBundlesJson
            );
        }
    }

    public postDBLoad(container: DependencyContainer): void 
    {
    // get database from server
        const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");

        // Get all the in-memory json found in /assets/database
        const tables: IDatabaseTables = databaseServer.getTables();
    }
}

export const mod = new Mod();
