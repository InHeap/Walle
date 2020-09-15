import * as bunyan from 'bunyan';
import * as bunyanFormat from 'bunyan-format';

const log = bunyan.createLogger({
	name: 'fantasy-api',
	stream: bunyanFormat({ outputMode: 'short' })
});

export default log;
