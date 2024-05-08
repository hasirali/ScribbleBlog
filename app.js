const express = require('express');
const app = express();

app.set('view engine', 'ejs')
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname + '/public')));

app.get('/' , (req,res)=>{
    res.send('Hello World');
})

app.listen(3000,()=>{
    console.log('Server is running on port 3000')
})