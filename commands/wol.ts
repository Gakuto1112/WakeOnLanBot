import {CommandBase} from "./CommandBase";
import {colors,settings} from "../WakeOnLanBot";
import child_process from "child_process";
import {BaseCommandInteraction} from "discord.js";

export class Command extends CommandBase {
	public async run(interaction: BaseCommandInteraction): Promise<void> {
		console.info("マジックパケットを送信します。");
		await interaction.reply(":loudspeaker: マジックパケットを送信します");
		child_process.exec("sudo etherwake " + settings.targetMacAddress, async (error: child_process.ExecException | null, stdout: string, stderr: string) => {
			if(error) {
				console.group(colors.red + "マジックパケットの送信に失敗しました。" + colors.reset);
				console.error(stderr);
				console.groupEnd();
				await interaction.followUp(":x: マジックパケットの送信に失敗しました\n" + stderr);
			}
		});
	}
}