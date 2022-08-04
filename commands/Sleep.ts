import {BaseCommandInteraction} from "discord.js";
import {colors, isPCAwake, execSSHCommand} from "../WakeOnLanBot";
import {Command} from "./Command";

export class SleepCommand extends Command {
	public async run(interaction: BaseCommandInteraction): Promise<void> {
		if(isPCAwake) {
			await interaction.reply(":desktop: コンピューターを休止状態にします。");
			await execSSHCommand(interaction, "rundll32.exe PowrProf.dll,SetSuspendState", () => {}, async (stderr: string) => {
				console.group(colors.red + "コマンドの実行に失敗しました。" + colors.reset);
				console.error(stderr);
				console.groupEnd();
				await interaction.followUp(":x: コマンドの実行に失敗しました。\n" + stderr);
			});
		}
		else {
			await interaction.reply(":zzz: コンピューターは起動していません。");
		}
	}
}