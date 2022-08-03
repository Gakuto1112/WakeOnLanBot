import {BaseCommandInteraction} from "discord.js";

export abstract class Command {
	public abstract run(interaction: BaseCommandInteraction): Promise<void>;
}