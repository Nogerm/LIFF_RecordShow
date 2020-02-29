const hostURL = "https://script.google.com/macros/s/AKfycbyQwaNfRrnyBB4kCOvdMgUw_o6v8Z_lNUDqjNCT5Uo-dPKBvZ0/exec";
const liffID = "1653896800-R8Mowq80";
const defaultType = "全部顯示";

var allMembers = [];
var allMembersRaw = [];
var allEventTypes = [];
var reportAtendee = [];
var globalEvents = [];

var selectedFilter = defaultType;
var selectedGroup = undefined;

//init
window.onload = function (e) {
  liff.init({
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

  console.log("height: " + window.innerHeight);
  let tableContainer = document.getElementById("table-container");
  tableContainer.setAttribute("max-width", window.innerWidth);
}

function showSegmentLoading() {
  let time_area = document.getElementById("type-area");
  time_area.className = "ui segment loading";
}

function hideSegmentLoading() {
  let time_area = document.getElementById("type-area");
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

      if (response.data.status === 200) {
        //Swal.fire(JSON.stringify(response.data));

        //get all users in one array
        allMembers = [];
        allMembersRaw = response.data.groupMembers;
        response.data.groupMembers.forEach((group) => {
          allMembers = allMembers.concat(group.groupMember);
        });
        console.log("allMembers: " + allMembers);
        globalEvents = response.data.globalEvent;

        //create group list select buttons
        createGroupButtons(response.data.groupName, response.data.eventTime);

        //create event type select buttons
        createEventButtons(response.data.eventTime);

        //create table
        clearTable();
        createTableHead(response.data.eventTime);
        createTableBodyByEvent(response.data.eventTime);
        setTableMaxHeight();

      } else if (response.data.status === 512) {
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

function createGroupButtons(groupList, events) {
  const groupContainer = document.getElementById("group-container");
  if (groupList.length > 0) selectedGroup = groupList[0];

  //filter 講員 group
  const filteredGroup = groupList.filter(group => group.groupName !== "講員")
  console.log("filteredGroup" + JSON.stringify(filteredGroup))

  filteredGroup.forEach((groupName, index) => {
    //create time button
    let btn = document.createElement("button");
    btn.innerHTML = groupName;
    btn.setAttribute("class", (selectedGroup === groupName) ? "ui teal button" : "ui teal basic button");
    btn.setAttribute("id", groupName);
    btn.setAttribute("value", index);
    btn.style.marginBottom = "8px";
    btn.onclick = function (element) {
      selectedGroup = element.target.id;
      console.log("selected group: " + selectedGroup + JSON.stringify(element.target));

      //redraw all group buttons
      let children = groupContainer.children;
      for (var i = 0; i < children.length; i++) {
        let button = children[i];
        button.className = (button.id === selectedGroup) ? "ui teal button" : "ui teal basic button";
      }

      //re-create table body
      createEventButtons(events)
      clearTable();
      createTableHead(events);
      createTableBodyByEvent(events);
      setTableMaxHeight();
    }
    groupContainer.appendChild(btn);
  });
}

function createEventButtons(events) {
  const timeContainer = document.getElementById("type-container");
  while (timeContainer.firstChild) {
    timeContainer.removeChild(timeContainer.firstChild);
  }
  allEventTypes = [...globalEvents, selectedGroup];
  const displayEvents = [defaultType, ...allEventTypes];
  console.log("displayEvents" + JSON.stringify(displayEvents))

  displayEvents.forEach((typeName, index) => {
    //create type button
    let btn = document.createElement("button");
    btn.innerHTML = typeName;
    btn.setAttribute("class", (selectedFilter === typeName) ? "ui primary button" : "ui primary basic button");
    btn.setAttribute("id", typeName);
    btn.setAttribute("value", index);
    btn.style.marginBottom = "8px";
    btn.onclick = function (element) {
      console.log("element: " + element);
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
      setTableMaxHeight();
    }
    timeContainer.appendChild(btn);

  });
  console.log("allEventTypes" + JSON.stringify(allEventTypes));
}

function setTableMaxHeight() {
  let tableContainer = document.getElementById("tableContainer");
  //tableContainer.style.maxHeight = (window.innerHeight - tableContainer.offsetTop) + 'px';
  tableContainer.style.maxHeight = window.innerHeight + 'px';
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

  //filter events
  const filteredEvents = events.filter(event => allEventTypes.indexOf(event.type) > -1).reverse();

  filteredEvents.forEach((event) => {
    const filteredMembers = allMembersRaw.filter(group => group.groupName === selectedGroup)[0].groupMember;
    const filteredAttendeeArray = event.attendee.filter(item => filteredMembers.includes(item))
    console.log("filteredAttendeeArray" + JSON.stringify(filteredAttendeeArray))
    const peopleCountStr = event.isSuspend === "V" ? "暫停" : filteredAttendeeArray.length + '人';
    if (selectedFilter === defaultType) {
      //all event type included
      let th = document.createElement('th');
      th.innerHTML = event.timestring.substr(4, 2) + '/' + event.timestring.substr(6, 2) + '<br>' + event.type + '<br>(' + peopleCountStr + ')';
      headerRow1.appendChild(th);
    } else {
      //only show selected type
      if (event.type === selectedFilter) {
        let th = document.createElement('th');
        th.innerHTML = event.timestring.substr(4, 2) + '/' + event.timestring.substr(6, 2) + '<br>' + event.type + '<br>(' + peopleCountStr + ')';
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
  if (globalEvents.indexOf(selectedGroup) === -1) {
    //is one group only
    filteredMembers = allMembersRaw.filter(group => group.groupName === selectedGroup)[0].groupMember;
  } else {
    filteredMembers = allMembers;
  }
  console.log("filtered members" + JSON.stringify(filteredMembers));

  //filter events
  const filteredEvents = events.filter(event => allEventTypes.indexOf(event.type) > -1).reverse();

  //create table body
  filteredMembers.forEach((member, idx_row) => {
    let bodyRow = body.insertRow(idx_row);
    if (selectedFilter === defaultType) {
      //show all events
      eventsWithFirstColumn = [{}, ...filteredEvents];
      eventsWithFirstColumn.forEach((event, idx_column) => {
        if (idx_column === 0) {
          //name column
          let th = document.createElement('th');
          th.innerHTML = member;
          bodyRow.appendChild(th);
        } else {
          //data column
          let bodyCell = bodyRow.insertCell(idx_column);
          const isAtendee = event.attendee.indexOf(member) > -1 ? true : false;
          const isSuspend = event.isSuspend === "V" ? true : false;
          if (isSuspend) {
            bodyCell.style.backgroundColor = "lightgrey"
          } else if (isAtendee) {
            bodyCell.innerHTML = "<i class=\"large green checkmark icon\"></i>";
            bodyCell.style.backgroundColor = "lightgreen";
          } else bodyCell.innerHTML = "";
        }
      });
    } else {
      //show selected event
      let filteredTypeEvents = filteredEvents.filter(event => event.type === selectedFilter);
      eventsWithFirstColumn = [{}, ...filteredTypeEvents];
      eventsWithFirstColumn.forEach((event, idx_column) => {
        if (idx_column === 0) {
          //name column
          let th = document.createElement('th');
          th.innerHTML = member;
          bodyRow.appendChild(th);
        } else {
          //data column
          let bodyCell = bodyRow.insertCell(idx_column);
          const isAtendee = event.attendee.indexOf(member) > -1 ? true : false;
          const isSuspend = event.isSuspend === "V" ? true : false;
          if (isSuspend) {
            bodyCell.style.backgroundColor = "lightgrey"
          } else if (isAtendee) {
            bodyCell.innerHTML = "<i class=\"large green checkmark icon\"></i>";
            bodyCell.style.backgroundColor = "lightgreen";
          } else bodyCell.innerHTML = "";
        }
      });
    }

  });
}