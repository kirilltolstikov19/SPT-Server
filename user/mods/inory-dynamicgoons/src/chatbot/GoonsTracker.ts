import { inject, injectable } from "tsyringe";

import { MemberCategory } from "@spt/models/enums/MemberCategory";
import type { MailSendService } from "@spt/services/MailSendService";
import type { IUserDialogInfo } from "@spt/models/eft/profile/IUserDialogInfo";
import type { IDialogueChatBot } from "@spt/helpers/Dialogue/IDialogueChatBot";
import type { ISendMessageRequest } from "@spt/models/eft/dialog/ISendMessageRequest";
import type { ChatLocationService } from "../services/ChatLocationService";

@injectable()
export class GoonsTracker implements IDialogueChatBot {
  constructor(
    @inject("MailSendService") protected mailSendService: MailSendService,
    @inject("ChatLocationService") private locationService: ChatLocationService
  ) {}

  public getChatBot(): IUserDialogInfo {
    return {
      _id: "674d96b02225f02fff47b3be",
      aid: 777,
      Info: {
        Level: 1,
        MemberCategory: MemberCategory.SHERPA,
        SelectedMemberCategory: MemberCategory.SHERPA,
        Nickname: "Goons Tracker",
        Side: "Usec",
      },
    };
  }

  public handleMessage(sessionId: string, request: ISendMessageRequest): string
  {
      if (request.text === "goons track") {
        try {
          const locationData = this.locationService.getLocationData();
  
          const responseMessage =
            `Location: ${locationData.location}\n` +
            `Last Seen: ${locationData.timeSinceLastSeen} minutes ago\n` +
            `Rotation Chance: ${locationData.rotationChance.toFixed(2)}%\n` +
            `${locationData.dateLastSeen}`;
  
          this.mailSendService.sendUserMessageToPlayer(
            sessionId,
            this.getChatBot(),
            responseMessage
          );
        } catch (error) {
          console.error("Error in handle:", error.message);
          this.mailSendService.sendUserMessageToPlayer(
            sessionId,
            this.getChatBot(),
            "Error retrieving location data. Please try again later."
          );
        }
      } else if (request.text === "goons rotation") {
        const rotationExplanation =
          "The Goons stay on a map for a variable amount of time. " +
          "As time passes, the chance of them switching to a new " +
          "map increases. They will rotate to a new map at the end of a raid based on this chance. " +
          "Use goons track to see where they are currently and their rotation chance.";
  
        this.mailSendService.sendUserMessageToPlayer(
          sessionId,
          this.getChatBot(),
          rotationExplanation
        );
      } else {
        this.mailSendService.sendUserMessageToPlayer(
          sessionId,
          this.getChatBot(),
          "Unrecognized command, please type 'goons track' to receive details of The Goon's location. " +
          "Or type 'goons rotation' if you need an explanation for their rotation mechanic."
        );
      }
  
      return request.dialogId;
  }
}
