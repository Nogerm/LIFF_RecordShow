const hostURL = "https://script.google.com/macros/s/AKfycbyQwaNfRrnyBB4kCOvdMgUw_o6v8Z_lNUDqjNCT5Uo-dPKBvZ0/exec";
const HeaderRowNum = 3;

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
          ["V", "", "V", "", "", "V", "V"],
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
          if(tableColumnNum === undefined) tableColumnNum = index;
        } else {
          //parse Date string
          dateArray.push(element[0].split('T')[0].substring(5));
        }
      });
      if(tableColumnNum === undefined) tableColumnNum = dateArray.length;

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

      //update group name
      let groupName = document.getElementById("groupName");
      groupName.innerHTML = "<h2 id=\"groupName\">" + fakeData.groupName + "</h1>";

      //create table header
      let table = document.getElementById("userTable");
      let header = table.createTHead();
      let headerRow = header.insertRow(0);
      const firstRow = ["組員", ...dateArray];
      firstRow.forEach((vlaue, index) => {
        let headerCell = headerRow.insertCell(index);
        headerCell.innerHTML = "<td>" + vlaue + "</td>";
        if(index === 0) headerCell.className = "first-col";
      }); 

      //create table body
      let body = table.createTBody();
      for(let idx_row = 0; idx_row < tableRowNum; idx_row++) {
        let bodyRow = body.insertRow(idx_row);
        for(let idx_column = 0; idx_column <= tableColumnNum; idx_column++) {
          let bodyCell  = bodyRow.insertCell(idx_column);
          if(idx_column === 0) {
            //name column
            bodyCell.innerHTML = "<td>" + fakeData.records[idx_column][idx_row] + "</td>";
            bodyCell.className = "first-col";
          } else {
            //data column
            if(fakeData.records[idx_column][idx_row] === "V") bodyCell.innerHTML = "<i class=\"large green checkmark icon\"></i>";
            else bodyCell.innerHTML = "";
          }
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
          if(tableColumnNum === 0) tableColumnNum = index;
        } else {
          //parse Date string
          dateArray.push(element[0].split('T')[0].substring(5));
        }
      });
      if(tableColumnNum === undefined) tableColumnNum = dateArray.length;

      response.data.records[0].forEach((element, index) => {
        if(element === "") {
          //empty data
          if(tableRowNum === 0) tableRowNum = index;
        } else {
          //parse user string
          userArray.push(element);
        }
      });
      if(tableRowNum === undefined) tableRowNum = userArray.length;

      alert("tableColumnNum" + tableColumnNum + "\ndateArray: " + dateArray + "\nuserArray" + userArray);

      //update group name
      let groupName = document.getElementById("groupName");
      groupName.innerHTML = "<h2 id=\"groupName\">" + response.data.groupName + "</h1>";

      //create table header
      let table = document.getElementById("userTable");
      let header = table.createTHead();
      let headerRow = header.insertRow(0);
      const firstRow = ["組員", ...dateArray];
      firstRow.forEach((vlaue, index) => {
        let headerCell = headerRow.insertCell(index);
        headerCell.innerHTML = "<td>" + vlaue + "</td>";
        if(index === 0) headerCell.className = "first-col";
      }); 

      //create table body
      let body = table.createTBody();
      for(let idx_row = 0; idx_row < tableRowNum; idx_row++) {
        let bodyRow = body.insertRow(idx_row);
        for(let idx_column = 0; idx_column <= tableColumnNum; idx_column++) {
          let bodyCell  = bodyRow.insertCell(idx_column);
          if(idx_column === 0) {
            //name column
            bodyCell.innerHTML = "<td>" + response.data.records[idx_column][idx_row] + "</td>";
            bodyCell.className = "first-col";
          } else {
            //data column
            if(response.data.records[idx_column][idx_row] === "V") bodyCell.innerHTML = "<i class=\"large green checkmark icon\"></i>";
            else bodyCell.innerHTML = "";
          }
        }
      }

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

