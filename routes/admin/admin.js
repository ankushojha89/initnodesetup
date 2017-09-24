var {config,logger,express} = require('./../../config/default');

var  Employee=require('./../../models/employee');
var router=express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {     
    logger.info(`${req.ip} GET admin home page request `);         
    res.render('admin/index', { title: 'Welcome to Admin Area' });   

    Employee.all(function(err, docs) {
       // res.render('comments', {comments: docs})
       console.log(docs);
      })
});


module.exports=router;