const hostURL = "https://script.google.com/macros/s/AKfycbyQwaNfRrnyBB4kCOvdMgUw_o6v8Z_lNUDqjNCT5Uo-dPKBvZ0/exec";
const HeaderRowNum = 2;

var reportTimeStr = "";
var reportGroup = "";

//init
window.onload = function (e) {

  liff.init(
    data => {
      // Now you can call LIFF API
      initializeApp(data);
    },
    err => {
      // LIFF initialization failed
      alert("init fail");

      //show/hide element
      let div_loading = document.getElementById("loading");
      div_loading.className = "ui inverted dimmer";

      //test by fake data
      let fakeData = {
        status: 200,
        groupName: "GroupName",
        recordDate:[
          ["2019-07-06T16:00"],
          ["2019-07-13T16:00"],
          ["2019-07-19T16:00"],
          ["2019-07-20T16:00"],
          ["2019-07-27T16:00"],
          [""]
        ],
        records: [
          ["Name", "Name", "Name", "Name", "Name", "Name", "Name"],
          ["V", "", "V", "", "", "", "V"],
          ["V", "", "V", "", "", "", "V"],
          ["V", "", "V", "", "", "", "V"],
          ["V", "", "V", "", "", "", "V"],
          ["V", "", "V", "", "", "", "V"],
          ["", "", ""]
        ]
      }

      let tableColumnNum = undefined;
      let tableRowNum = undefined;
      let dateArray = [];
      let userArray = [];

      fakeData.recordDate.forEach((element, index) => {
        if(element[0] === "") {
          //empty data
          if(tableColumnNum === undefined) tableColumnNum = index + 1;
        } else {
          //parse Date string
          dateArray.push(element[0].split('T')[0]);
        }
      });
      if(tableColumnNum === undefined) tableColumnNum = dateArray.length + 1;

      fakeData.records[0].forEach((element, index) => {
        if(element === "") {
          //empty data
          if(tableRowNum === undefined) tableRowNum = index;
        } else {
          //parse user string
          userArray.push(element);
        }
      });
      if(tableRowNum === undefined) tableRowNum = userArray.length;

      //generate table header
      let table = document.getElementById("userTable");
      let header = table.createTHead();
      let row1 = header.insertRow(0);
      let cell1_row1 = row1.insertCell(0);
      cell1_row1.innerHTML = "<h2>" + fakeData.groupName + "</h1>"; 
      cell1_row1.colSpan = tableColumnNum;

      let row2 = header.insertRow(1);
      let cell1_row2 = row2.insertCell(0);
      cell1_row2.innerHTML = "<p>組員</p>";
      for(let i = 1; i < tableColumnNum; i++) {
        let cell_row2 = row2.insertCell(i);
        cell_row2.innerHTML = "<p>" + dateArray[i - 1] + "</p>";
      }


      //generate table body
      let body = table.createTBody();
      for(let i = 0; i < tableRowNum; i++) {
        let row = body.insertRow(i);
        for(let j = 0; j < tableColumnNum; j++) {
          let cell = row.insertCell(j);
          if(j === 0) cell.innerHTML = "<td>" + userArray[i] + "</td>";
        }
      }
    }
  );
};

function initializeApp(data) {
  //check user permission
  const query_url = hostURL + "?type=record&lineId=" + data.context.userId;
  axios.get(query_url)
  .then(response => {
    // Success

    //show/hide element
    let div_loading = document.getElementById("loading");
    div_loading.className = "ui inverted dimmer";

    if(response.data.status === 200) {
      alert(JSON.stringify(response.data));

      let tableColumnNum = 0;
      let tableRowNum = 0;
      let dateArray = [];
      let userArray = [];

      response.data.recordDate.forEach((element, index) => {
        if(element[0] === "") {
          //empty data
          if(tableColumnNum === 0) tableColumnNum = index + 1;
        } else {
          //parse Date string
          dateArray.push(element[0].split('T')[0]);
        }
      });

      response.data.records[0].forEach((element, index) => {
        if(element === "") {
          //empty data
          if(tableRowNum === 0) tableRowNum = index;
        } else {
          //parse user string
          userArray.push(element);
        }
      });

      alert("dateArray: " + dateArray + "\nuserArray" + userArray);

      //generate table header
      let table = document.getElementById("userTable");
      let header = table.createTHead();
      let row1 = header.insertRow(0);
      let cell1_row1 = row1.insertCell(0);
      cell1_row1.innerHTML = "<h2>" + response.data.groupName + "</h1>"; 
      cell1_row1.colSpan = tableColumnNum;

      let row2 = header.insertRow(1);
      let cell1_row2 = row2.insertCell(0);
      cell1_row2.innerHTML = "<p>組員</p>";
      let cell2_row2 = row2.insertCell(1);
      cell2_row2.innerHTML = "<p>出席狀況</p>";


      //generate table body
      let body = table.createTBody();
      for(let i = 0; i < tableRowNum; i++) {
        let row = body.insertRow(i);
        for(let j = 0; j < tableColumnNum; j++) {
          let cell = row.insertCell(j);
          if(j === 0) cell.innerHTML = "<td>" + userArray[i] + "</td>";
        }
      }
      
      /*
      response.data.groupMembers[0].forEach((name, index) => {
        let row = table.insertRow(index + HeaderRowNum);
        let cell_name  = row.insertCell(0);
        let cell_check = row.insertCell(1);
        cell_name.innerHTML = "<td>" + name + "</td>";
        cell_check.innerHTML = "<div class=\"ui checkbox\">\n <input type=\"checkbox\">\n <label>出席狀況</label>\n </div>\n </td>"; 
      });*/
    } else {
      alert(response.data.message);
    }
  })
  .catch(error => {
    // Error
    console.log(error);
    alert(error);
  });
}

function timeStampToString (time){
  const datetime = new Date();
  datetime.setTime(time * 1000);
  const year = datetime.getFullYear();
  const month = datetime.getMonth() + 1;
  const date = datetime.getDate();
  return year + "/" + month + "/" + date;
}

function arrayify(collection) {
  return Array.prototype.slice.call(collection);
}

