import express from 'express';
import cors from 'cors';

const app = express()
app.use(express.json())
app.use(cors())
const PORT = 8000


app.get('/',(req,res)=>{
    return res.json({
        message:`all good`
    })
})

app.post('/upload/pdf')

app.listen(PORT,()=>{
    console.log(` server is listening on http://localhost:${PORT}`);
    
})