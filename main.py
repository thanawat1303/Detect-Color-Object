import cv2 # ประมวลผลรูปภาพ
import numpy as np #จัดการอาเรย์

img = cv2.imread("assets/image.png")
hsv = cv2.cvtColor(img , cv2.COLOR_BGR2HSV) # แปลงภาพ BGR เป็น HSV

SELECT = input("SELECT COLOR (RED , GREEN , ORANGE) : ")
SELECT = SELECT.lower()

if SELECT == "green" :
    mask = cv2.inRange(hsv , (50,50,50) , (75,255,255))
elif SELECT == "orange" :
    mask = cv2.inRange(hsv , (5, 50, 25) , (18,255,255))
elif SELECT == "red" :
    RED1 = cv2.inRange(hsv , (0,50,50) , (5,255,255))
    RED2 = cv2.inRange(hsv , (160,50,50) , (255,255,255))
    mask = cv2.bitwise_or(RED1 , RED2) # หาตำแหน่งสีที่ต้องการบนภาพ ที่เป็นช่วงสี HSV โดยทำการแปลงเป็นภาพ Grascale
else :
    exit()

# เป็นการตัด noise บนรูปภาพ
kernel = np.ones((5,5) , np.uint8)
mask = cv2.erode(mask , kernel , iterations= 1)
mask = cv2.dilate(mask , kernel , iterations= 1)

contours , hierarchy = cv2.findContours(mask , cv2.RETR_TREE , cv2.CHAIN_APPROX_SIMPLE)

for contour in contours :
    area = cv2.contourArea(contour)
    if area > 2000 and area < 20000 : #เลือกเฉพาะกรอบที่มีขนาดตามที่ต้องการ
        x , y , w , h = cv2.boundingRect(contour) #จุดกรอบของรูปร่าง โดยจะมีตำแหน่งที่อยู่บนรูปคือ x , y และ ขนาด w , h
        cv2.rectangle(img , (x , y) , ( x + w , y + h) , ( 0 , 255 , 0) , 2)

cv2.imshow(SELECT, img)
cv2.waitKey(0)
cv2.destroyAllWindows()