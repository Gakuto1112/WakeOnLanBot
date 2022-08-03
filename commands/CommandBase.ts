import {BaseCommandInteraction} from "discord.js";

export abstract class CommandBase {
	public abstract run(interaction: BaseCommandInteraction): Promise<void>;
}