### DETECT COLOR

- BGR
  - ระบบสีที่ opencv อ่านภาพออกมา

- HSV
  - ระบบสีที่ผสมกันของ
    - HUA ค่าสีนั้นๆ
    - Saturation ค่าความอิ่มตัวสี
    - Value ค่าความสว่างของแสง

- Run application
  ```ruby
  python .\app\app.py
  ```

- Run Container
  ```ruby
  docker run -d -p 80:80 thanawat1303/detect-color-python:v3
  ```

- Open application on Port 80

Ref 
  - Render Vedio on python api
    - https://towardsdatascience.com/video-streaming-in-web-browsers-with-opencv-flask-93a38846fe00
  - Api python
    - https://www.geeksforgeeks.org/flask-app-routing/