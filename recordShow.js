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
          liff.closeWindow();
        }
      });

      //show/hide element
      let div_loading = document.getElementById("loading");
      div_loading.className = "ui inverted dimmer";
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

      createTableHead(response.data.eventTime);
      createTableBodyByEvent(response.data.eventTime, response.data.groupMembers);

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

function createTableHead(events) {
  let table = document.getElementById("userTable");
  let header = table.createTHead();
  let headerRow = header.insertRow(0);
  let th = document.createElement('th');
  th.innerHTML = "組員";
  headerRow.appendChild(th);

  events.forEach((event) => {
    let th = document.createElement('th');
    const timeDateStr = event.timestring.split('T')[0];
    const timeStr = timeDateStr.split('-')[1] + '/' + timeDateStr.split('-')[2];
    th.innerHTML = timeStr;
    headerRow.appendChild(th);
  }); 

}

function createTableBodyByEvent(events, groupMembers) {

  //update table
  let table = document.getElementById("userTable");
  let body = table.createTBody();

  groupMembers.forEach((member, idx_row) => {
    let bodyRow = body.insertRow(idx_row);
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

