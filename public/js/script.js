'use strict';
/*
 * jQuery Face Detection Plugin
 *
 * More demos and Download:
 *
 * http://facedetection.jaysalvat.com
 *
 */
$('#try-it').click(function (e) {
  e.preventDefault();

  //alert('hello');

  $('.face').remove();

  $('#picture').faceDetection({
    complete: function (faces) {
      for (var i = 0; i < faces.length; i++) {
        $('<div>', {
          'class':'face',
          'css': {
            'position': 'absolute',
            'left':   faces[i].x * faces[i].scaleX + 'px',
            'top':    faces[i].y * faces[i].scaleY + 'px',
            'width':  faces[i].width  * faces[i].scaleX + 'px',
            'height': faces[i].height * faces[i].scaleY + 'px'
          }
        })
          .insertAfter(this);
      }
    },
    error:function (code, message) {
      alert('Error: ' + message);
    }
  });
});
