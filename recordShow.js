const hostURL = "https://script.google.com/macros/s/AKfycbyQwaNfRrnyBB4kCOvdMgUw_o6v8Z_lNUDqjNCT5Uo-dPKBvZ0/exec";
const HeaderRowNum = 3;

var reportTimeStr = "";
var reportGroup = "";
var selectedFilter = "主日";
var reportData = {};

//init
window.onload = function (e) {

  liff.init(
    data => {
      // Now you can call LIFF API
      initializeApp(data);
    },
    err => {
      // LIFF initialization failed
      swal.fire(
        '錯誤',
        'LIFF視窗初始化失敗',
        'error'
      );
      swal.fire({
        title: '錯誤',
        text: 'LIFF視窗初始化失敗',
        type: 'error',
        onClose: () => {
          //liff.closeWindow();
        }
      });

      //show/hide element
      let div_loading = document.getElementById("loading");
      div_loading.className = "ui inverted dimmer";

      let fakeData = {
        "status": 200,
        "userName": "吳駿偉",
        "groupName": "駿偉小組",
        "groupMembers": [
            "吳駿偉",
            "陳昱婷",
            "柯博軒",
            "吳奕萱",
            "方立翔",
            "吳紫寧",
            "朱紘妤",
            "陳夏恩",
            "湯晴",
            "王耀中",
            "潘王安",
            "徐彬",
            "王柏硯",
            "楊凱翔"
        ],
        "eventTime": [
            {
                "timestamp": 1563667200,
                "timestring": "2019-07-20T16:00:00.000Z",
                "type": "主日",
                "attendee": [
                    "柯博軒",
                    "湯晴",
                    "王耀中"
                ]
            },
            {
                "timestamp": 1564272000,
                "timestring": "2019-07-27T16:00:00.000Z",
                "type": "主日",
                "attendee": [
                    "陳夏恩",
                    "朱紘妤"
                ]
            },
            {
                "timestamp": 1564876800,
                "timestring": "2019-08-03T16:00:00.000Z",
                "type": "主日",
                "attendee": [
                    "方立翔",
                    "王耀中",
                    "湯晴"
                ]
            },
            {
                "timestamp": 1565481600,
                "timestring": "2019-08-10T16:00:00.000Z",
                "type": "主日",
                "attendee": [
                    "吳駿偉",
                    "陳昱婷",
                    "柯博軒"
                ]
            },
            {
                "timestamp": 1566086400,
                "timestring": "2019-08-17T16:00:00.000Z",
                "type": "主日",
                "attendee": [
                    "吳駿偉",
                    "陳昱婷",
                    "柯博軒"
                ]
            },
            {
                "timestamp": 1566691200,
                "timestring": "2019-08-24T16:00:00.000Z",
                "type": "主日",
                "attendee": [
                    "吳駿偉",
                    "柯博軒",
                    "湯晴",
                    "徐彬"
                ]
            },
            {
                "timestamp": 1567296000,
                "timestring": "2019-08-31T16:00:00.000Z",
                "type": "小組",
                "attendee": [
                    "吳駿偉",
                    "陳昱婷",
                    "陳夏恩",
                    "朱紘妤"
                ]
            },
            {
                "timestamp": 1567900800,
                "timestring": "2019-09-07T16:00:00.000Z",
                "type": "幸福門訓",
                "attendee": [
                    "陳昱婷",
                    "柯博軒",
                    "湯晴",
                    "王耀中",
                    "潘王安"
                ]
            },
            {
                "timestamp": 1568505600,
                "timestring": "2019-09-14T16:00:00.000Z",
                "type": "主日",
                "attendee": [
                    "吳駿偉",
                    "陳昱婷",
                    "吳奕萱",
                    "方立翔",
                    "王耀中",
                    "湯晴"
                ]
            },
            {
                "timestamp": 1569110400,
                "timestring": "2019-09-21T16:00:00.000Z",
                "type": "聖靈研習",
                "attendee": [
                    "吳駿偉",
                    "陳昱婷",
                    "吳奕萱",
                    "方立翔"
                ]
            }
        ]
      }

      reportData = fakeData;

      clearTable();
      createTableHead(fakeData.eventTime);
      createTableBodyByEvent(fakeData.eventTime, fakeData.groupMembers);

    }
  );
};

function initializeApp(data) {
  //check user permission
  const query_url = hostURL + "?type=record_basic&lineId=" + data.context.userId;
  axios.get(query_url)
  .then(response => {
    // Success

    //show/hide element
    let div_loading = document.getElementById("loading");
    div_loading.className = "ui inverted dimmer";

    if(response.data.status === 200) {
      //Swal.fire(JSON.stringify(response.data));

      reportData = response.data;

      clearTable();
      createTableHead(reportData.eventTime);
      createTableBodyByEvent(reportData.eventTime, reportData.groupMembers);

    } else if(response.data.status === 512) {
      swal.fire({
        title: '沒有權限',
        text: '請先到設定頁面，申請成為回報人員',
        type: 'error',
        onClose: () => {
          liff.closeWindow();
        }
      });
    } else {
      swal.fire(
        '錯誤',
        response.data.message,
        'error'
      );
    }
  })
  .catch(error => {
    // Error
    console.log(error);
    swal.fire(
      '錯誤',
      error,
      'error'
    );
  });
}

function clearTable() {
  $("#userTable").empty();
}

function createTableHead(events) {
  let table = document.getElementById("userTable");
  let header = table.createTHead();
  let headerRow = header.insertRow(0);
  let th = document.createElement('th');
  th.innerHTML = "組員";
  headerRow.appendChild(th);

  events.forEach((event) => {
    if(event.type === selectedFilter) {
      let th = document.createElement('th');
      th.innerHTML = timeStampToString(event.timestamp);
      headerRow.appendChild(th);
    }
  }); 

}

function createTableBodyByEvent(events, groupMembers) {

  //update table
  let table = document.getElementById("userTable");
  let body = table.createTBody();

  groupMembers.forEach((member, idx_row) => {
    let bodyRow = body.insertRow(idx_row);
    let filteredEvents = events.filter(event => event.type === selectedFilter);
    eventsWithFirstColumn = [{}, ...filteredEvents];
    eventsWithFirstColumn.forEach((event, idx_column) => {
      if(idx_column === 0) {
        //name column
        let th = document.createElement('th');
        th.innerHTML = member;
        bodyRow.appendChild(th);
      } else {
        //data column
        let bodyCell  = bodyRow.insertCell(idx_column);
        const isAtendee = event.attendee.indexOf(member) > -1 ? true : false;
        if(isAtendee) bodyCell.innerHTML = "<i class=\"large green checkmark icon\"></i>";
        else bodyCell.innerHTML = "";
      }
    });
  });

  //scroll to last column
  //const headerRow = table.getElementsByTagName('thead')[0];
  //const lastColumn = headerRow.children[0].children[events.length];
  //table.scrollLeft = lastColumn.offsetLeft;
}

function setFilter (filter) {
  selectedFilter = filter;
  console.log(JSON.stringify(filter));

  clearTable();
      createTableHead(reportData.eventTime);
      createTableBodyByEvent(reportData.eventTime, reportData.groupMembers);
}

function timeStampToString (time){
  const datetime = new Date();
  const timezone_shift = 8;
  datetime.setTime((time + (timezone_shift * 60 * 60)) * 1000);
  const month = datetime.getMonth() + 1;
  const date = datetime.getDate();

  if(month < 10 && date < 10) return month + "/0" + date;
  else if(month < 10 && date >= 10) return month + "/" + date;
  else if(month >= 10 && date < 10) return month + "/0" + date;
  else return month + "/" + date;
}

function arrayify(collection) {
  return Array.prototype.slice.call(collection);
}

