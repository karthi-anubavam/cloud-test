// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#fff');
var Cloud = require('ti.cloud');
if (!Titanium.Facebook) {
	Titanium.Facebook = require('facebook');
}
Titanium.Facebook.appid = "206625749508663";
Titanium.Facebook.permissions = ['publish_stream', 'read_stream', 'email', 'user_about_me'];

var win = Titanium.UI.createWindow({
	title : 'Cloud Test',
	backgroundColor : '#fff',
	layout : "vertical"
});

var statusButton = Ti.UI.createButton({
	top : 20,
	title : 'Status',
	height : "40",
	width : "180"
});
win.add(statusButton);

statusButton.addEventListener('click', function() {
	alert("Status:\n Cloud.hasStoredSession = " + Cloud.hasStoredSession()+"\nCloud.accessToken === " + Cloud.accessToken+",\nCloud.sessionId = "+Cloud.sessionId);
});

var userInfoButton = Ti.UI.createButton({
	top : 20,
	title : 'Fetch user info',
	height : "40",
	width : "180"
});
win.add(userInfoButton);

userInfoButton.addEventListener('click', function() {
	//if (Cloud.hasStoredSession()) {
		getExistingUserInfo();
	//} else {
	//	alert("You are not loggedin yet, please login");
	//}
});

var fbButton = Ti.UI.createButton({
	top : 20,
	title : 'FB Login',
	height : "40",
	width : "180"
});
win.add(fbButton);

fbButton.addEventListener('click', function() {
	Ti.API.info("@@## fbSignupBtn clicked");
	Ti.API.info("@@## Titanium.Facebook.loggedIn = " + Titanium.Facebook.loggedIn);
	if (Titanium.Facebook.loggedIn) {
		var logOutWarning = Titanium.UI.createAlertDialog({
			title : "",
			message : 'Are you sure want to Logout from Facebook',
			buttonNames : ['Yes', 'No'],
			cancel : 1
		});
		logOutWarning.show();
		logOutWarning.addEventListener('click', function(e) {
			Titanium.API.info('e = ' + JSON.stringify(e));
			if (e.index == 0) {
				Titanium.Facebook.logout();
				Titanium.Facebook.accessToken = null;
				var client = Titanium.Network.createHTTPClient();
				client.clearCookies('https://login.facebook.com');
				client.clearCookies('http://login.facebook.com');
			}
		});
	} else {
		Ti.API.info("@@## Titanium authorize() caling ");
		Titanium.Facebook.authorize();
	}
});

var logoutButton = Ti.UI.createButton({
	top : 20,
	title : 'Logout',
	height : "40",
	width : "180"
});
win.add(logoutButton);

logoutButton.addEventListener('click', logoutUser);

function loginCallback (e) {
	if (e.success) {
		alert("Fb login sucess called");
		Cloud.SocialIntegrations.externalAccountLogin({
			type : 'facebook',
			token : Ti.Facebook.accessToken
		}, function(e) {
			if (e.success) {
				var user = e.users[0];
				Ti.API.info('Success:\\n' + 'id: ' + user.id + '\\n' + 'first name: ' + user.first_name + '\\n' + 'last name: ' + user.last_name);
				alert("SocialIntegrations success, user = " + JSON.stringify(user));
			} else {
				config.showAlert('', 'Error:' + ((e.error && e.message) || JSON.stringify(e)));
			}
		});

	} else if (e.error) {
		alert("error, e = " + JSON.stringify(e));
		Ti.API.info("error, e = " + JSON.stringify(e));
		config.showAlert("", "Error:" + e.error);
	} else if (e.cancelled) {
		//alert("canceld");
	}
	//removing eventListener
	Titanium.Facebook.removeEventListener('login', loginCallback);
};

Titanium.Facebook.addEventListener('login', loginCallback);

function getExistingUserInfo() {
	Ti.API.info("##### Getting Existing User Info");
	Cloud.Users.showMe(function(e) {
		if (e.success) {
			var user = e.users[0];
			alert('Existing user info, user:\\n' + 'id: ' + user.id + '\\n' + 'first name: ' + user.first_name + '\\n' + 'last name: ' + user.last_name);
			Ti.API.info("##### Existing User Obj " + JSON.stringify(e.users[0]));
		} else {
			alert('Error: ' + ((e.error && e.message) || JSON.stringify(e)));
		}
	});
}

function logoutUser() {
	Titanium.Facebook.logout();
	Titanium.Facebook.accessToken = null;
	var client = Titanium.Network.createHTTPClient();
	client.clearCookies('https://login.facebook.com');
	client.clearCookies('http://login.facebook.com');
	
	Cloud.Users.logout(function(e) {
		if (e.success) {
			alert("logout success");
		} else {
			alert("Error:" + e);
		}
	});
}

win.open();
