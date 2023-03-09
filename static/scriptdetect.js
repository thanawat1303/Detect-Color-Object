document.addEventListener("DOMContentLoaded" , ()=>{
    let Color = ""
    let stats = new Stats()
    stats.showPanel(0)
    document.getElementById('container').appendChild(stats.domElement);
    document.getElementById('select-color').addEventListener('change' , (e)=>{
        // fetch(`/select/${e.target.value}`)
        Color = e.target.value
    })

    let media = navigator.mediaDevices
    let videoDC = document.getElementById("video-detect")
    media.getUserMedia({
        video: true,
        audio:false
    }).then((videoStr)=>{
        videoDC.srcObject = videoStr
        videoDC.play()
    })

    let src = null , out = null , vid = null
    let FPS = 30

    videoDC.addEventListener("canplay" , ()=>{
        videoDC.height = videoDC.videoHeight
        videoDC.width = videoDC.videoWidth
        src = new cv.Mat(videoDC.videoHeight , videoDC.videoWidth , cv.CV_8UC4) //create frame source video
        out = new cv.Mat(videoDC.videoHeight , videoDC.videoWidth , cv.CV_8UC3) //create frame source to output
        vid = new cv.VideoCapture(videoDC)
        requestAnimationFrame(renderDetect)
        function renderDetect() {
            stats.begin()
            vid.read(src) //Read video put to frame
            let hsv = rgba2hsv(src , out)
            let output = detectColor(src , hsv)
            cv.imshow("outCanvas" , output)
            stats.end()
            requestAnimationFrame(renderDetect)
        }
    })

    const rgba2hsv = (srcIN , output) => {
        cv.cvtColor(srcIN , output , cv.COLOR_RGBA2RGB)
        cv.cvtColor(output , output , cv.COLOR_RGB2HSV)
        return output
    }

    const detectColor = (oldImg , ImgHSV) => {
        let mask = new cv.Mat()
        if( Color == "orange" )
            mask = InRange(mask,ImgHSV,[5,50,50],[19,255,255])
        else if (Color == "yellow")
            mask = InRange(mask,ImgHSV,[20,50,50],[30,255,255])
        else if ( Color == "green" )
            mask = InRange(mask,ImgHSV,[25,52,72],[102,255,255])
        else if ( Color == "red" ) {
            let red1 = new cv.Mat() , red2 = new cv.Mat()

            let low1 = new cv.Mat(ImgHSV.rows , ImgHSV.cols , ImgHSV.type() , [0,50,50, 255])
            let low2 = new cv.Mat(ImgHSV.rows , ImgHSV.cols , ImgHSV.type() , [160,50,50, 255])
            let high1 = new cv.Mat(ImgHSV.rows , ImgHSV.cols , ImgHSV.type() , [5,255,255, 255])
            let high2 = new cv.Mat(ImgHSV.rows , ImgHSV.cols , ImgHSV.type() , [255,255,255, 255])
            
            cv.inRange(ImgHSV , low1 , high1 , red1 )
            cv.inRange(ImgHSV , low2 , high2 , red2 )
            cv.add(red1 , red2 , mask)
            red1.delete() , red2.delete()
            low1.delete() , low2.delete()
            high1.delete() , high2.delete()
        } else return oldImg

        let contours = new cv.MatVector();
        let hierarchy = new cv.Mat();
        cv.findContours(mask, contours, hierarchy, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE);
        for (let i = 0 ; i < contours.size(); ++i){
            let area = cv.contourArea(contours.get(i) , false)
            if(area > 3000) {
                let [ position , size ] = rectPoint(contours.get(i))
                let rectangleColor = new cv.Scalar(255 , 0 , 0);
                cv.rectangle(oldImg , position , size , rectangleColor , 2 , cv.LINE_AA , 0)
            }
        }

        mask.delete()
        contours.delete()
        hierarchy.delete()

        return oldImg
    }

    const rectPoint = (cnt) => {
        let rect = cv.boundingRect(cnt)
        let position = new cv.Point(rect.x, rect.y);
        let size = new cv.Point(rect.x + rect.width, rect.y + rect.height);
        return [position , size]
    }

    const InRange = (mask,inputImg,low,high) => {
        let l = new cv.Mat(inputImg.rows , inputImg.cols , inputImg.type() , low.concat([255]))
        let h = new cv.Mat(inputImg.rows , inputImg.cols , inputImg.type() , high.concat([255]))
        cv.inRange(inputImg , l , h , mask )
        l.delete() , h.delete()
        return mask
    }
})