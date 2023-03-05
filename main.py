import cv2 # ประมวลผลรูปภาพ
import numpy as np #จัดการอาเรย์

# frame = cv2.imread("assets/image.png") #อ่านไฟล์รูปภาพ
SELECT = input("SELECT COLOR : ")
SELECT = SELECT.lower()

vid = cv2.VideoCapture(0)
while(True) :
    ret , frame = vid.read() #อ่านภาพจากกล้อง
    hsv = cv2.cvtColor(frame , cv2.COLOR_BGR2HSV) # แปลงภาพ BGR เป็น HSV เพื่อนำไปใช้ในหลักการ HSV

    if SELECT == "orange" :
        mask = cv2.inRange(hsv , (5, 50, 50) , (18,255,255))
    elif SELECT == "yellow" :
        mask = cv2.inRange( hsv , (20 , 50 , 50) , (30 , 255 , 255) )
    elif SELECT == "green" :
        mask = cv2.inRange(hsv , (25,52,72) , (102,255,255))
    elif SELECT == "red" :
        RED1 = cv2.inRange(hsv , (0,50,50) , (5,255,255))
        RED2 = cv2.inRange(hsv , (160,50,50) , (255,255,255)) # หาตำแหน่งสีที่ต้องการบนภาพ ที่เป็นช่วงสี HSV โดยทำการแปลงเป็นภาพ Grascale
        mask = cv2.bitwise_or(RED1 , RED2) # รวมตำแหน่ง bit ที่ทำการหาได้ใน 2 รูปภาพ มารวมกัน

    else :
        exit()

    # เป็นการตัด noise บนรูปภาพ โดยใช้หลักการ erosion และ dilation
    kernel = np.ones((5,5) , np.uint8) #กรอบรูปภาพ หรือ กรอบตัวกรอง
    mask = cv2.erode(mask , kernel , iterations= 1) #ใช้หลักกการ erosion  การกร่อนภาพ เพื่อตัด pixel เล็ก ๆ ที่ไม่ต้องการ ตามขนาด kernal iterations คือ จำนวนรอบ
    mask = cv2.dilate(mask , kernel , iterations= 1) #ใช้หลักการ dilate  การพองภาพ เพื่อขยาย pixel ที่ต้องการให้มีขนาดที่กลับมาเป็นปกติ ตามขนาด kernal iterations คือ จำนวนรอบ

    contours , hierarchy = cv2.findContours(mask , cv2.RETR_TREE , cv2.CHAIN_APPROX_SIMPLE)

    for contour in contours :
        area = cv2.contourArea(contour)
        if area > 4000 : #เลือกกรอบที่มีขนาดตามรูปภาพที่ต้องการ
            x , y , w , h = cv2.boundingRect(contour) #จุดกรอบของรูปร่าง โดยจะมีตำแหน่งที่อยู่บนรูปคือ x , y และ ขนาด w , h
            cv2.rectangle(frame , (x , y) , ( x + w , y + h) , ( 0 , 255 , 0) , 2)
    
    cv2.imshow(SELECT , frame) #นำภาพแต่ละเฟรมมาแสดง

    if cv2.waitKey(1) & 0xFF == ord('q') : #ตรวจสอบการกดปุ่ม q
        break

vid.release()
cv2.destroyAllWindows()

# cv2.imshow(SELECT, frame) # แสดงผลรูปภาพ
# cv2.waitKey(0)
# cv2.destroyAllWindows()