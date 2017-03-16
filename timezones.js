var clockWedges = 24;
var radius = 150
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
  var r = radius


  timeSlices.forEach(function (slice) {
    r = radius-10

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
    var theta = i * 2*Math.PI/clockWedges;
    // offset text rotation by 90 deg, because we want upright text to start from
    // due east
    var thetaDeg = (theta - Math.PI/2) * (180/Math.PI);
    r = radius

    // multiply y coords by -1 to flip y-axis so up (north) is positive
    var x = Math.floor((r-40) * Math.sin(theta));
    var y = Math.floor((r-40) * Math.cos(theta)) * -1;
    var x1 = Math.floor(r * Math.sin(theta));
    var y1 = Math.floor(r * Math.cos(theta)) * -1;
    var x2 = Math.floor((r-20) * Math.sin(theta));
    var y2 = Math.floor((r-20) * Math.cos(theta)) * -1;

    var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    // console.log(line);
    line.setAttribute('x1', x1)
    line.setAttribute('y1', y1)
    line.setAttribute('x2', x2)
    line.setAttribute('y2', y2)
    wheel.appendChild(line)

    var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute('x', x1)
    text.setAttribute('y', y1)
    text.innerHTML = (' '+thetaDeg).slice(0, 6)
    text.setAttribute('transform', 'rotate(' + thetaDeg + ' ' + x1 + ' ' + y1 + ')')
    wheel.appendChild(text)

    var clockHour = document.createElementNS("http://www.w3.org/2000/svg", "text");
    clockHour.setAttribute('x', x)
    clockHour.setAttribute('y', y)
    clockHour.innerHTML = i
    wheel.appendChild(clockHour)
  }

  // // add default location
  // addLocation({ label: 'you, right now.', utc: null }, radius-15)
  // // add some examples
  // addLocation({ label: 'berlin.', utc: 2-1 }, radius-15)
  // addLocation({ label: 'san francisco.', utc: -8+1 }, radius-15)

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
    addLocation({
      label: labelForm.value  || utcForm.selectedOptions[0].innerHTML,
      utc: Number(utcForm.value) + labelDST.checked
    }, radius-15)

    // clear form
    labelForm.value = ''
  }
  else {
    console.log('nope');
  }
}

// loc is an object of shape:
// { labels: array(<string>), utc: int }
// r is the radius
function addLocation(loc, r) {
  var date = new Date()
  if (loc.utc) {

  }

  var locationbox = document.getElementById('locations')
  var location = document.createElement('div');
  var hourOffset = loc.utc? ((loc.utc + date.getUTCHours() + 24) % 24) : date.getHours()

  if (locations[hourOffset]) {
    locations[hourOffset]['labels'].push(loc.label)
    var timelabel = document.querySelector('#locations .location-' + hourOffset)
    timelabel.innerHTML += ' & ' + loc.label
  }
  else {
    locations[hourOffset] = {
      labels: [loc.label]
    }

    // subtract Math.PI/2 to start 0th utc at top
    var theta = 2*Math.PI/clockWedges*hourOffset - Math.PI/2;
    theta = theta % (Math.PI*2);
    var x = r * Math.sin(theta);
    var y = r * Math.cos(theta);
    location.innerHTML = loc.label
    location.setAttribute('class', 'location location-' + hourOffset)
    location.style.top = x + 'px'
    location.style.left = y + 'px'

    // correct for words being upside down if on left side
    // TODO
    // if (theta > Math.PI + Math.PI/2) {
    //   theta = theta - Math.PI
    // }
    location.style.transform = 'rotateZ(' + theta + 'rad)'

    locationbox.appendChild(location)
  }
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
