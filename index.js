import process from 'node:process';
import onetime from 'onetime';
import signalExit from 'signal-exit';

const terminal = process.stderr.isTTY ? process.stderr :
	process.stdout.isTTY ? process.stdout :
		null;

const restoreCursor = terminal ? onetime(() => {
	signalExit(() => {
		terminal.write('\u001B[?25h');
	}, {alwaysLast: true});
}) : () => {};

export default restoreCursor;
