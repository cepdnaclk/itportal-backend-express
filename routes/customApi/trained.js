const ObjectId = require('mongoose').Types.ObjectId; 
const _ = require('lodash');
const EventEmitter = require('events');
const spawn = require('child_process').spawn;


function api(router){

router.post('/trained/companyToSkills',function(req, res){
    let skills = (req.body.skills);
    let output = "";

    var py = spawn('python', ['private/trainer/getCompanyForSkills.py']);

    py.stdout.on('data', function(data){
        output += data.toString();
    });
    py.stderr.on('data', function(data){
        console.log(data);
    });
    py.stdout.on('end', function(){
        res.status(200).send(output);
    });

    py.stdin.write(JSON.stringify([skills]));
    py.stdin.end();

});

}

module.exports = api;