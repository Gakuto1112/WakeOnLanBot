import { ShutdownButtonCommand } from "./ShutdownButton";

export class RebootButtonCommand extends ShutdownButtonCommand {
	protected readonly COMMAND: string = "shutdown /r /t 0";
	protected readonly DONE_MESSAGE: string = "コンピューターを再起動します。"
}