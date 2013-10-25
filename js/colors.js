// I found this online, it adds a "change" event to contentEditable boxes. I needed this to change color whenever the text changes.
$('[contenteditable]').on('focus', function() {
    var $this = $(this);
    $this.data('before', $this.html());
    return $this;
}).on('blur keyup paste', function() {
    var $this = $(this);
    if ($this.data('before') !== $this.html()) {
        $this.data('before', $this.html());
        $this.trigger('change');
    }
    return $this;
});

// Remove and add elements based on whether there is any text and whether you are focused on the box.
$('.paletteInput').focus(function() {
  $('.overlay').fadeOut(200)
  $('.helpEnter').fadeIn()
})
$('.paletteInput').blur(function() {
  if ($('.paletteInput').text() == '') {
    $('.overlay').fadeIn()
    $('.hex').fadeOut()
    $('.palette').fadeOut()
  }
})

/* This is where the magic happens.
** Every time you change the text, I call the ColourLovers API.
** I send them the keywords and they send me back a color.
** Then I color the text with that color.
**/
var colorArray
var colorIndex

$('.paletteInput').change(function() {
  var inputText = $(this).text()

  if (inputText.length > 0) {
    $('.hex').fadeIn()

    var rand = Math.floor(Math.random()*10)

    $.ajax({
      url: "http://www.colourlovers.com/api/colors?keywords="+inputText+"&numResults=20&format=json&jsonCallback=?",
      dataType: 'jsonp',
      success: function(data) {
        colorArray=[]
        for (var i = 0; i < data.length; i++) {
          var hex = toProperHex(data[i].hex)
          colorArray.push(hex)
        }
        colorIndex = 0
        console.log(colorArray)

        var hex = colorArray[colorIndex]
        $('.paletteInput').css("color", hex)
        $('.hex').css("color", hex)
        $('.hex').text(hex)
      }
    })
  }
})

// THIS USED TO BE FOR TRACKING
 
var typeTimer
var typeInterval = 2000
var lastColor
$('.paletteInput').keyup(function() {
  typeTimer = setTimeout(completeColor, typeInterval)
})


$('.paletteInput').keydown(function(e) {
  if (e.keyCode == 13 || e.charCode == 13) {
    var color = $('.paletteInput').css("color")
    var text = $('.paletteInput').text()
    if (text != '') {
      addWord(text, color)
      $('.paletteInput').text("")
    }
    return false;
  } else if (e.keyCode == 38 || e.charCode == 38) {
    toggleColor('up')
    return false;
  } else if (e.keyCode == 40 || e.charCode == 40) {
    toggleColor('down')
    return false;
  }
  clearTimeout(typeTimer)
})

function toProperHex(hex) {
  if (hex != undefined) {
    hex = ("#" + hex) 
  } else {
    hex = "#000000"
  }
  if (hex == "#ffffff" || hex == "#FFFFFF") {
    hex = "#eeeeee"
  }
  return hex
}

function toggleColor(word) {
  if (word == 'up') {
    colorIndex++;
    if (colorIndex >= colorArray.length) colorIndex = 0
  } else {
    colorIndex--;
    if (colorIndex < 0) colorIndex = colorArray.length-1
  }
  var hex = colorArray[colorIndex]
  $('.paletteInput').css("color", hex)
  $('.hex').css("color", hex)
  $('.hex').text(hex)
}

function addWord(text, color) {  
  completeColor()
  newWord = $("<span style='color:"+color+"'>"+text+" </span>")
  $('.poem').append(newWord)
  clicky.log('/colors/add', text)
  $('.helpEnter').remove()
}

function completeColor() {
  var color = $('.paletteInput').text()
  if (color != lastColor && color != '') {
    //clicky.log('/colors/', color, 'search')
    lastColor = color
  }
  clearTimeout(typeTimer)
}


// Tracking
window.onbeforeunload = savePoem

function savePoem() {
  clicky.log('/colors/poem', $('.poem').text())
}
