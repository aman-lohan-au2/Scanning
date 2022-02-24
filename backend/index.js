const express = require('express')
const app = express()
const sql = require('mssql')
const bodyParser = require('body-parser')
const sqlConfig =require('./databases/config')
const sqlConfig1 = require('./databases/config1')
const cors = require('cors')
const jwt = require('jsonwebtoken');
require('dotenv').config()


const Port= 8001

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())



app.use(cors())

app.get('/',function(req,res){
  res.send('Hello')
})

app.post('/login', async (req,res) => {
  const name = req.body.name;
  const password = req.body.password;
  console.log(name,password)
  try{
    await sql.connect(sqlConfig)
   const result = await sql.query(`select UID,uPWD,uName,CUST_ID,cust_name from User_Rights where CUST_ID='${name}' and uPWD ='${password}'`)
   console.log(result.recordset)
   if(result.recordset.length){
    const token = jwt.sign({ ...result.recordset[0] }, process.env.JWT_KEY, { expiresIn: 5 * 24 * 60 * 60 })
    res.status(200).send({status:"Success",token,result:result.recordset})
   }else{
    res.status(401).send({
      status:"Fail"
    })

   }
  //  res.send(result.recordset)
  }
  catch(err){
    res.send(err)
  }
})

app.post('/assets', async function(req,res){
    const id = req.body.data
    console.log(req.body)
    try{
      await sql.connect(sqlConfig)
      const duplicate = await sql.query(`SELECT * FROM Tbl_assetsdata ta where assests_id='${id}'`)
   console.log(duplicate)
   if(duplicate.recordset.length===0){
     await sql.query(`insert into Tbl_assetsdata(assests_id, entryon)Values('${id}', getDate())`)

   res.send('Assests Inserted')
   }
   else {
     await sql.query(`update Tbl_assetsdata set updatedon = getDate() where assests_id='${id}'`)

     res.send('Assests Updated')
}
    }
  catch(err){
      console.log(`Error occured ${err}`)
  }
}
)


app.get('/whname', async (req,res)=>{
try{
  const pool = new sql.ConnectionPool(sqlConfig);
  await pool.connect();  
      const result = await pool.query(`select WHname from tbl_whmaster tw`);
      await pool.close()
  res.send(result.recordset)
}
catch(err){
  console.log(err)
}
})


app.post('/totalassets',async (req,res)=>{
  const location = req.body.location
  console.log(location)
  try{
    const pool = new sql.ConnectionPool(sqlConfig1);
    await pool.connect();   
   const result = await pool.query(`select count(id) as total from Asset where Location='${location}'`)
   await pool.close()
    res.send(result.recordset[0])
  }
  catch(err){
    res.send('error')
  }
})


app.listen(Port, (err, req, res, next) => {
    if (err)
      console.log("Ouch! Something went wrong")
    console.log(`server listen on: ${Port}`)
  })