import * as fs from 'fs';

interface IConfig {
	port: number;
	// [propName: string]: any;
}

var config: IConfig = JSON.parse(fs.readFileSync(process.env["HEAP_HOME"] + '/config/walle/config.json', 'utf8'));

export default config;
