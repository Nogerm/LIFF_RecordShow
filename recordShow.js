const hostURL = "https://script.google.com/macros/s/AKfycbyQwaNfRrnyBB4kCOvdMgUw_o6v8Z_lNUDqjNCT5Uo-dPKBvZ0/exec";
const liffID = "1602321395-Le47oZqq";

var allMembers = [];
var allEvents = [];
var reportAtendee = [];

var selectedFilter = "all";

//init
window.onload = function (e) {
  liff.init(
    {
      liffId: liffID
    },
    data => {
      console.log('LIFF initialization ok', data)
      if (liff.isLoggedIn()) {
        console.log('LIFF is logged in')
        liff.getProfile()
          .then(profile => {
            console.log('getProfile ok displayName', profile.displayName);
            initializeApp(profile);
          })
          .catch((err) => {
            console.log('getProfile error', err);
          })
      } else {
        console.log('LIFF is not logged in');
        liff.login();
      }
    },
    err => {
      console.log('LIFF initialization failed', err);
    }
  );
}

function initializeApp(profile) {
  console.log("initializeApp" + JSON.stringify(profile));

  const query_url = hostURL + "?type=record_basic&lineId=" + profile.userId;
  axios.get(query_url)
  .then(response => {
    // Success

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

  //#2 row: date
  let headerRow1 = header.insertRow(0);
  let th1 = document.createElement('th');
  th1.innerHTML = "組員";
  headerRow1.appendChild(th1);

  events.forEach((event) => {
    if(selectedFilter === "all") {
      let th = document.createElement('th');
      th.innerHTML = event.timestring.substr(4,2) + '/' + event.timestring.substr(6,2);
      headerRow1.appendChild(th);
    } else if(event.type === selectedFilter) {
      let th = document.createElement('th');
      th.innerHTML = event.timestring.substr(4,2) + '/' + event.timestring.substr(6,2);
      headerRow1.appendChild(th);
    }
  }); 

}

function createTableBodyByEvent(events, groupMembers) {

  //update table
  let table = document.getElementById("userTable");
  let body = table.createTBody();

  //get all users in one array
  let allMembers = [];
  groupMembers.forEach((group) => {
    allMembers = allMembers.concat(group.groupMember);
  });

  allMembers.forEach((member, idx_row) => {
    let bodyRow = body.insertRow(idx_row);
    if(selectedFilter === "all") {
      eventsWithFirstColumn = [{}, ...events];
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
    } else {
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
    }
    
  });

  //scroll to last column
  const headerRow = table.getElementsByTagName('thead')[0];
  const lastColumn = headerRow.children[0].children[events.length];
  table.scrollLeft = lastColumn.offsetLeft;
}

function setFilter (filter) {
  selectedFilter = filter;
  console.log(JSON.stringify(filter));

  clearTable();
  createTableHead(reportData.eventTime);
  createTableBodyByEvent(reportData.eventTime, reportData.groupMembers);

  document.getElementById("主日").checked    = selectedFilter === "主日" ? true : false;
  document.getElementById("小組").checked    = selectedFilter === "小組" ? true : false;
  document.getElementById("幸福門訓").checked = selectedFilter === "幸福門訓" ? true : false;
  document.getElementById("聖靈研習").checked = selectedFilter === "聖靈研習" ? true : false;
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

