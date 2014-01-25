define(['chat'], function(chat) {
    var html = {
        'buzzbutton': '<button type="button" href="#" class="btn btn-success" id="chat-buzz-btn">Buzz</button>',
		'audio': '<audio id="chats-buzz-audio" src="/plugins/nodebb-plugin-buzzer/sound/secret_buzz_sound.mp3" preload="auto"></audio>'
	}

    var module = {},
		local = {};

    module.base = {
        "init": function() {
            local.base.addListeners();
        }
    }

    local.base = {
        "initBuzz": function(modal) {
            local.base.addHTML(modal, function(modal) {
                local.actions.buzz.register(modal);
				local.actions.onbuzz.register(modal);
            });
        },
        "addListeners": function() {
            local.actions.load.register();
        },
        "addHTML": function(modal, callback) {
            //Button
			$('body').append(html.audio);
            modal.find('.input-group-btn').append(html.buzzbutton);
            callback(modal);
        }
    }

    local.actions = {
        "load": {
            "register": function() {
                $('body').on('focus', '#chat-message-input', this.handle);
            },
            "handle": function(e) {
                var modal = $(e.target).parents('.chat-modal');
                var isEquipped = modal.data('buzz-equiped');
                if (!isEquipped) {
                    modal.data('buzz-equiped', true);
                    local.base.initBuzz(modal);
                }
            }
        },
        "buzz": {
            "register": function(modal) {
                modal.find('#chat-buzz-btn').off('click').on('click', function(e) {
					e.currentTarget.disabled = true;
					setTimeout(function() {
						e.currentTarget.disabled = false;
					}, 2000);
					//Rate limit it just a little bit
					var uid = local.utils.getUID(modal);
					local.actions.buzz.handle(modal, uid);
				});
            },
            "handle": function(modal, uid) {
				socket.emit('modules.chats.buzz', {'to': uid});
            }
        },
        "onbuzz": {
			"isBuzzing": false,
            "register": function(modal) {
				if (socket.listeners('event:chats.buzz').length === 0) {
					socket.on('event:chats.buzz', this.handle);
				}
            },
            "handle": function(data) {
				var isBuzzing = local.actions.onbuzz.isBuzzing;
				//Kinda limit it, don't want them to completely lose it but still be annoyed!
				if (!isBuzzing) {
					var audio = document.getElementById('chats-buzz-audio');
					audio.pause();
					audio.currentTime = 0;
					var modal = chat.getModal(data.fromuid);
					if (modal.length > 0) {
						isBuzzing = true;
						modal.addClass('animated tada');
						audio.play();
						chat.appendChatMessage(modal, "You got buzzed!", Date.now())
						setTimeout(function() {
							modal.removeClass('animated tada');
							isBuzzing = false;
						}, 1000);
					}
				}
            }
        }
    }

    local.utils = {
        "getUID": function(modal) {
            return modal.get(0).id.match(/\d+/)[0];
        }
    }

    return module;
});