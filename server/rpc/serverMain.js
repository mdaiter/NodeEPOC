console.log("Server started");

var currEmotions;

var currEmotions2;

var sendData;

var sendData2;

var appNameSearchedFor = new Array();

var emotionSearchFor;

var $ = require('jquery'),
http = require('http'),
request = require('request');

function updateJSON(checkButtonVal, res, ss){
  updatePrelim(checkButtonVal, res, ss);
  handleJSON(false, res, ss);
}

function updatePrelim(checkButtonVal, res, ss){
  emotionSearchFor = checkButtonVal;
  initCurrEmotions();
}

function updateJSONGraph(checkButtonVal, res, ss){
  updatePrelim(checkButtonVal);
  handleJSON(true, res, ss);
}

function initCurrEmotions(){
  currEmotions = new Object();
  currEmotions2 = new Object();
  
  sendData = new Object();
  sendData.data = new Array();

  sendData2 = new Object();
  sendData2.data = new Array();
}

function handleJSON(isGraph, res, ss){
  var retrJSON;
  if (isGraph == false){
	 retrJSON = {"person":{"appUUID":"d5ef2fc2-60b9-4f78-8b3e-e327a5898f2a", "clientUUID":"03f1ab0a-b659-4979-8ddc-a35c8b5b8a85"}, "UserAll":"true", "Emotions":emotionSearchFor, "email":"mdaiter@exeter.edu"};
  }
  else{
   retrJSON = {"person":{"appUUID":"d5ef2fc2-60b9-4f78-8b3e-e327a5898f2a", "clientUUID":"03f1ab0a-b659-4979-8ddc-a35c8b5b8a85"}, "UserAll":"true", "AppName":appNameSearchedFor, "Emotions":emotionSearchFor, "email":"mdaiter@exeter.edu"};
  }
  //Ajax is a little faster than sync
  var options = {
    uri: 'http://localhost:8079/detect.json',
    method: 'POST',
    json: retrJSON
  };


  request(options, function (error, response, body) {
    if (!error) {
      
      //console.log("Body is: " + currEmotions.cliUUID);
      if (isGraph === false){
        currEmotions = body;
        console.log("The ss is: " + ss);
        console.log(currEmotions);
        processJSON(currEmotions, res, ss);
      }
      else{
        currEmotions2 = body;
        console.log("The ss is: " + ss);
        console.log("Searching for: " + appNameSearchedFor);
        processGraph(currEmotions2, appNameSearchedFor, res, ss);
      }
    }
  });
}

function processGraph(json, nameToBeGraphed, res, ss){
  console.log(json);
  for (var attrFirstLevel in json){
    console.log("attrFirstLevel is: " + attrFirstLevel);
    if (typeof json[attrFirstLevel] === "object"){
      var attrFirstLevelSolid = json[attrFirstLevel]
      for (var attrSecLevel in attrFirstLevelSolid){
        console.log("attrFirstLevel has data: " + attrFirstLevelSolid);
        console.log("Data is: " + attrSecLevel);
        var dataArray = attrFirstLevelSolid[attrSecLevel];
        console.log("Data array is: " + dataArray);
        console.log(dataArray[0]);
        //Iterate through dateArr
        for (var i = dataArray.length - 1; i >= 0; i--) {
          console.log(dataArray[i]);
          for (var date in dataArray[i]){
            var dateObject = dataArray[i];
            var dateArr = dateObject[date];
            console.log("dateArr is: " + dateArr);
            var appNameObj = dateArr[dateArr.length - 1];
            console.log("appNameObj is: " + appNameObj);
            var appName = appNameObj["appName"];
            console.log("appName is : " + appName);
            for (var foo = 0; foo < nameToBeGraphed.length; foo++){
              var name = nameToBeGraphed[foo];
              console.log("Name is: " + name);
            if (appName === name){
              var emoObj = dateArr[0];
              console.log("EmoObj is : " + emoObj);
              var emoVal = emoObj[emotionSearchFor];
              console.log("EmoVal is : " + emoVal);

              var lastIndex = -1;
              lastIndex = sendData2ContainsAppAndDate(name, date);
              if (lastIndex !== -1){
                console.log("Updated current stats");
                updateCurrAppStats2(lastIndex, emoVal);
              }
              else{
                var lengthOfArray = sendData2.data.length;
                sendData2.data[lengthOfArray] = new Object();
                sendData2.data[lengthOfArray].appName = appName;
                sendData2.data[lengthOfArray].emotion = emoVal;
                sendData2.data[lengthOfArray].numUsers = 1;
                sendData2.data[lengthOfArray].date = new Date(date);

                console.log("Updated send data is: " + sendData2.data[0].appName);
              }
            }
          }
          }
        };        
      }
    }
  }



  for (var i = sendData2.data.length - 1; i >= 0; i--) {
    console.log("Done processing JSON data with name: " + sendData2.data[i].appName);
    console.log("and emotion: " + sendData2.data[i].emotion);
    console.log("and numUsers: " + sendData2.data[i].numUsers);
    console.log("and date: " + sendData2.data[i].date);
  };

  console.log("Pushing to initGraph: " + sendData2);

  ss.publish.all('initGraph', sendData2);     // Broadcast the message to everyone
  return res(true);

}

function updateCurrAppStats2(index, emoVal){
  var emotionNum = sendData2.data[index].emotion;
  console.log("Modifying value: " + emotionNum);
  var currNumUsers = sendData2.data[index].numUsers;
  emotionNum *= currNumUsers;
  emotionNum += emoVal;
  currNumUsers += 1;
  emotionNum /= currNumUsers;

  console.log(emoVal);

  sendData2.data[index].emotion = emotionNum;
  sendData2.data[index].numUsers = currNumUsers;

  console.log("sendData2 is: " + sendData2.data[index].numUsers);

}

function updateCurrAppStats(index, emoVal){
  var emotionNum = sendData.data[index].emotion;
  console.log("Modifying value: " + emotionNum);
  var currNumUsers = sendData.data[index].numUsers;
  emotionNum *= currNumUsers;
  emotionNum += emoVal;
  currNumUsers += 1;
  emotionNum /= currNumUsers;

  console.log(emoVal);

  sendData.data[index].emotion = emotionNum;
  sendData.data[index].numUsers = currNumUsers;

  console.log("sendData is: " + sendData.data[index].numUsers);

}

function processJSON(json, res, ss){
  console.log(json);
  for (var attrFirstLevel in json){
    console.log("attrFirstLevel is: " + attrFirstLevel);
    if (typeof json[attrFirstLevel] === "object"){
      var attrFirstLevelSolid = json[attrFirstLevel]
      for (var attrSecLevel in attrFirstLevelSolid){
        console.log("attrFirstLevel has data: " + attrFirstLevelSolid);
        console.log("Data is: " + attrSecLevel);
        var dataArray = attrFirstLevelSolid[attrSecLevel];
        console.log("Data array is: " + dataArray);


        for (var i = dataArray.length - 1; i >= dataArray.length - 7; i--) {
          var latestDateObject = dataArray[i];

        console.log("Object in data array is: " + latestDateObject); 
        
        for (var date in latestDateObject){
          console.log("Latest date is: " + date);
          console.log("Latest date objectified is: " + latestDateObject[date]);
          
          var latestDateObjectArray = latestDateObject[date];

          var appNameObj = latestDateObjectArray[latestDateObjectArray.length - 1];

          var emoObj = latestDateObjectArray[0];

          if (typeof emoObj[emotionSearchFor] === "number"){
            //Need to get the latest date for data
            if (sendData.date < new Date(date) || typeof sendData.date === "undefined"){
              console.log("New date: " + new Date(date));
              sendData.date = new Date(date);
              console.log("Updated date: " + sendData.date);
            }
            else{
              console.log(sendData.date < date);
              console.log("Date remained the same: " + sendData.date);
            }
            //Check if we have this app in our log
            
            console.log("Before swap: " + sendData.data);
            
            var indexOfApp = -1;

            indexOfApp = sendDataContainsApp(appNameObj["appName"]);

            if (indexOfApp !== -1){
              updateCurrAppStats(indexOfApp, emoObj[emotionSearchFor]);
              console.log("After swap: " + sendData.data[indexOfApp].emotion);
            }

            else{
              var lengthOfArray = sendData.data.length;
              sendData.data[lengthOfArray] = new Object();
              sendData.data[lengthOfArray].appName = appNameObj["appName"];
              sendData.data[lengthOfArray].emotion = emoObj[emotionSearchFor];
              sendData.data[lengthOfArray].numUsers = 1;

              console.log("Updated send data name is: " + sendData.data[0].appName);
              console.log("Updated send data is: " + sendData.data);
            }            
          }
        }
        };
      }
    }
  
    else{
      console.log("attrFirstLevel has typeof" + typeof json[attrFirstLevel]);
    }
  }
  console.log("Done processing JSON");
  ss.publish.all('newData', sendData);     // Broadcast the message to everyone
  return res(true);
}

function checkIfOtherStuffToIncludeLatest(dateArray){
  for (var dateObj in dateArray){
    for (var date in dateObj){
      var dateObjArray = dateObj[date];
      var appNameObj = dateObjArray[dateObjArray.length - 1];
      var emoObj = dateObjArray[0];
    }
  }
}

function sendData2ContainsAppAndDate(nameOfApp, date){
  for (var i = sendData2.data.length - 1; i >= 0; i--) {
    if (sendData2.data[i].appName === nameOfApp &&
      sendData2.data[i].date === date){
      return i;
    }
  };
  return -1;
}


function sendDataContainsAppAndDate(nameOfApp, date){
  for (var i = sendData.data.length - 1; i >= 0; i--) {
    if (sendData.data[i].appName === nameOfApp &&
      sendData.data[i].date === date){
      return i;
    }
  };
  return -1;
}

function sendDataContainsApp(nameOfApp){
  for (var i = sendData.data.length - 1; i >= 0; i--) {
    if (sendData.data[i].appName === nameOfApp){
      console.log("sendData contain app: " + nameOfApp);
      return i;
    }
  };
  return -1;
}

// Define actions which can be called from the client using ss.rpc('serverMain.ACTIONNAME', param1, param2...)
exports.actions = function(req, res, ss) {

  // Example of pre-loading sessions into req.session using internal middleware
  req.use('session');

  return {

    updateData: function(valOfCheckButton) {
    	console.log("Updating data");
      updateJSON(valOfCheckButton, res, ss);
      console.log("Finished updating data with: " + sendData.data);
    },

    changeToGraph: function(valOfCheckButton, nameOfBubble){
      console.log("Changing to graph with name: " + nameOfBubble);
      appNameSearchedFor = nameOfBubble;
      updateJSONGraph(valOfCheckButton, res, ss);
    },

    updateGraph: function(valOfCheckButton, appName){
      updateJSONGraph(valOfCheckButton);
      ss.publish.all('newGraph', sendData2);
    }

  };
};