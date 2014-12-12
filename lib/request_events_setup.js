/*

Maps modules defined in '/handlers/request' as handlers for socket events of type 'server.request'. 
Where function defined in a module is configured as the handler for a socket event
whose data is a object with a property named 'type' matching module filename. 

@example - The file: '/handlers/request/add.js' will be the handler of socket event whose data is:
{
	type: "add",
	...
}

@info - Each module in 'request' folder should export a single function that takes as arguments:
	<object>|null - Params as sent by client.
	<function> - Function to call when processing complete.

	Function takes the arguments:
		- 1st argument
		status <boolean> - 	Whether request was successful
		
		- 2nd argument
		error <string> -	If 'status' is false an error is required. Defaults to 'generic'
			OR					
		data <object> - 	If 'status' is true. Data to send to client. (Optional)


@info - If matching file is not found no events will be emitted.

@info - File named 'template.js' will be ignored
	
@usage - To use module:
	var module = require(...)(socket);
	where <socket> is socket.io Socket object.
	@see http://socket.io/docs/server-api/#socket

*/

var gFolder_memcache = require("node-folder-memcache");
var request_handler_folder_path = path.resolve(path.dirname(module.filename), '..', 'handlers/request');
var file_folder_ignore = ['template.js'];
var request_handler_folder = new gFolder_memcache(request_handler_folder_path, {items: file_folder_ignore});

module.exports = function(socket){

  socket.on('server.request', function(package){

    // Creating object to be sent to client
    var reply = {
      type: package.type,
      id: package.id
    };

    // Look for event handler file in '/handlers/request'
    var file = request_handler_folder.findFile(package.type + ".js", false);
    
    if(file){
      var handler = file.require();

      handler(package.params, function(){

        if(typeof arguments[0] === 'boolean'){

          /*
          Status true, expects:
            0. status
            1. data [optional]
          */            
          if(arguments[0]){
            reply.status = true;

            if(typeof arguments[1] === 'object'){
              reply.data = arguments[1];
            }

          /*
          Status false, expects:
            0. status
            1. error
          */            
          } else {
            reply.status = false;

            if(typeof arguments[1] === 'string'){
              reply.error = arguments[1];
            } else {
              reply.error = "generic";
            }
          }

        }

        // If event was handled and reply generated, emit object to client
        if(typeof reply.status === 'boolean')
          socket.emit('client.response', reply);
        
      });
    }

  });

}