var execSync = require("child_process").execSync;
var fs = require('fs');
const path = require("path");
const parserSHPATH = path.join(__dirname, "../scripts/parse.sh");
let AipSpeechClient = require("baidu-aip-sdk").speech;
let client;

// ASR
// 根据文件FILE的后缀填写：pcm / wav / amr
let FORMAT = "pcm";
// 根据文档填写PID，1537 表示识别普通话，使用输入法模型。1536表示识别普通话，使用搜索模型
let DEV_PID = "1537";

let methods = {

	init(config) {
		// 新建一个对象，建议只保存一个对象调用服务接口
		client = new AipSpeechClient(config.APP_ID, config.API_KEY, config.SECRET_KEY);
		return this;
	},

	start(audioPath) {
		let convertWav = this.generateWAV(audioPath);

		if (convertWav) {

			let voice = fs.readFileSync(audioPath + '.pcm');
			let voiceBuffer = new Buffer(voice);

			// 识别本地文件，附带参数
			let result;

			console.log('Start to recognize: ', audioPath)
			await client.recognize(voiceBuffer, FORMAT, 16000, { dev_pid: DEV_PID, ctp: 1 })
				.then(res => {
					return result = res;

					console.log('<recognize>: ' + JSON.stringify(res));
				}, err => {
					console.log(err);
				});

			return result;
		}

		return {
			code: 601,
			msg: 'Convert wav error'
		};
	},

	adoptVoice(audioPath) {
		console.info("Start generate wav audio: ", audioPath);

		if (fs.existsSync(audioPath)) {
			// Do something
			let result = execSync(parserSHPATH + ' ' + audioPath);

			console.log(result);

			return result;
		}

		return new Error(audioPath + ' is not existed.')
	
	}
}