const hostURL = "https://script.google.com/macros/s/AKfycbyQwaNfRrnyBB4kCOvdMgUw_o6v8Z_lNUDqjNCT5Uo-dPKBvZ0/exec";
const liffID = "1602321395-Le47oZqq";
const defaultType = "全部顯示";

var allMembers = [];
var allMembersRaw = [];
var allEventTypes = [];
var reportAtendee = [];

var selectedFilter = defaultType;

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

function showSegmentLoading() {
  let time_area = document.getElementById("time-area");
  time_area.className = "ui segment loading";
}

function hideSegmentLoading() {
  let time_area = document.getElementById("time-area");
  time_area.className = "ui segment";
}

function initializeApp(profile) {
  console.log("initializeApp" + JSON.stringify(profile));

  showSegmentLoading();
  const query_url = hostURL + "?type=record_basic&lineId=" + profile.userId;
  axios.get(query_url)
  .then(response => {
    // Success
    hideSegmentLoading();

    if(response.data.status === 200) {
      //Swal.fire(JSON.stringify(response.data));

      //get all users in one array
      allMembers = [];
      allMembersRaw = response.data.groupMembers;
      response.data.groupMembers.forEach((group) => {
        allMembers = allMembers.concat(group.groupMember);
      });
      console.log("allMembers: " + allMembers);

      //create event type select buttons
      createEventButtons(response.data.eventTime);

      //create table
      clearTable();
      createTableHead(response.data.eventTime);
      createTableBodyByEvent(response.data.eventTime);

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
    hideSegmentLoading();
    console.log(error);
    swal.fire(
      '錯誤',
      error,
      'error'
    );
  });
}

function createEventButtons(events) {
  const timeContainer = document.getElementById("time-container");

  //create dummy event "all"
  const dummyType = {
    timestring: undefined,
    type: defaultType
  }
  const displayEvents = [dummyType, ...events];

  displayEvents.forEach((event, index) => {
    //record all event type
    if(allEventTypes.indexOf(event.type) === -1) {
      allEventTypes.push(event.type);

      //create time button
      let btn = document.createElement("button");
      btn.innerHTML = event.type;
      btn.setAttribute("class", (selectedFilter === event.type) ? "ui primary button" : "ui primary basic button");
      btn.setAttribute("id", event.type);
      btn.setAttribute("value", index);
      btn.style.marginBottom = "8px";
      btn.onclick = function(element) {
        selectedFilter = element.target.id;
        console.log("selected filter: " + selectedFilter);

        //redraw all time buttons
        let children = timeContainer.children;
        for (var i = 0; i < children.length; i++) {
          let button = children[i];
          button.className = (button.id === selectedFilter) ? "ui primary button" : "ui primary basic button";
        }

        //re-create table body
        clearTable();
        createTableHead(events);
        createTableBodyByEvent(events);
      }
      timeContainer.appendChild(btn);
    }
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
    if(selectedFilter === defaultType) {
      //all event type included
      let th = document.createElement('th');
      th.innerHTML = event.timestring.substr(4,2) + '/' + event.timestring.substr(6,2) + '<br>' + event.type;
      headerRow1.appendChild(th);
    } else {
        //only show selected type
        if(event.type === selectedFilter) {
        let th = document.createElement('th');
        th.innerHTML = event.timestring.substr(4,2) + '/' + event.timestring.substr(6,2) + '<br>' + event.type;
        headerRow1.appendChild(th);
      }
    }
  }); 

}

function createTableBodyByEvent(events) {

  //update table
  let table = document.getElementById("userTable");
  let body = table.createTBody();

  //filter relative member
  let filteredMembers = [];
  if(selectedFilter.indexOf("小組") > -1) {
    //is one group only
    filteredMembers = allMembersRaw.filter(group => group.groupName === selectedFilter)[0].groupMember;
  } else {
    filteredMembers = allMembers;
  }
  console.log("filtered members" + JSON.stringify(filteredMembers));

  //create table body
  filteredMembers.forEach((member, idx_row) => {
    let bodyRow = body.insertRow(idx_row);
    if(selectedFilter === defaultType) {
      //show all events
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
          if(isAtendee) {
            bodyCell.innerHTML = "<i class=\"large green checkmark icon\"></i>";
            bodyCell.style.backgroundColor = "lightgreen";
          }
          else bodyCell.innerHTML = "";
        }
      });
    } else {
      //show selected event
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
          if(isAtendee) {
            bodyCell.innerHTML = "<i class=\"large green checkmark icon\"></i>";
            bodyCell.style.backgroundColor = "lightgreen";
          }
          else bodyCell.innerHTML = "";
        }
      });
    }
    
  });
}

