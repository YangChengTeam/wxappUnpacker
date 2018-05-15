const wu=require("./wuLib.js");
const path=require("path");
const UglifyJS=require("uglify-es");
const {VM}=require('vm2');
function jsBeautify(code){
	return UglifyJS.minify(code,{mangle:false,compress:false,output:{beautify:true,comments:true}}).code;
}
function splitJs(name,cb){
	let dir=path.dirname(name);
	wu.get(name,code=>{
		let vm=new VM({sandbox:{
			require(){},
			define(name,func){
				let code=func.toString();
				code=code.slice(code.indexOf("{")+1,code.lastIndexOf("}")-1).trim();
				let bcode=code;
				if(code.startsWith('"use strict";')||code.startsWith("'use strict';"))code=code.slice(13);
				else if((code.startsWith('(function(){"use strict";')||code.startsWith("(function(){'use strict';"))&&code.endsWith("})();"))code=code.slice(25,-5);
				let res=jsBeautify(code);
				if(typeof res=="undefined"){
					console.log("Fail to delete 'use strict' in \""+name+"\".");
					res=jsBeautify(bcode);
				}
				wu.save(path.resolve(dir,name),jsBeautify(res));
			}
		}});
		vm.run(code.slice(code.indexOf("define(")));
		console.log("Splitting \""+name+"\" done.");
		cb({[name]:8});
	});
}
module.exports={jsBeautify:jsBeautify,splitJs:splitJs};
if(require.main===module){
    wu.commandExecute(splitJs,"Split and beautify weapp js file.\n\n<files...>\n\n<files...> js files to split and beautify.");
}
