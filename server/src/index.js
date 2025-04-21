import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { Queue } from 'bullmq';
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";

import  OpenAI  from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


const queue = new Queue('pdf-rag-queue', {
  connection: {
    host: 'localhost',
    port: 6379,
  }
});


const storage = multer.diskStorage({

  destination: function (req, file, cb) {
    cb(null, 'src/uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, `${uniqueSuffix} - ${file.originalname}`)
  }
})

const upload = multer({ storage: storage })


const app = express()
app.use(express.json())
app.use(cors())
const PORT = 8000


app.get('/', (req, res) => {
  return res.json({
    message: `all good`
  })
})

app.post('/upload/pdf', upload.single('pdf'), async (req, res) => {

  await queue.add('file-ready', JSON.stringify({
    fileName: req.file.originalname,
    destination: req.file.destination,
    path: req.file.path
  }));
  return res.json({
    message: `uploaded successfully`
  })
})

app.get('/chat', async (req, res) => {

  const {message} = req.body;

  const embeddings = new OpenAIEmbeddings({
    apiKey: process.env.OPENAI_API_KEY,
    model: "text-embedding-3-small",
  });
  const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
    url: process.env.QDRANT_URL,
    collectionName: "langchainjs-testing",
  });


  const retriever = vectorStore.asRetriever({
    k: 2,
  });
  const result = await retriever.invoke(message);

  const SYSTEM_PROMPT = `You are a helpful assistant that answers questions based on the provided context. If you don't know the answer, say "I don't know".
  
  Context: ${JSON.stringify(result)}`;

  const chatResult = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: message }],
    temperature: 0.5,
    max_tokens: 1000,
  });

  return res.json({
    message: chatResult.choices[0].message.content,
    context: result
  })
})

app.listen(PORT, () => {
  console.log(` server is listening on http://localhost:${PORT}`);

})