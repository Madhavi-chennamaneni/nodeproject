const camera = function () {
    let width = 1000;
    let height = 1000;
    // const form = new FormData();
    let count=0;
    const createObjects = function () {   
        const video = document.createElement('video');
        video.id = 'video';
        video.width = 1000;
        video.height = 1000;
        video.autoplay = true;
        document.body.appendChild(video);
    
        const canvas = document.createElement('canvas');
        canvas.id = 'canvas';
        canvas.width = 1000;
        canvas.height = 1000;
        document.body.appendChild(canvas);

    }    
    return {
        video: null,
        context: null,
        canvas: null,
        startCamera: function () {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {   
                createObjects();    
                this.video = document.getElementById('video');
                this.canvas = document.getElementById('canvas');
                this.context = this.canvas.getContext('2d');
                (function (video) {
                    navigator.mediaDevices.getUserMedia({video: true}).then(function (stream) {
                        video.srcObject = stream;
                        video.play();
                    });
                })(this.video)
    
            }
        },    
        takeSnapshot: function () {
            this.canvas.getContext('2d').drawImage(this.video, 0, 0, 1000,1000);
            
            if (this.canvas.toBlob) {
                this.canvas.toBlob(function (blob) {                    
                    var form = new FormData();
              form.append('file', blob, `camera${count}.jpg`)
              count++;
              try {
                fetch('http://localhost:3005/api/upload', {
                    method: 'POST',
                    body: form,
                }).then(res=>{console.log(res.body)}).catch(err=>{console.log(err)})
            } catch (error) {
                console.error(error);
            }      
            }, 'image/jpeg')
          } 

        }
    
    }
    }();
    
    export default camera;