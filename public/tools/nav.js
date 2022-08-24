/* eslint-disable no-undef */
window.addEventListener('DOMContentLoaded', function (event) {
  console.log('DOM fully loaded and parsed');
  websdkready();
});

function websdkready() {
  var testTool = window.testTool;
  if (testTool.isMobileDevice()) {
    // eslint-disable-next-line no-undef
    var vConsole = new VConsole();
  }
  console.log("checkSystemRequirements");
  // console.log(JSON.stringify(ZoomMtgEmbedded.checkSystemRequirements()));

  var API_KEY = "u5qC1ELSSZCKviHPgS6CFQ";

  /**
   * NEVER PUT YOUR ACTUAL API SECRET IN CLIENT SIDE CODE, THIS IS JUST FOR QUICK PROTOTYPING
   * The below generateSignature should be done server side as not to expose your api secret in public
   * You can find an eaxmple in here: https://marketplace.zoom.us/docs/sdk/native-sdks/web/essential/signature
   */
  var API_SECRET = "a2MvVSSilfE65SY1dk81rbQ3SM1NbDZ1qGvf";
  // some help code, remember mn, pwd, lang to cookie, and autofill.
  // document.getElementById("display_name").value = testTool.detectOS() + "#" + testTool.getBrowserInfo();
  // document.getElementById("meeting_number").value = testTool.getCookie(
  //   "meeting_number"
  // );
  // document.getElementById("meeting_pwd").value = testTool.getCookie(
  //   "meeting_pwd"
  // );
  // if (testTool.getCookie("meeting_lang"))
  //   document.getElementById("meeting_lang").value = testTool.getCookie(
  //     "meeting_lang"
  //   );

  // document
  //   .getElementById("meeting_lang")
  //   .addEventListener("change", function (e) {
  //     testTool.setCookie(
  //       "meeting_lang",
  //       document.getElementById("meeting_lang").value
  //     );
  //     testTool.setCookie(
  //       "_zm_lang",
  //       document.getElementById("meeting_lang").value
  //     );
  //   });
  // copy zoom invite link to mn, autofill mn and pwd.
  // document
  //   .getElementById("meeting_number")
  //   .addEventListener("input", function (e) {
  //     var tmpMn = e.target.value.replace(/([^0-9])+/i, "");
  //     if (tmpMn.match(/([0-9]{9,11})/)) {
  //       tmpMn = tmpMn.match(/([0-9]{9,11})/)[1];
  //     }
  //     var tmpPwd = e.target.value.match(/pwd=([\d,\w]+)/);
  //     if (tmpPwd) {
  //       document.getElementById("meeting_pwd").value = tmpPwd[1];
  //       testTool.setCookie("meeting_pwd", tmpPwd[1]);
  //     }
  //     document.getElementById("meeting_number").value = tmpMn;
  //     testTool.setCookie(
  //       "meeting_number",
  //       document.getElementById("meeting_number").value
  //     );
  //   });

  // document.getElementById("clear_all").addEventListener("click", function (e) {
  //   testTool.deleteAllCookies();
  //   document.getElementById("display_name").value = "";
  //   document.getElementById("meeting_number").value = "";
  //   document.getElementById("meeting_pwd").value = "";
  //   document.getElementById("meeting_lang").value = "en-US";
  //   document.getElementById("meeting_role").value = 0;
  //   window.location.href = "/index.html";
  // });

  // click join meeting button
  document
    .getElementById("join_meeting")
    .addEventListener("click", function (e) {
      e.preventDefault();
      var meetingConfig = testTool.getMeetingConfig();

      meetingConfig.mn = document.getElementById("join_meeting_id").value;
      meetingConfig.name = document.getElementById("join_meeting_name").value;
      meetingConfig.pwd = document.getElementById("join_meeting_pwd").value;

      if (!meetingConfig.mn || !meetingConfig.name) {
        alert("Meeting number or username is empty");
        return false;
      }

      // generateSignature define in token-tool.js
      generateSignature({
        meetingNumber: meetingConfig.mn,
        apiKey: API_KEY,
        apiSecret: API_SECRET,
        role: 0,
        success: function (res) {
          meetingConfig.signature = res;
          meetingConfig.apiKey = API_KEY;
          var joinUrl = "/index.html?" + testTool.serialize(meetingConfig);
          window.open(joinUrl, "_blank");
        },
      });
    });

  function copyToClipboard(elementId) {
    console.log(document.getElementById(elementId))
    var aux = document.createElement("input");
    aux.setAttribute("value", document.getElementById(elementId).getAttribute('link'));
    document.body.appendChild(aux);
    aux.select();
    aux.setSelectionRange(0, 99999); /* For mobile devices */

    /* Copy the text inside the text field */
    navigator.clipboard.writeText(aux.value);

    /* Alert the copied text */
    alert("Copied the text: " + aux.value);
    document.body.removeChild(aux);
  }

  // click copy jon link button
  window.copyJoinLink = function (element) {
    var meetingConfig = testTool.getMeetingConfig();
    meetingConfig.mn = testTool.getCookie("meeting_number");
    meetingConfig.pwd = testTool.getCookie("meeting_pwd");
    meetingConfig.name = "Participant 1"

    generateSignature({
      meetingNumber: meetingConfig.mn,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      role: 0,
      success: function (res) {
        console.log(res)
        meetingConfig.signature = res;
        meetingConfig.apiKey = API_KEY;
        var joinUrl =
          testTool.getCurrentDomain() +
          "/index.html?" +
          testTool.serialize(meetingConfig);
        console.log(joinUrl);
        document.getElementById('copy_link_value').setAttribute('link', joinUrl);
        copyToClipboard('copy_link_value');

      },
    });
  };


  // create funtion to create meeting
  document.getElementById("create_meeting").addEventListener("click", async function (e) {
    e.preventDefault();
    const userName = document.getElementById('meeting_name').value;
    e.target.disabled = true;
    e.target.innerHTML = "Creating...";
    try {
      const res = await axios.get("https://us-central1-zoom-api-0001.cloudfunctions.net/createZoomMeeting?email=me");
      const data = res.data;
      if (!data) {
        return;
      }
      var meetingConfig = testTool.getMeetingConfig();
      meetingConfig.mn = data.id;
      meetingConfig.name = userName
      meetingConfig.pwd = data.encrypted_password;

      testTool.setCookie("meeting_number", data.id);
      testTool.setCookie("meeting_pwd", data.encrypted_password);

      // generateSignature define in token-tool.js
      generateSignature({
        meetingNumber: data.id,
        apiKey: API_KEY,
        apiSecret: API_SECRET,
        role: 1,
        success: function (res) {
          meetingConfig.signature = res;
          meetingConfig.apiKey = API_KEY;
          let joinUrl = "/index.html?" + testTool.serialize(meetingConfig);
          window.open(joinUrl, "_blank");
        },
      });
    }
    catch (err) {
      console.error(err);
    }
    finally {
      e.target.disabled = false;
      e.target.innerHTML = "Create Meeting";
      // $("#create_meeting_modal").modal("hide")
    }


  });


}


