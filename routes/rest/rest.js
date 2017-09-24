var {config,logger,express} = require('./../../config/default');
var router=express.Router();
const  Employee=require('./../../models/employee');
const {ObjectID}=require('mongodb');
const multer=require('multer');
const csv = require('fast-csv');
const _=require('lodash');

// file upload locations
var upload=multer({dest:'./public/images/profileimages'});
var csvupload=multer({dest:'./public/files/bulkuploads'});


/* REST GET all request */
router.get('/', function(req, res, next) {     
    logger.info(`${req.ip} REST GET all employees request`);      
    Employee.all(function(err, employees) {
        if(err){
            err.message='Error in getting all employees list';
            err.status = 400;
            next(err);   
        }                   
        res.send({employees});
      })
});


/* REST GET By ID request */
router.get('/:id',(req,res,next)=>{               
    var id=req.params.id;
    logger.info(`${req.ip} REST GET By ID request for ${id}`);
    if(!ObjectID.isValid(id)){          
       var err= new Error(`Not a valid id`);
       err.message='Not a valid id';
       err.status = 404;
       return next(err);     
    }    
    Employee.findById(id,(err, employee)=>{
            if(err){
                err.message='No employee found';
                return next(err);   
            } else if(!employee){  
                var err= new Error(`No employee found`);
                err.message='No employee found';
                err.status = 400;
                return next(err);             
            }             
            res.send(employee);
    });
 });

/*REST Post request */
 router.post('/',  upload.single('profileimage'),function(req, res, next) {

   var body=_.pick(req.body,['name','email','designation','short_desc','desc']);  

   logger.info(`${req.ip} REST Post request for `,body);

   req.checkBody('name','Name field is required').notEmpty();
   req.checkBody('email','Valid email field is required').isEmail();
   req.checkBody('email','Email field is required').notEmpty();
   req.checkBody('designation','Designation field is required').notEmpty();
   req.checkBody('short_desc','Short Description field is required').notEmpty();
   req.checkBody('desc','Description field is required').notEmpty();

   var errors=req.validationErrors();
   
   if(errors){   
    logger.error(`${req.ip} REST Post request validation error for `,errors);                  
    return  res.status(404).send({ message: 'Bummer! Error Add Employee', errors});        
   }else{
    if(req.file){
        logger.info(`${req.ip} Locading... `,req.file.filename);       
        body.profileimage=req.file.filename;
    }
    Employee.save(body,(err, employee)=>{
            if(err){
                err.message='Error in creation of new employee';
                return next(err);   
            }     
            employee._id=employee._id.toString();
            logger.info(`${req.ip} REST Post request completed for `,employee);        
            return  res.send(employee);
    });      
   } 
 });
/*REST Delete request */
 router.delete('/:id',(req,res,next)=>{    
     
    var id=req.params.id;
    logger.info(`${req.ip} REST Delete By ID request for ${id}`);
    if(!ObjectID.isValid(id)){          
       var err= new Error(`Not a valid id`);
       err.message='Not a valid id';
       err.status = 404;
       return next(err);     
    }    

    Employee.findByIdAndRemove(id,(err,employee)=>{
        if(err){
            err.message='No employee found';
            return next(err);   
        }  
        logger.info(`${req.ip} REST Delete By ID request completed for ${id}`);             
        res.send(employee);
    });
}); 



module.exports=router;


