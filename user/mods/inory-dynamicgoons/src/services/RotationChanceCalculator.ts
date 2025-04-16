import type { ILogger } from "@spt/models/spt/utils/ILogger";

export function rotationChanceCalculator(
  remainingTime: number,
  rotationInterval: number,
  logger: ILogger | null = null,
  debugLogs: boolean = false
): number {
  const maxTime = rotationInterval * 60 * 1000;
  const maxChance = 100;

  if (remainingTime <= 0) {
    return maxChance;
  }

  const factor = remainingTime / maxTime;

  const steepFactor = factor ** 0.3; // Adjust the rotation chance curve, smaller exponent, slower the initial rise

  const chance = maxChance * (1 - steepFactor ** 1);

  if (debugLogs && logger) {
    logger.info(
      `[Dynamic Goons] Remaining time: ${remainingTime}ms, Rotation chance: ${chance}%`
    );
  }

  return chance;
}
