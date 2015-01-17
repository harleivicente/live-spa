/*

Maps modules defined in '/handlers/control' as handlers for socket events of type 'server.control'. 
Where function defined in a module is configured as the handler for a socket event
whose data is a object with a property named 'type' matching module filename. 

@example - The file: '/handlers/control/add.js' will be the handler of socket event whose data is:
{
	type: "add",
	...
}

@info - Each module in 'control' folder should export a single function that takes as arguments:
	<object>|null - Params as sent by client.

@info - File named 'template.js' will be ignored
	
@usage - To use module:
	var module = require(...)(socket);
	where <socket> is socket.io Socket object.
	@see http://socket.io/docs/server-api/#socket

*/

var gFolder_memcache = require("node-folder-memcache");
var control_handler_folder_path = path.resolve(path.dirname(module.filename), '..', 'handlers/control');
var file_folder_ignore = ['template.js'];
var control_handler_folder = new gFolder_memcache(control_handler_folder_path, {items: file_folder_ignore});

module.exports = function(socket, session){

  socket.on('server.control', function(package){
    
    // Look for event handler file in '/handlers/control'
    var file = control_handler_folder.findFile(package.type + ".js", false);
    
    if(file){
      var handler = file.require();

      handler(package.params, session);
    }

  });

}