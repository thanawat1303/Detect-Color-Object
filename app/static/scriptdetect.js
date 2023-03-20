let Stream = null
let render_detect = false
let modeShow = "frame"
let Switch = true

const StartCamera = (media, modecamera , eleVideo) => {
    if(Stream){
        Stream.getTracks().forEach(track => {
            track.stop();
        })
    }
    media.getUserMedia({
        video: {
            width : document.body.clientWidth * 0.95,
            facingMode : {
                exact : (modecamera) ? "user" : "environment"
            }
        },
        audio:false
    }).then((videoStr)=>{
        eleVideo.srcObject = null;
        eleVideo.srcObject = videoStr;
        Stream = videoStr
        videoStr = null
        eleVideo.play();
    }).catch(()=>{
        media.getUserMedia({
            video: {
                width : document.body.clientWidth * 0.95,
                facingMode : {
                    exact : "user"
                }
            },
            audio:false
        }).then((videoStr)=>{
            eleVideo.srcObject = null;
            eleVideo.srcObject = videoStr;
            Stream = videoStr
            videoStr = null
            eleVideo.play();
        })
    })
}

document.addEventListener("DOMContentLoaded" , ()=>{
    let Color = ""
    let colorLow = []
    let colorHigh = []
    let stats = new Stats()
    let videoDC = document.getElementById("video-detect")
    let show = document.getElementById("outCanvas")
    let media = navigator.mediaDevices

    stats.showPanel(2)
    document.getElementById('container').appendChild(stats.domElement);
    // document.getElementById('select-color').addEventListener('change' , (e)=>{
    //     // fetch(`/select/${e.target.value}`)
    //     Color = e.target.value
    // })
    // document.getElementById('colorPickerLow').addEventListener('input' , (e)=>{
    //     let colorR = parseInt(e.target.value.substring(1 , 3) , 16)
    //     let colorG = parseInt(e.target.value.substring(3 , 5) , 16)
    //     let colorB = parseInt(e.target.value.substring(5 , 7) , 16)
    //     let pushColor = new cv.Mat( 3 , 1 , cv.CV_8UC3)
    //     pushColor.data.set([colorR,colorG,colorB, 0, 0, 0, 0, 0, 0])
    //     cv.cvtColor(pushColor , pushColor , cv.COLOR_RGB2HSV)
    //     colorLow = [pushColor.data[0] , pushColor.data[1] , pushColor.data[2]]
    //     console.log(colorLow)
    // })

    document.getElementById('colorPicker').addEventListener('input' , (e)=>{
        let colorR = parseInt(e.target.value.substring(1 , 3) , 16)
        let colorG = parseInt(e.target.value.substring(3 , 5) , 16)
        let colorB = parseInt(e.target.value.substring(5 , 7) , 16)
        let pushColor = new cv.Mat( 3 , 1 , cv.CV_8UC3)
        pushColor.data.set([colorR,colorG,colorB, 0, 0, 0, 0, 0, 0])
        cv.cvtColor(pushColor , pushColor , cv.COLOR_RGB2HSV)
        
        colorHigh = [pushColor.data[0] , 255 , 255]
        colorLow = [(pushColor.data[0] - 15 < 0) ? 0 : pushColor.data[0] - 15 , 50 , 50]
        
        console.log(colorHigh)
    })

    document.getElementById("swichCamera").addEventListener("click" , ()=>{
        Switch = !Switch
        StartCamera(media , Switch , videoDC)
    })
    StartCamera(media , Switch , videoDC)

    videoDC.addEventListener("canplay" , ()=>{
        if(!render_detect) {
            InitDetect(videoDC)
            render_detect = true
        }
    })

    function InitDetect(videoOut) {
        let src = new cv.Mat(videoOut.videoHeight , videoOut.videoWidth , cv.CV_8UC4) //create frame source video
        let out = new cv.Mat(videoOut.videoHeight , videoOut.videoWidth , cv.CV_8UC3) //create frame source to output
    
        videoOut.height = videoOut.videoHeight
        videoOut.width = videoOut.videoWidth

        let vid = new cv.VideoCapture(videoOut)
        requestAnimationFrame(renderDetect)
        function renderDetect() {
            stats.begin()
            // show.width = videoOut.videoWidth , show.height = videoOut.videoHeight
            vid.read(src) //Read video put to frame
            let hsv = rgba2hsv(src , out)
            let output = detectColor(src , hsv)
            cv.imshow(show , output)
            // cv.imshowdelete()
            stats.end()
            requestAnimationFrame(renderDetect)
        }
    }

    const rgba2hsv = (srcIN , output) => {
        cv.cvtColor(srcIN , output , cv.COLOR_RGBA2RGB)
        cv.cvtColor(output , output , cv.COLOR_RGB2HSV)
        return output
    }

    const detectColor = (oldImg , ImgHSV) => {
        let mask = new cv.Mat()
        // if( Color == "orange" )
        //     mask = InRange(mask,ImgHSV,[5,50,50],[19,255,255])
        // else if (Color == "yellow")
        //     mask = InRange(mask,ImgHSV,[20,50,50],[30,255,255])
        // else if ( Color == "green" )
        //     mask = InRange(mask,ImgHSV,[25,52,72],[102,255,255])
        // else if ( Color == "red" ) {
        //     let red1 = new cv.Mat() , red2 = new cv.Mat()

        //     let low1 = new cv.Mat(ImgHSV.rows , ImgHSV.cols , ImgHSV.type() , [0,50,50, 255])
        //     let low2 = new cv.Mat(ImgHSV.rows , ImgHSV.cols , ImgHSV.type() , [160,50,50, 255])
        //     let high1 = new cv.Mat(ImgHSV.rows , ImgHSV.cols , ImgHSV.type() , [5,255,255, 255])
        //     let high2 = new cv.Mat(ImgHSV.rows , ImgHSV.cols , ImgHSV.type() , [255,255,255, 255])
            
        //     cv.inRange(ImgHSV , low1 , high1 , red1 )
        //     cv.inRange(ImgHSV , low2 , high2 , red2 )
        //     cv.add(red1 , red2 , mask)
        //     red1.delete() , red2.delete()
        //     low1.delete() , low2.delete()
        //     high1.delete() , high2.delete()
        if(colorHigh[0] != undefined && colorLow[0] != undefined) {
            if(colorLow[0] > colorHigh[0]){
                mask = InRange(mask,ImgHSV,colorHigh,colorLow)
            } else {
                mask = InRange(mask,ImgHSV,colorLow,colorHigh)
            }
        } else {
            ImgHSV = null
            mask.delete()
            return oldImg
        }

        let frameSize = new cv.Size(5, 5)
        let kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, frameSize);
        cv.erode(mask, mask, kernel);
        cv.dilate(mask, mask, kernel);
        kernel = null , frameSize = null

        let contours = new cv.MatVector();
        let hierarchy = new cv.Mat();
        cv.findContours(mask, contours, hierarchy, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE);
        for (let i = 0 ; i < contours.size(); ++i){
            let cnt = contours.get(i)
            let area = cv.contourArea(cnt , false)
            let rectangleColor = new cv.Scalar(255 , 255 , 255);
            if(modeShow == "frame") {
                if(area > 3000 && area < 60000) {
                    let [ position , size ] = rectPoint(cnt)
                    let rectangleColor = new cv.Scalar(255 , 255 , 255);
                    cv.rectangle(oldImg , position , size , rectangleColor , 2 , cv.LINE_AA , 0)
                    position = null,size = null 
                    rectangleColor = null
                }
            }
            else if(modeShow == "draw") {
                cv.drawContours(oldImg, contours, i, rectangleColor, 2, cv.LINE_8, hierarchy, 100);
            }
            area = null , cnt.delete()
        }
        ImgHSV = null,mask.delete()
        contours.delete(),hierarchy.delete()

        return oldImg
    }

    const rectPoint = (cnt) => {
        let rect = cv.boundingRect(cnt)
        let position = new cv.Point(rect.x, rect.y);
        let size = new cv.Point(rect.x + rect.width, rect.y + rect.height);
        rect = null
        return [position , size]
    }

    const InRange = (mask,inputImg,low,high) => {
        let l = new cv.Mat(inputImg.rows , inputImg.cols , inputImg.type() , low.concat([255]))
        let h = new cv.Mat(inputImg.rows , inputImg.cols , inputImg.type() , high.concat([255]))
        cv.inRange(inputImg , l , h , mask )
        l.delete() , h.delete()
        inputImg = null,low = null,high = null
        return mask
    }
})