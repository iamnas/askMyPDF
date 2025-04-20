import express from 'express';
import cors from 'cors';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' })


const app = express()
app.use(express.json())
app.use(cors())
const PORT = 8000


app.get('/',(req,res)=>{
    return res.json({
        message:`all good`
    })
})

app.post('/upload/pdf',upload.single('pdf'),(req,res)=>{
    return res.json({
        message:`uploaded successfully`
    })
})

app.listen(PORT,()=>{
    console.log(` server is listening on http://localhost:${PORT}`);
    
})