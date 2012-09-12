Components.utils.import("resource://gre/modules/FileUtils.jsm");

if(!t20brs) var t20brs={};

t20brs.options = {

  updateform: function() {
    var disabled = !document.getElementById("enable").checked;
    var useff = document.getElementById("useffprofile").checked;
    var file = FileUtils.getFile("AChrom", [".use-firefox-profile"]);
    if (useff) {
      if (!file.exists())
        file.create(0, 384);
    } else {
      if (file.exists())
        file.remove(false);
    }
  }
};

