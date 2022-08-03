import {ButtonInteraction} from "discord.js";

export abstract class ButtonCommand {
	public abstract run(interaction: ButtonInteraction): Promise<void>;
}