import { ShutDownCommand } from "./Shutdown";

export class RebootCommand extends ShutDownCommand {
	protected readonly CONFIRM_MESSAGE: string = "コンピューターを再起動しますか？未保存のデータは失われます。";
	protected readonly CONFIRM_BUTTON_ID: string = "reboot_confirm";
	protected readonly CONFIRM_BUTTON_LABEL: string = "再起動";
}