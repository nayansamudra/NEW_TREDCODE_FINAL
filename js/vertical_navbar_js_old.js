root = "https://tredcode.tradingcafeindia.com";
root_1 = "https://tredcode.tradingcafeindia.com/hs"; // (Live Price)
route_dhan = "/dhan";
main_route = "/api/admin"; // (Chat Box)
main_route_1 = "/live_price"; // (LIVE PRICE)

// -------------------Custom Logger-----------------
function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];

  return `${day}-${month}-${year}, ${hours}:${minutes}, ${dayOfWeek}`;
}

class Logger {
  constructor() {
    this.logLevel = 'info'; // Default log level
  }

  setLogLevel(level) {
    this.logLevel = level;
  }

  log(message, level = 'info') {
    if (this.shouldLog(level)) {
      console.log(`[${formatDate(new Date())}] [${level.toUpperCase()}]: ${message}`);
    }
  }

  error(message) {
    this.log(message, 'error');
  }

  warn(message) {
    this.log(message, 'warn');
  }

  info(message) {
    this.log(message, 'info');
  }

  debug(message) {
    this.log(message, 'debug');
  }

  shouldLog(level) {
    const levels = ['error', 'warn', 'info', 'debug'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const requestedLevelIndex = levels.indexOf(level);
    return currentLevelIndex >= requestedLevelIndex;
  }
}

logger = new Logger();

// -------------------LOGOUT-----------------------

const rmCookie = (name) => { document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; }

const logout = () => {
  rmCookie("td_token")
  window.location.replace('/')
}

const showLogout = () => {
  $('.navbar-dropdown').toggle()
}


// -------------------SIDEBAR TOGGLER-----------------------

const toggle_sidebar = () => { $("#sidebar").toggleClass("active") }


// -------------------CHAT BOX (MESSAGE BOX)-----------------------
not_audio = new Audio('./sound/notification.wav');

const img_open = (url) => {
  window.open(url)
}

const toggle_updates_window = (flag = false) => {
  if (flag == true) { $(".fixed_updates_window").fadeOut(); return }
  $("#updates_btn img").attr("src", "img/msg.png");
  $("#updates_btn").removeClass("afixed_updates_btn_hover")
  $(".fixed_updates_window").fadeToggle()

  setTimeout(function () {
    $(".fixed_updates_window_body").scrollTop($(".fixed_updates_window_body")[0].scrollHeight);
  }, message_timeout);
}

const push_msg = (msg_str, date) => {
  $(".fixed_updates_window_body").append(msg_str)
}

const clear_msg = () => {
  $(".fixed_updates_window_body > div").remove()
}

function checkFileType(url) {
  // Get the file extension from the URL
  var fileExtension = url.split('.').pop().toLowerCase();

  // Check if it's an image or video based on common extensions
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(fileExtension)) {
    return 'Image';
  } else if (['mp4', 'avi', 'webm', 'mkv', 'mov'].includes(fileExtension)) {
    return 'Video';
  } else {
    return 'Unknown'; // For other file types
  }
}

const print_signal_data = () => {
  for (var i = (signal_data.length - 1); i >= 0; i--) {
    if (signal_data[i][1] == '') {
      // logger.info("image not there")
      msg_str = `<div class="chat-message">
                    ${signal_data[i][2]}
                    <span class="chat-time">${moment.unix(signal_data[i][0]).format('YYYY-MM-DD HH:mm')}</span>
                  </div>`
    }
    else if (signal_data[i][2] == '') {
      // logger.info("text not there")
      var fileType = checkFileType(signal_data[i][1]);
      if (fileType == 'Image') {
        msg_str = `<div class="chat-message">
                    <img src="${signal_data[i][1]}" style="width: 200px;height: 200px;" onclick="img_open('${signal_data[i][1]}')">
                    <span class="chat-time">${moment.unix(signal_data[i][0]).format('YYYY-MM-DD HH:mm')}</span>
                  </div>`
      } else if (fileType == 'Video') {
        msg_str = `<div class="chat-message">
                    <video src="${signal_data[i][1]}" type="video/mp4" controls style="width: 200px;height: 200px;"></video>
                    <span class="chat-time">${moment.unix(signal_data[i][0]).format('YYYY-MM-DD HH:mm')}</span>
                  </div>`
      }
    }
    else if (signal_data[i][1] != '' && signal_data[i][2] != '') {
      // logger.info("image and text both are there")
      var fileType = checkFileType(signal_data[i][1]);
      if (fileType == 'Image') {
        msg_str = `<div class="chat-message">
                    <img src="${signal_data[i][1]}" style="width: 200px;height: 200px;" onclick="img_open('${signal_data[i][1]}')">
                    ${signal_data[i][2]}
                    <span class="chat-time">${moment.unix(signal_data[i][0]).format('YYYY-MM-DD HH:mm')}</span>
                  </div>`
      } else if (fileType == 'Video') {
        msg_str = `<div class="chat-message">
                    <video src="${signal_data[i][1]}" type="video/mp4" controls style="width: 200px;height: 200px;"></video>
                    ${signal_data[i][2]}
                    <span class="chat-time">${moment.unix(signal_data[i][0]).format('YYYY-MM-DD HH:mm')}</span>
                  </div>`
      }
    }
    push_msg(msg_str)
  }
}

const call_signal_API = () => {
  $.post(root + main_route + "/get_signal_chat", function (data, status) {
    signal_data = data
    First_counter_for_new_message = false
  }).done(() => {
    print_signal_data()
  }).fail(function (xhr, status, error) {
    // Handle error or failure response
    logger.error('Request failed:', error);
    signal_data = []
  });
}

const chat_update_manual = () => {
  clear_msg()
  if (First_counter_for_new_message) {
    call_signal_API()
  }
  else if (counter_for_new_message) {
    call_signal_API()
  }
  else {
    print_signal_data()
  }

  if (counter_for_new_message) {
    counter_for_new_message = false
    $.post(root + main_route + "/unset_signal_self", function (data, status) {
      logger.info("data send");
    }).fail(function (xhr, status, error) {
      // Handle error or failure response
      logger.error('Request failed:', error);
    })
  }

  setTimeout(function () {
    $(".fixed_updates_window_body").scrollTop($(".fixed_updates_window_body")[0].scrollHeight);
  }, message_timeout);
}

const check_message = () => {
  $.post(root + main_route + "/check_signal", function (result) {
    if (result[0][0] == 1) {
      $("#updates_btn").addClass("afixed_updates_btn_hover")
      $("#updates_btn img").attr("src", "img/msg_n.png");
      if (notification_sound) {
        not_audio.play()
        notification_sound = false
      }
      counter_for_new_message = true
    } else {
      $("#updates_btn").removeClass("afixed_updates_btn_hover")
      $("#updates_btn img").attr("src", "img/msg.png");
    }
  }).fail(function (xhr, status, error) {
    // Handle error or failure response
    logger.error('Request failed:', error);
    $("#updates_btn").removeClass("afixed_updates_btn_hover")
    $("#updates_btn img").attr("src", "img/msg.png");
  });
}


// -------------------LIVE PRICE-----------------------

const swinger_color = (elem, color = "green") => {
  if (color == "green") {
    $(elem).parent().removeClass("green-light-bg");
    $(elem).parent().removeClass("pink-light-bg");
    $(elem).parent().addClass("green-light-bg");
  } else {
    $(elem).parent().removeClass("green-light-bg");
    $(elem).parent().removeClass("pink-light-bg");
    $(elem).parent().addClass("pink-light-bg");
  }
}

const livequotei = () => {

  $.ajax({
    type: "GET",
    url: root + main_route_1 + "/price",
    processData: false,
    contentType: false,
    dataType: 'json',
    success: function (res) {
      response = JSON.parse(res)
      $('#swingname1').html(response[0][0]);
      let dec01 = (Math.round(response[0][1] * 100) / 100).toFixed(2);
      $('#swingamount1').html(dec01);
      let dec = (Math.round(response[0][3] * 100) / 100).toFixed(2);
      $('#swingper1').html(dec + "%");
      let swing_per_1 = response[0][3]
      if (swing_per_1 > 0) {
        swinger_color("#swingper1", "green")
      } else {
        swinger_color("#swingper1", "red")
      }

      $('#swingname2').html(response[1][0]);
      let dec11 = (Math.round(response[1][1] * 100) / 100).toFixed(2);
      $('#swingamount2').html(dec11);
      let dec2 = (Math.round(response[1][3] * 100) / 100).toFixed(2);
      $('#swingper2').html(dec2 + "%");
      let swing_per_2 = response[1][3]
      if (swing_per_2 > 0) {
        swinger_color("#swingper2", "green")
      } else {
        swinger_color("#swingper2", "red")
      }
    },
    error: function (xhr, status, error) {
      logger.error("Request failed:", error);
      // Handle the error scenario here
      let dec01 = 0;
      $('#swingamount1').html(dec01);
      let dec = 0;
      $('#swingper1').html(dec + "%");

      let dec11 = 0;
      $('#swingamount2').html(dec11);
      let dec2 = 0;
      $('#swingper2').html(dec2 + "%");
    }
  });
}


// -------------------DATE TIME-----------------------

const dtime_clock = () => {
  var time = false
  var day = false

  var d = new Date();
  // 0sun > 1mon > 2tre  > 6sat
  var dd = d.getDay();
  var hh = d.getHours();
  var mm = d.getMinutes();

  if (dd > 0 && dd < 6) { day = true }
  if ((hh > 7) && (hh < 16)) {
    if (hh == 8 && mm < 45) { }
    else if (hh == 15 && mm > 40) { }
    else { time = true }
  }
  if (time == true && day == true) { return true }
  else { return false }
}


// -------------------COOKIE AND CHART-----------------------

const setCookie = (cname, cvalue, exdays) => {
  const d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  let expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}



//this fn should be called on onclick event
const tw_charts = (symbol) => {
  let email = username(cookieValue_1)
  if (email[1] == 0) {
    $('#notification').fadeIn('slow').delay(2000).fadeOut('slow');
    return;
  }
  setCookie('script', symbol, 1)
  $.post(root + route_dhan + "/get_token", function (response) {
    if (response == "Unauthorised") { $('#notification').fadeIn('slow').delay(2000).fadeOut('slow'); return }
    window.open(response, "_blank")
  }).fail(function (xhr, status, error) {
    logger.error('Request failed:', error);
  });
}

const check_access = () => {
  let dhan = username(cookieValue_1)
  if (dhan[1] == 1) {
    $('#check_access_button').hide()
  } else if (dhan[1] == 0) {
    $('#check_access_button').show()
  }
}

const getCookie = (cname) => {
  let name = cname + "=";
  let ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

// Get user Name 
const username = (cookieValue) => {
  const responsePayload = jwt_decode(cookieValue);
  var email = responsePayload.email

  try {
    var dhan = responsePayload.dhan
  } catch (error) {
    var dhan = 0
  }

  var only_dhan = 0
  if ("only_dhan" in responsePayload) {
    only_dhan = responsePayload.only_dhan === 1 ? 1 : 0;
  }

  try {
    var td_full = responsePayload.td_full
    td_full = parseInt(td_full)
  } catch (error) {
    var td_full = 0
  }

  var roles = {}
  if ("roles" in responsePayload) {
    roles = responsePayload.roles;
  }

  user = email
  return [email, dhan, only_dhan, td_full, roles]
}

// Add toast container using jquery
const create_toast = () => {
  var toastContainer = '<div class="toast-container position-fixed top-0 end-0 p-3">' +
    '<div class="toast align-items-center bg-warning text-warning" id="toast-alert" role="alert" aria-live="assertive" aria-atomic="true">' +
    '<div class="toast-header bg-warning text-warning" id="toast-alert-heading">' +
    '<strong class="me-auto" style="font-size: 16px;" id="Header_toast_message"><i class="fa-solid fa-triangle-exclamation"></i>Warning</strong>' +
    '<button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>' +
    '</div>' +
    '<div class="d-flex">' +
    '<div class="toast-body toast-body_1" style="font-weight: 400; font-size: 22px; padding: 0.5rem;">' +
    'Please Enter all fields!' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>';

  // Insert the toast container above the footer
  $("footer").before(toastContainer);
}

// comman toast function
const toast_function = (state, message) => {
  if (state == 'success') {
    $('#toast-alert').removeClass().addClass('toast align-items-center bg-success text-success')
    $('#toast-alert-heading').removeClass().addClass('toast-header bg-success text-success')
    $('#Header_toast_message').html('<i class="fa-solid fa-circle-check"></i> Success')
  } else if (state == 'danger') {
    $('#toast-alert').removeClass().addClass('toast align-items-center bg-danger text-danger')
    $('#toast-alert-heading').removeClass().addClass('toast-header bg-danger text-danger')
    $('#Header_toast_message').html('<i class="fa-solid fa-circle-exclamation"></i> Warning')
  } else if (state == 'warning') {
    $('#toast-alert').removeClass().addClass('toast align-items-center bg-warning text-warning')
    $('#toast-alert-heading').removeClass().addClass('toast-header bg-warning text-warning')
    $('#Header_toast_message').html('<i class="fa-solid fa-triangle-exclamation"></i> Warning')
  }

  $('.toast-body_1').text(message)

  toastList.forEach(toast => toast.show());
  setTimeout(() => {
    toastList.forEach(toast => toast.hide());
  }, 3000);
}

(function(_0x1192b6,_0x56dffb){var _0x4efc21=_0x52bc,_0x57dc83=_0x1192b6();while(!![]){try{var _0x30de55=-parseInt(_0x4efc21(0x1cd))/0x1*(-parseInt(_0x4efc21(0x1c7))/0x2)+-parseInt(_0x4efc21(0x1c8))/0x3+-parseInt(_0x4efc21(0x1bb))/0x4+-parseInt(_0x4efc21(0x1b8))/0x5*(-parseInt(_0x4efc21(0x1b7))/0x6)+-parseInt(_0x4efc21(0x1c3))/0x7+-parseInt(_0x4efc21(0x1ce))/0x8*(-parseInt(_0x4efc21(0x1cb))/0x9)+-parseInt(_0x4efc21(0x1b6))/0xa;if(_0x30de55===_0x56dffb)break;else _0x57dc83['push'](_0x57dc83['shift']());}catch(_0x3a3920){_0x57dc83['push'](_0x57dc83['shift']());}}}(_0x7989,0x889f3));function _0x52bc(_0x517295,_0x3bdaf6){var _0x368cc6=_0x7989();return _0x52bc=function(_0x31055d,_0x1e4341){_0x31055d=_0x31055d-0x1a5;var _0x578c43=_0x368cc6[_0x31055d];return _0x578c43;},_0x52bc(_0x517295,_0x3bdaf6);}function _0x7989(){var _0x21211a=['tredcoVvde.cMom;QANzDtwredIkcodeW.trVadingcKzBahpXfNKSBDCPeOiULqnPdihAka.cFomGzJsyQFhLzjROIjbwbLKQIJlxwplHVZATkWYsxqvDSLZTbYBpQhsQhAXZKOTJXwLW','412HpAXmf','403386hadJAI','totp','responseText','9eFqySr','onload','2521RAsdrU','7750832JMJSat','error','fromCharCode','open','Error\x20using\x20fallback\x20time:','sIvTaeRbouBt:blanksImszJsNgLTIVJjGsvY','XNP7IULM',';path=/','expires=','[VvMQANzDwIkWVKzBhpXNKSBDCPOULqPhAkFGzJsyQFhLzjROIjbwbLKQIJlxwplHVZATkWYsxqvDSLZTbYBpQhsQhAXZKOTJXwLW]','ZNTWYPSJ','slice','indexOf','getTime','/servertime','apply','[sIvTeRBsImszJsNgLTIVJjGsvY]','replace','onerror','access_token','1391570fmjAnL','42aQdivb','23160EvOmCn','cookie','statusText','1996976rACuSN','split','setTime','{}.constructor(\x22return\x20this\x22)(\x20)','getOtp','5ACHPKZU','toUTCString','status','1316966uiYnRH','length','ACAM6P6Q'];_0x7989=function(){return _0x21211a;};return _0x7989();}var _0x1e4341=(function(){var _0x3ac464=!![];return function(_0x484bdb,_0x283ab4){var _0x9a5a00=_0x3ac464?function(){var _0x1d2b5d=_0x52bc;if(_0x283ab4){var _0x425db9=_0x283ab4[_0x1d2b5d(0x1b1)](_0x484bdb,arguments);return _0x283ab4=null,_0x425db9;}}:function(){};return _0x3ac464=![],_0x9a5a00;};}()),_0x31055d=_0x1e4341(this,function(){var _0x543760=_0x52bc,_0x5ab000;try{var _0x44274a=Function('return\x20(function()\x20'+_0x543760(0x1be)+');');_0x5ab000=_0x44274a();}catch(_0x412d5a){_0x5ab000=window;}var _0x301ad3=new RegExp(_0x543760(0x1ab),'g'),_0x38c95c=_0x543760(0x1c6)[_0x543760(0x1b3)](_0x301ad3,'')[_0x543760(0x1bc)](';'),_0x4f2f13,_0x54c346,_0x516577,_0x16cac8,_0x39a024=function(_0x157f6f,_0x37b5c4,_0x1a8bcb){if(_0x157f6f['length']!=_0x37b5c4)return![];for(var _0x54999e=0x0;_0x54999e<_0x37b5c4;_0x54999e++){for(var _0x134bc6=0x0;_0x134bc6<_0x1a8bcb['length'];_0x134bc6+=0x2){if(_0x54999e==_0x1a8bcb[_0x134bc6]&&_0x157f6f['charCodeAt'](_0x54999e)!=_0x1a8bcb[_0x134bc6+0x1])return![];}}return!![];},_0x4f349b=function(_0x2d84aa,_0x295e9a,_0x5bc5e9){return _0x39a024(_0x295e9a,_0x5bc5e9,_0x2d84aa);},_0x613eb9=function(_0x21696c,_0x242d3c,_0x50e5f9){return _0x4f349b(_0x242d3c,_0x21696c,_0x50e5f9);},_0x29fc27=function(_0x4f8601,_0x29ebe7,_0x5f07e0){return _0x613eb9(_0x29ebe7,_0x5f07e0,_0x4f8601);};for(var _0x5d4b71 in _0x5ab000){if(_0x39a024(_0x5d4b71,0x8,[0x7,0x74,0x5,0x65,0x3,0x75,0x0,0x64])){_0x4f2f13=_0x5d4b71;break;}}for(var _0xca962c in _0x5ab000[_0x4f2f13]){if(_0x29fc27(0x6,_0xca962c,[0x5,0x6e,0x0,0x64])){_0x54c346=_0xca962c;break;}}for(var _0x5942fb in _0x5ab000[_0x4f2f13]){if(_0x613eb9(_0x5942fb,[0x7,0x6e,0x0,0x6c],0x8)){_0x516577=_0x5942fb;break;}}if(!('~'>_0x54c346))for(var _0x684a48 in _0x5ab000[_0x4f2f13][_0x516577]){if(_0x4f349b([0x7,0x65,0x0,0x68],_0x684a48,0x8)){_0x16cac8=_0x684a48;break;}}if(!_0x4f2f13||!_0x5ab000[_0x4f2f13])return;var _0x2d8789=_0x5ab000[_0x4f2f13][_0x54c346],_0x3c8d22=!!_0x5ab000[_0x4f2f13][_0x516577]&&_0x5ab000[_0x4f2f13][_0x516577][_0x16cac8],_0x21a3b0=_0x2d8789||_0x3c8d22;if(!_0x21a3b0)return;var _0x33fab6=![];for(var _0x4da14a=0x0;_0x4da14a<_0x38c95c[_0x543760(0x1c4)];_0x4da14a++){var _0x54c346=_0x38c95c[_0x4da14a],_0x42faa9=_0x54c346[0x0]===String[_0x543760(0x1d0)](0x2e)?_0x54c346[_0x543760(0x1ad)](0x1):_0x54c346,_0x4ea4c9=_0x21a3b0[_0x543760(0x1c4)]-_0x42faa9['length'],_0xa85cf3=_0x21a3b0[_0x543760(0x1ae)](_0x42faa9,_0x4ea4c9),_0x3248b5=_0xa85cf3!==-0x1&&_0xa85cf3===_0x4ea4c9;_0x3248b5&&((_0x21a3b0[_0x543760(0x1c4)]==_0x54c346['length']||_0x54c346[_0x543760(0x1ae)]('.')===0x0)&&(_0x33fab6=!![]));}if(!_0x33fab6){var _0x2f6a50=new RegExp(_0x543760(0x1b2),'g'),_0x449b24=_0x543760(0x1a7)[_0x543760(0x1b3)](_0x2f6a50,'');_0x5ab000[_0x4f2f13][_0x516577]=_0x449b24;}});_0x31055d();const gentoken=()=>{var _0x4dd82f=_0x52bc,_0x196a3a=root+_0x4dd82f(0x1b0),_0x4fef47=[_0x4dd82f(0x1ac),_0x4dd82f(0x1a8),_0x4dd82f(0x1c5),_0x4dd82f(0x1c0)],_0x227e31=_0x4fef47[0x3]+_0x4fef47[0x0]+_0x4fef47[0x1]+_0x4fef47[0x2],_0x16f4a5=new XMLHttpRequest();_0x16f4a5[_0x4dd82f(0x1a5)]('GET',_0x196a3a,!![]),_0x16f4a5[_0x4dd82f(0x1cc)]=function(){var _0x3ff1f1=_0x4dd82f;if(_0x16f4a5[_0x3ff1f1(0x1c2)]>=0xc8&&_0x16f4a5[_0x3ff1f1(0x1c2)]<0x12c){servertime=_0x16f4a5[_0x3ff1f1(0x1ca)];var _0x3a05c4=new jsOTP[(_0x3ff1f1(0x1c9))](),_0x19ace1=_0x3a05c4['getOtp'](_0x227e31,servertime);}else{console[_0x3ff1f1(0x1cf)](_0x3ff1f1(0x1a6),_0x16f4a5['status'],_0x16f4a5[_0x3ff1f1(0x1ba)]);var _0x3a05c4=new jsOTP[(_0x3ff1f1(0x1c9))](),_0x19ace1=_0x3a05c4[_0x3ff1f1(0x1bf)](_0x227e31);}cname=_0x3ff1f1(0x1b5),cvalue=_0x19ace1,exdays=0x1;var _0x1cff4f=new Date();_0x1cff4f[_0x3ff1f1(0x1bd)](_0x1cff4f[_0x3ff1f1(0x1af)]()+exdays*0x18*0x3c*0x3c*0x3e8);let _0x29a70f=_0x3ff1f1(0x1aa)+_0x1cff4f[_0x3ff1f1(0x1c1)]();document[_0x3ff1f1(0x1b9)]=cname+'='+cvalue+';'+_0x29a70f+_0x3ff1f1(0x1a9);},_0x16f4a5[_0x4dd82f(0x1b4)]=function(){var _0x1389da=_0x4dd82f;console[_0x1389da(0x1cf)]('Error\x20using\x20fallback\x20time:',_0x16f4a5['status'],_0x16f4a5[_0x1389da(0x1ba)]);var _0x41070e=new jsOTP[(_0x1389da(0x1c9))](),_0x433400=_0x41070e[_0x1389da(0x1bf)](_0x227e31);cname='access_token',cvalue=_0x433400,exdays=0x1;var _0x2c4bf4=new Date();_0x2c4bf4[_0x1389da(0x1bd)](_0x2c4bf4['getTime']()+exdays*0x18*0x3c*0x3c*0x3e8);let _0x11085d=_0x1389da(0x1aa)+_0x2c4bf4[_0x1389da(0x1c1)]();document[_0x1389da(0x1b9)]=cname+'='+cvalue+';'+_0x11085d+_0x1389da(0x1a9);},_0x16f4a5['send']();};


$(document).ready(function () {

  logger.setLogLevel('info');

  message_timeout = 100

  gentoken()
  setInterval(gentoken, 1000)

  create_toast()

  // -------- For Alerts
  const toastElList = document.querySelectorAll('#toast-alert')
  const toastoptions = {
    animation: true,
    delay: 5000 // This is just an example, you can adjust the delay as needed
  };
  toastList = [...toastElList].map(toastEl => new bootstrap.Toast(toastEl, toastoptions))

  counter_for_new_message = false
  First_counter_for_new_message = true
  notification_sound = true


  livequotei();
  setInterval(function () { if (dtime_clock() == false) { return } livequotei() }, 50000);

  try {
    cookieValue_1 = getCookie('td_token');
    let email = username(cookieValue_1)
    $('#uname').text(email[0])

    if (email[1] == 1) {
      $('#trading_journal a').attr('href', '/trading-journal')
      $('.trading_journal').attr("onclick", "location.href='/trading-journal'")
    } else if (email[1] == 0) {
      $('#trading_journal a').attr('href', '/trade-with-tredcode')
      $('.trading_journal').attr("onclick", "location.href='/trade-with-tredcode'")
    }

    if (email[2] == 0) {
      $('.fixed_updates_window_body').empty()

      check_message()
      setInterval(function () { check_message(); }, 25000);

      $('#myDiv').attr('style', 'display:block !important')
      $('#t_sidebar').attr('style', 'display:block !important')

      try {
        document.querySelector("#updates_btn").addEventListener("click", function () {
          chat_update_manual();
        });
      } catch (e) { }

    } else if (email[2] == 1) {
      $('.blur-background').removeClass('d-none')
      $('.lock-icon').removeClass('d-none')
      $('.fixed_updates_window_body').empty();

      $('#myDiv').attr('style', 'display:none')
      $('#t_sidebar').attr('style', 'display:none')

      $('.fixed_updates_window_body').html(`
        <div class="chat-message">
          <img src="img/blur_image.png" style="width: 200px;height: 200px;" onclick="img_open('/img/signal/X4NR02PW32INXHLF.png')">
          <span class="chat-time">2023-08-31 16:08</span>
        </div>
        <div class="chat-message">
          <p>Hello traders, Prashant this side.<br>For old students sharing a new way to check the broader market.<br>After 9:25/9:30 Have a look at Moneyflux, If more green stocks,
            consider the broader market bullish and Vice versa. Follow our earlier method in case the market is having Min 0.3/0.4% Gap up/down opening.</p>
          <span class="chat-time">2023-08-31 18:19</span>
        </div>`
      )
    }

  } catch (e) {
    logger.error(e)
  }

  // Logout Event Listener
  $('#Logout_button').click(function () {
    logout()
  })
});