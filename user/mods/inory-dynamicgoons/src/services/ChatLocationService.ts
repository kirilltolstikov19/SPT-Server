import { injectable } from "tsyringe";
import * as fs from "node:fs";
import * as path from "node:path";
import { rotationChanceCalculator } from "./RotationChanceCalculator";

@injectable()
export class ChatLocationService {
  private dataFilePath = path.resolve(__dirname, "../db/rotationData.json");
  private modConfig = require("../../config/config.json");

  public getLocationData(): {
    location: string;
    timeSinceLastSeen: number;
    rotationChance: number;
    dateLastSeen: string;
  } {
    try {
      const data = fs.readFileSync(this.dataFilePath, "utf-8");
      const parsedData = JSON.parse(data);

      if (
        parsedData?.selectedMap &&
        typeof parsedData.lastUpdateTime === "number"
      ) {
        const locationMap: { [key: string]: string } = {
          bigmap: "Customs",
          woods: "Woods",
          shoreline: "Shoreline",
          lighthouse: "Lighthouse",
          tarkovstreets: "Streets of Tarkov",
          interchange: "Interchange",
          sandbox_high: "Ground Zero",
          factory4_day: "Factory Day",
          factory4_night: "Factory Night",
          laboratory: "The Lab",
          rezervbase: "Reserve",
        };

        const location = locationMap[parsedData.selectedMap.toLowerCase()];

        const currentTime = Date.now();
        const timeSinceLastSeen = Math.max(
          0,
          Math.floor((currentTime - parsedData.lastUpdateTime) / 1000 / 60)
        );

        const remainingTime = parsedData.nextUpdateTime - currentTime;
        const rotationChance = this.calculateRotationChance(remainingTime);

        const dateLastSeen = new Date(parsedData.lastUpdateTime).toLocaleString(
          "en-US",
          {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }
        );

        return {
          location,
          timeSinceLastSeen,
          rotationChance,
          dateLastSeen,
        };
      }
        throw new Error("Invalid data format in the JSON file.");
    } catch (error) {
      console.error("Error reading or parsing the JSON file:", error.message);
      throw new Error(
        "Error retrieving location data. Please try again later."
      );
    }
  }

  public calculateRotationChance(remainingTime: number): number {
    return rotationChanceCalculator(
      remainingTime,
      this.modConfig.rotationInterval
    );
  }
}
