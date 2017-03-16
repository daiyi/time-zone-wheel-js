var clockWedges = 24;
var RADIUS = 150
var locations = {}
var timeSlices = [
  {
    className: 'awake-hours',
    start: 7,
    end: 23
  },
  {
    className: 'work-hours',
    start: 9,
    end: 17
  },
  {
    className: 'social-hours',
    start: 8,
    end: 22
  }
]

// q: daiyi why are you writing in es-ancient??
// a: Well it's kind of like sometimes when you have the urge to put on a suit of
//    armour and do battle for your honor on a noble steed.
//    Nostalgia isn't quit the word and neither is masochism.
//    I did submit this to RC as a no-frameworks challenge so I won't slap
//    react on this until after they see it anyway :P

// note to self: this circle math is super messed up, because of the way the
// svg coordinate system is (up is -y instead of y)
// todo: fix circle math

document.addEventListener("DOMContentLoaded", function(e) {
  var page = document.getElementById('page')
  var wheelbox = document.getElementById('wheel-box')
  var wheel = document.getElementById('wheel')
  var r = RADIUS


  // todo
  timeSlices.forEach(function (slice) {
    r = RADIUS-10

    var x1 = Math.floor(r * Math.sin(slice.start * -2 * Math.PI/clockWedges + Math.PI + 3/clockWedges));
    var y1 = Math.floor(r * Math.cos(slice.start * -2 * Math.PI/clockWedges + Math.PI + 3/clockWedges));
    var x2 = Math.floor(r * Math.sin(slice.end * -2 * Math.PI/clockWedges + Math.PI + 3/clockWedges));
    var y2 = Math.floor(r * Math.cos(slice.end * -2 * Math.PI/clockWedges + Math.PI + 3/clockWedges));

    var timeslice = document.createElementNS("http://www.w3.org/2000/svg", "path");
    var largeArcFlag = slice.end - slice.start > clockWedges/2? 1:0

    // var arc = 'M x1 y1    A r r 0 largeArcFlag 1 x2 y2    L 0 0 Z'
    var arc = 'M ' + x1 + ' ' + y1 + ' A ' + r + ' ' + r + ' 0 ' + largeArcFlag + ' 1 ' + x2 + ' ' + y2 + ' L 0 0 Z'

    timeslice.setAttribute('d', arc)
    timeslice.setAttribute('class', slice.className)
    wheel.appendChild(timeslice)
  })

  for (var i=0; i < clockWedges; i++) {
    var theta = getThetaFromHour(i);
    // offset text rotation by 90 deg, because we want upright text to start from
    // due east
    var thetaDeg = (theta - Math.PI/2) * (180/Math.PI);
    var p1 = getPointOnWheel(RADIUS-40, theta)
    var p2 = getPointOnWheel(RADIUS-20, theta)
    var p3 = getPointOnWheel(RADIUS, theta)

    var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute('x1', p2.x)
    line.setAttribute('y1', p2.y)
    line.setAttribute('x2', p3.x)
    line.setAttribute('y2', p3.y)
    wheel.appendChild(line)

    // var text = getLocationTextSVG(i, RADIUS)
    // text.innerHTML = (' '+thetaDeg).slice(0, 6)
    // wheel.appendChild(text)

    var clockHour = document.createElementNS("http://www.w3.org/2000/svg", "text");
    clockHour.setAttribute('x', p1.x)
    clockHour.setAttribute('y', p1.y)
    clockHour.innerHTML = i
    wheel.appendChild(clockHour)
  }

  // add default location
  addLocationToWheel({ label: 'you, right now.', utc: null }, RADIUS)
  // // add some examples
  addLocationToWheel({ label: 'berlin.', utc: 2-1 }, RADIUS)
  addLocationToWheel({ label: 'san francisco.', utc: -8+1 }, RADIUS)

  // add event listeners
  document.getElementById('button-add-location').addEventListener('click', processNewLocation)
});

function rotateTimewheel(e) {
  var wheel = document.getElementById('wheel')
  var reg = /rotateZ\((.*)rad\)/g;
  var regMatches = reg.exec(wheel.style.transform)
  var rads = regMatches? Number(regMatches[1]) : 0
  var newRads = rads

  switch (e.keyCode) {
    case 37:
      newRads -= 2*Math.PI/clockWedges
      break
    case 39:
      newRads += 2*Math.PI/clockWedges
      break
  }

  wheel.style.transform = 'rotateZ(' + newRads + 'rad)'
}

function processNewLocation(e) {
  e.preventDefault()
  var form = document.getElementById('form-add-location')
  var utcForm = document.getElementById('input-timezone-utc')
  var labelForm = document.getElementById('input-timezone-label')
  var labelDST = document.getElementById('input-timezone-dst')

  if (utcForm && utcForm.value && labelForm) {
    addLocationToWheel({
      label: labelForm.value  || utcForm.selectedOptions[0].innerHTML,
      utc: Number(utcForm.value) + labelDST.checked
    }, RADIUS)

    // clear form
    labelForm.value = ''
  }
  else {
    console.log('nope');
  }
}

// this adds an svg text to the DOM.
// loc is an object of shape:
// { labels: array(<string>), utc: int }
// r is the RADIUS
function addLocationToWheel(locObj, r) {
  var date = new Date()
  if (locObj.utc) {

  }

  var locationBox = document.getElementById('wheel-locations')
  var hourOffset = locObj.utc? ((locObj.utc + date.getUTCHours() + 24) % 24) : date.getHours()

  // already a label in this time slot
  if (locations[hourOffset]) {
    locations[hourOffset]['labels'].push(locObj.label)
    var timelabel = document.querySelector('#wheel-locations .location-' + hourOffset)
    timelabel.innerHTML += ' & ' + locObj.label
  }
  // add to new time slot!
  else {
    locations[hourOffset] = {
      labels: [locObj.label]
    }

    var text = getLocationTextSVG(hourOffset, r)
    text.innerHTML = locObj.label
    locationBox.appendChild(text)

    // todo
    // var box = getLocationBox(hourOffset, r-80)
    // locationBox.insertBefore(box, text);
  }

}


function getPointOnWheel(r, theta) {
  // multiply y coords by -1 to flip y-axis upright, so that up (north) is positive
  return {
    x: ((r) * Math.sin(theta)),
    y: ((r) * Math.cos(theta) * -1)
  }
}

function getThetaFromHour(hour) {
  return hour * 2*Math.PI/clockWedges;
}

function getLocationTextSVG(hour, r) {
  var theta = getThetaFromHour(hour);
  // offset text rotation by 90 deg, because we want upright text to start from
  // due east
  var thetaDeg = (theta - Math.PI/2) * (180/Math.PI);
  var p = getPointOnWheel(r, theta)

  var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute('x', p.x)
  text.setAttribute('y', p.y)
  text.setAttribute('class', 'location location-' + hour)
  text.setAttribute('transform', 'rotate(' + thetaDeg + ' ' + p.x + ' ' + p.y + ')')
  return text
}

function getLocationBox(hour, r) {
  var theta = getThetaFromHour(hour);
  // offset text rotation by 90 deg, because we want upright text to start from
  // due east
  var thetaDeg = (theta - Math.PI/2) * (180/Math.PI);
  var p = getPointOnWheel(r, theta)

  var box = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  box.setAttribute('x', p.x)
  box.setAttribute('y', p.y)
  box.setAttribute("width", 200);
  box.setAttribute("height", '15px');
  box.setAttribute('class', 'location location-' + hour)
  box.setAttribute("fill", 'rgba(0,0,0,0.5)');
  box.setAttribute('transform', 'rotate(' + thetaDeg + ' ' + p.x + ' ' + p.y + ')')

  return box
}


// todo eventhandler on dom labels
function removeLocation(locKey) {
  var timelabel = document.querySelector('#locations .location-' + locKey)

  // remove from data structure
  locations[locKey].slice(locations[locKey].indexOf(timelabel.innerHTML), 1)

  // remove from dom
  timelabel.parentNode().removeChild(timeLabel)
}

// todo localstorage


document.addEventListener("keydown", function (e) {
    throttle(rotateTimewheel, e);
}, false);

var throttle = (function () {
  var timeWindow = 200; // time in ms
  var lastExecution = new Date((new Date()).getTime() - timeWindow);

  return function (fn, e) {
    if ((lastExecution.getTime() + timeWindow) <= (new Date()).getTime()) {
      lastExecution = new Date();
      fn(e)
    }
  };
}());
