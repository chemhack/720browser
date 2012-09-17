Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

function LoggingService() { 
  this.wrappedJSObject = this;
}
LoggingService.prototype = {
  classDescription: "Logging component",
  classID:          Components.ID("{674913d5-670c-4202-a25a-5f32309c3a6c}"),
  contractID:       "@720browser.com/loggingService;1",
  QueryInterface:   XPCOMUtils.generateQI(),
  service: true,
  log:function(msg){

  },
  logObject:function(obj){
  	
  }
};

var components = [LoggingService];
if (XPCOMUtils.generateNSGetFactory) 
	var NSGetFactory = XPCOMUtils.generateNSGetFactory(components); // FF4, Gecko 2
else 
	var NSGetModule = XPCOMUtils.generateNSGetModule(components); // FF3, Gecko 1.9
