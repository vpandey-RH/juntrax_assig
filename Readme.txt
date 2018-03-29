***** HOW TO INSTALL ****************

1. Clone the repo "https://github.com/vpandey-RH/juntrax_assig.git"
2. Navigate to the cloned local copy
3. Run command - "sudo npm init"
4. Run command - "sudo npm install"
5. Setup is complete.
6. Run the Nodejs server by udsing command - "sudo node index.js"

************ API SPECIFICATIONS ******************

Note:- All Apis are authenticated except for '/getToken' and '/geoCode'

1.  /getToken -
				Authenticated 	- No
				Method        	- POST
				Body			- {'role': 'admin'}
				Headers			- "Content-Type: application/json"
				Response		- {'role':"admin", "token": Token}
	Sample Request =>
				curl -H "Content-Type: application/json" -XPOST http://localhost:3000/getToken -d '{"role" : "admin"}'

2.	/uptime -
				Authenticated  	 - Yes
				Method			 - GET
				Query Parameters - None
				Headers			 - "Authorization: Bearer <Token from /getToken>"
				Response 		 - {"uptime": <server-uptime>}
	Sample Request =>
				curl -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1MjIzNDEzMzF9.TV5Lt49ahDMrDmgE5AGM4_6J6gHIdpq-8a4mAjGolm8" -XGET http://localhost:3000/uptime


3.	/getLogs -
				Authenticated     - Yes
				Method 			  - GET
				Query Parameters  - ?t1=<timestamp1 in seconds>&t2=<timestamp2 in secodns>
				Headers			  - "Authorization: Bearer <Token from /getToken>"
				Response		  - All logs between the given two timestamps.
	Sample Request =>
				curl -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1MjIzNDEzMzF9.TV5Lt49ahDMrDmgE5AGM4_6J6gHIdpq-8a4mAjGolm8" -XGET 'http://localhost:3000/getLogs?t1=<timestamp1>&t2=<timestamp2>'

4.	/geoCode -
				Authenticated 	  - No
				Method			  - GET
				Query Parameters  - ?lat=<latitude>&long=<longitude>
				Response		  - Geocode Reverse APi response
	Sample Request =>
				curl -XGET 'http://localhost:3000/geocode?lat=22.960510&long=88.567406'

5.	/setGeocodeApiLimit -
				Authenticated  	  - Yes
				Method			  - POST
				Body			  - {"reqLimit" : <no of calls allowed in 1 hour>}
				Headers 		  - "Authorization: Bearer <Token from /getToken>"
				Response 		  - None
	Sample Request =>
				curl -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1MjIzNDQwNzV9.LI4dOWuL2_0UT4GDVnB5drX1T9lXAYhdUYd36GbV0ug" -H "Content-Type: application/json" -XPOST http://localhost:3000/setGeocodeApiLimit -d '{"reqLimit" : 5}'


************** Additional Code ************

1. 	/setLogs -
				Authenticated 	- No
				Method        	- POST
				Body			- {name: <name of the api>, response: <Response Code>}
				Headers			- "Content-Type: application/json"
				Response		- None

2. 	setLogs -
				Function to send internal request to '/setLogs' API endpoint

3. 	resetMaxRequestPerHour () -
				Function to run after every 1 hour and reset the current number of requests received for geocode API.