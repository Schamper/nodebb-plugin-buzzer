var ModulesSockets = module.parent.require('./socket.io/modules'),
	IndexSockets = module.parent.require('./socket.io/index');

var Buzzer = {};

Buzzer.init = {
    "load": function() {
		ModulesSockets.chats.buzz = Buzzer.sockets.buzz;
    },
    "addScripts": function(scripts, callback) {
        return scripts.concat([
            'plugins/nodebb-plugin-buzzer/js/main.js'
        ]);
    }
}

Buzzer.sockets = {
	"buzz": function(socket, data, callback) {
		if (typeof(data.to) === 'string') {
			var touid = parseInt(data.to, 10);
			if (IndexSockets.isUserOnline(touid)) {
				console.log(socket.uid + ' sent a buzz to ' + touid);
				if (IndexSockets.userSockets[touid]) {
					//Let's only emit on one socket... Don't want them to have a heart attack
					IndexSockets.userSockets[touid][0].emit('event:chats.buzz', {
						fromuid: socket.uid
					});
					if (callback) {
						callback(null, true);
					}
				}
			}
		}
	}
}

module.exports = Buzzer;