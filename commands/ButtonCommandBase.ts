import {ButtonInteraction} from "discord.js";

export abstract class ButtonCommandBase {
	public abstract run(interaction: ButtonInteraction): Promise<void>;
}