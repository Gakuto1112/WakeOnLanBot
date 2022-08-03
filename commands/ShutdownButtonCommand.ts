import {ButtonCommand} from "./ButtonCommand";
import {colors, execSSHCommand} from "../WakeOnLanBot";
import {ButtonInteraction} from "discord.js";

export class ShutdownButtonCommand extends ButtonCommand {
	public async run(interaction: ButtonInteraction): Promise<void> {
		await execSSHCommand("shutdown /s /t 60 /c \"マジックパケット送信Botによりシャットダウンが実行されました。\"", async (stdout: string) => await interaction.reply(":desktop: コンピューターをシャットダウンします。"), async (stderr: string) => {
			console.group(colors.red + "コマンドの実行に失敗しました。" + colors.reset);
			console.error(stderr);
			console.groupEnd();
			await interaction.reply(":x: コマンドの実行に失敗しました。\n" + stderr);
		});
	}
}