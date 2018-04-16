# asr
微信小程序语音识别（ffmpeg + 百度语音识别）

为什么？
======
微信小程序目前支持录音和回放，但是不支持语音识别和理解， 所以诞生了这个项目. 项目目标： 简洁，高效。


前提条件
======
1. 系统需要安装ffmpeg
2. 服务端需自行实现文件上传, 可参考：https://github.com/expressjs/multer


使用方法
======
1. `npm install` 
2. 小程序中使用`recorderManager`实现录音，示例代码：

```
	import wepy from 'wepy';
    import { API } from '../utils/const';
    let recorderManager = wx.getRecorderManager();

    export default class Record extends wepy.page {
        constructor() {
            super();
            let me = this;

            recorderManager.onStart(this.methods.onStart.bind(this));
            recorderManager.onResume(() => {
                console.log('recorder resume')
            });
            recorderManager.onPause(() => {
                console.log('recorder pause')
            });
            recorderManager.onStop(this.methods.onStop.bind(this));
            recorderManager.onFrameRecorded((res) => {
                const { frameBuffer } = res
                console.log('frameBuffer.byteLength', frameBuffer.byteLength)
            });
        }

        methods = {
            onStart() {
                let me = this;
                me.isRecording = true;
                this.$apply();
                console.log('recorder start', me.isRecording)
            },
            onStop(res) {
                let me = this;

                me.isRecording = false;
                me.tempFilePath = res.tempFilePath;
                me.$apply();

                wx.showLoading({
                    title: '识别中...'
                });

                wx.uploadFile({
                    url: API.RECGONIZE, //仅为示例，非真实的接口地址
                    filePath: res.tempFilePath,
                    name: 'myfile',
                    formData:{
                        // 'user': 'test'
                    },
                    success: function(res){
                        wx.hideLoading();

                        var data = JSON.parse(res.data || '{}')
                        
                        console.log(data, data.result);

                        wepy.showModal({
                            content: data.result.toString(),
                            showCancel: false
                        });
                    },
                    fail: error => {
                        wx.hideLoading();
                        console.log(error);
                    }
                });

                console.log('recorder stop', res, me.isRecording)
            },

            recordByManager() {
                const options = {
                    duration: 10000,
                    sampleRate: 16000,
                    numberOfChannels: 1,
                    encodeBitRate: 96000,
                    format: 'aac',
                    frameSize: 50
                };

               if(this.isRecording) {
                    
                    recorderManager.stop();

               } else {

                    this.methods.onStart.call(this);
                    recorderManager.start(options);
               }

            },

            record() {

               if(this.isRecording) {
                    
                    wx.stopRecord();

               } else {

                   this.methods.onStart.call(this);
                   wx.startRecord({
                        success: res => {
                            setTimeout(() => {
                                this.methods.onStop.call(this, res); 
                            }, 50);
                        },
                        fail: res => {
                            //录音失败
                            this.isRecording = false;
                        }
                    });

               }

            }
        }

        data = {
            isRecording: false, 
            tempFilePath: ''
        }
    }
```

3. 服务端调用示例：
```
 	let asr = require('ct-asr');
	let APP_ID = 'xxx'; // 百度语音识别 APP ID
	let API_KEY = "xxx"; // 百度语音识别 APP KEY
	let SECRET_KEY = "xxx"; // 百度语音识别 SECRET
	asr.init({
		APP_ID: APP_ID,
		API_KEY: API_KEY,
		SECRET_KEY: SECRET_KEY
	}).start('小程序录音上传到服务器的音频路径').then(res => {
		console.log('Result is: ', res);
	});
```
