import {Command} from "./Command";
import {colors, settings, isPCAwake} from "../WakeOnLanBot";
import * as child_process from "child_process";
import {BaseCommandInteraction} from "discord.js";

export class WolCommand extends Command {
	public async run(interaction: BaseCommandInteraction): Promise<void> {
		if(isPCAwake) await interaction.reply(":sunny: コンピューターは既に起動しています。")
		else {
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
}