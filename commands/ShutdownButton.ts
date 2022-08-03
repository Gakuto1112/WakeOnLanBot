import {ButtonCommand} from "./ButtonCommand";
import {colors, execSSHCommand} from "../WakeOnLanBot";
import {ButtonInteraction} from "discord.js";

export class ShutdownButtonCommand extends ButtonCommand {
	protected readonly COMMAND: string = "shutdown /s /t 0";
	protected readonly DONE_MESSAGE: string = "コンピューターをシャットダウンします。"
	public async run(interaction: ButtonInteraction): Promise<void> {
		await execSSHCommand(this.COMMAND, async (stdout: string) => await interaction.reply(":desktop: " + this.DONE_MESSAGE), async (stderr: string) => {
			console.group(colors.red + "コマンドの実行に失敗しました。" + colors.reset);
			console.error(stderr);
			console.groupEnd();
			await interaction.reply(":x: コマンドの実行に失敗しました。\n" + stderr);
		});
	}
}