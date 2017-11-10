
/* 
db.passiverefs.aggregate( [ { $unwind : "$passiveDowns" }, {$match: {"upperRef" : "r1TZ58t2W","passiveDowns.startupPaid" : true}}, {$project: {"passiveDowns": 1, "_id": 0}} ] ).pretty()

db.directrefs.aggregate( [ { $unwind : "$downlines" }, {$match: {"userId" : "BJAUqc5hb","downlines.level1" : "Pass"}}, {$project: {"downlines": 1, "_id": 0}} ] ).pretty()

db.passiverefs.aggregate( [ { $unwind : "$passiveDowns" }, {$match: {"upperRef" : "BJAUqc5hb", "passiveDowns.level1" : "Pass"}}, {$project: {"passiveDowns": 1, "_id": 0}} ] ).pretty()
let nexmo = new Nexmo({
     apiKey: "48ce9908",
     apiSecret: "7f59529e4d066303",
 });


db.survey.update({ }, { $pull: { results: { score: 8 , item: "B" } } },{ multi: true })

exports.postUpdateInfo1 = (req, res)=>{
    let form = new formidable.IncomingForm();
    // Chanege formidable to multiparty
    form.keepExtensions = true;
    form.parse(req, (err, fields, files)=>{
        let profilePic = files.profilePic.path;

        cloudinary.uploader.upload(
            profilePic,
            (picData)=>{
                let profileImgUrl = picData.url;

                User.findOne({username: req.user.username}, (err, user)=>{
                    if(err)console.log(err);
                    else{
                        user.profilePic = profileImgUrl;
                    }
                    user.save((err)=>{
                        if(err){
                            console.log(err);
                        }else{
                            console.log("the Picture Uploaded with id:" + profileImgUrl)
                        }
                    });
                });
            },
            {
                public_id: `img_${req.user.userId}`, 
            }
        );  */

       

    } else if (req.url === '/upload') {
        var form = new multiparty.Form();
        var destPath;
        form.on('field', function(name, value) {
          if (name === 'path') {
            destPath = value;
          }
        });
        form.on('part', function(part) {
          s3Client.putObject({
            Bucket: bucket,
            Key: destPath,
            ACL: 'public-read',
            Body: part,
            ContentLength: part.byteCount,
          }, function(err, data) {
            if (err) throw err;
            console.log("done", data);
            res.end("OK");
            console.log("https://s3.amazonaws.com/" + bucket + '/' + destPath);
          });
        });
        form.parse(req);
    
      } else {
        res.writeHead(404, {'content-type': 'text/plain'});
        res.end('404');
      }



      User.findOne({username: req.user.username}, (err, user)=>{
        if(err)console.log(err);
        else{
            user.profilePic = profileImgUrl;
        }
        user.save((err)=>{
            if(err){
                console.log(err);
            }else{
                console.log("the Picture Uploaded with id:" + profileImgUrl)
            }
        });
    });


    {
        public_id: `img_${req.user.userId}`, 
    }