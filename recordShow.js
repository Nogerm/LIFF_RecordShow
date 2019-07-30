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

      const tableColumnNum = response.data.records[0].length;
      const tableBodyRowNum = response.data.records/length;

      //update value
      let div_group_name  = document.getElementById("groupName");
      reportGroup = response.data.groupName;
      reportTimeStr = timeStampToString(response.data.eventTime[response.data.eventTime.length - 1]);
      div_group_name.textContent = reportGroup + ' - ' + reportTimeStr;

      let table = document.getElementById("userTable");
      response.data.groupMembers[0].forEach((name, index) => {
        let row = table.insertRow(index + HeaderRowNum);
        let cell_name  = row.insertCell(0);
        let cell_check = row.insertCell(1);
        cell_name.innerHTML = "<td>" + name + "</td>";
        cell_check.innerHTML = "<div class=\"ui checkbox\">\n <input type=\"checkbox\">\n <label>出席狀況</label>\n </div>\n </td>"; 
      });
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

