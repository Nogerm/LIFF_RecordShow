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
          if(tableColumnNum === undefined) tableColumnNum = index;
        } else {
          //parse Date string
          dateArray.push(element[0].split('T')[0]);
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

      //update table
      let groupName = document.getElementById("groupName");
      groupName.innerHTML = "<h2 id=\"groupName\">" + fakeData.groupName + "</h1>";

      //update tab text
      let prev0 = document.getElementById("prev0");
      const prevText0 = dateArray[tableColumnNum -1].substring(5);
      prev0.innerHTML = prevText0;
      prev0.className = "active item";

      let prev1 = document.getElementById("prev1");
      const prevText1 = dateArray[tableColumnNum -2].substring(5);
      prev1.innerHTML = prevText1;

      let prev2 = document.getElementById("prev2");
      const prevText2 = dateArray[tableColumnNum -3].substring(5);
      prev2.innerHTML = prevText2;

      let prev3 = document.getElementById("prev3");
      const prevText3 = dateArray[tableColumnNum -4].substring(5);
      prev3.innerHTML = prevText3;

      //update table data
      let tableBody = document.getElementById("tableBody");
      const stateArray =  fakeData.records[tableColumnNum];
      stateArray.forEach((state, index) => {
        let row = tableBody.insertRow(index + HeaderRowNum);
        let cell_name  = row.insertCell(0);
        let cell_check = row.insertCell(1);
        cell_name.innerHTML = "<td>" + userArray[index] + "</td>";
        if(state === "V") cell_check.innerHTML = "<td class=\"center aligned\"><i class=\"large green checkmark icon\"></i></td>";
        else cell_check.innerHTML = "<td></td>";
      });

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
      if(tableColumnNum === undefined) tableColumnNum = dateArray.length + 1;

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

      alert("dateArray: " + dateArray + "\nuserArray" + userArray);

      //generate table header
      let tableHead = document.getElementById("tableHead");
      let header = tableHead.createTHead();
      let row1 = header.insertRow(0);
      let cell1_row1 = row1.insertCell(0);
      cell1_row1.innerHTML = "<h2>" + response.data.groupName + "</h1>"; 

      //generate table name
      let tableName = document.getElementById("tableName");
      let nameBody = tableName.createTBody();
      let nameTitleRow = nameBody.insertRow(0);
      nameTitleRow.style.height = "10vh";
      let nameCell = nameTitleRow.insertCell(0);
      nameCell.innerHTML = "<p>組員</p>";
      for(let i = 1; i <= tableRowNum; i++) {
        let row = nameBody.insertRow(i);
        row.style.height = "10vh";
        let cell = row.insertCell(0);
        cell.innerHTML = "<td>" + userArray[i - 1] + "</td>";
      }

      //generate table data
      let tableData = document.getElementById("tableData");
      let dataBody = tableData.createTBody();
      for(let i = 0; i < tableRowNum + 1; i++) {
        let dataTitleRow = dataBody.insertRow(0);
        dataTitleRow.style.height = "10vh";
        for(let j = 0; j < tableColumnNum; j++) {
          let cell = dataTitleRow.insertCell(j);
          if(i === tableRowNum) cell.innerHTML = "<p>" + dateArray[j] + "</p>";
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

