import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
// import { Document } from "@langchain/core/documents";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import 'dotenv/config'

import { CharacterTextSplitter } from "@langchain/textsplitters";
import { Worker } from 'bullmq';
// import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";


const worker = new Worker('pdf-rag-queue', async job => {

    console.log(`processing job ${job}`);

    const data = JSON.parse(job.data);
    console.log(data);

    const pdfLoader = new PDFLoader(data.path);
    const docs = await pdfLoader.load();

    const textSplitter = new CharacterTextSplitter({
        separator: "\n",
        chunkSize: 1000,
        chunkOverlap: 200,
    });
    const textSplitDocs = await textSplitter.splitDocuments(docs);

    // console.log("Text split done");
    // console.log(textSplitDocs);


    const embeddings = new OpenAIEmbeddings({
        apiKey: process.env.OPENAI_API_KEY,
        model: "text-embedding-ada-002",
      });

    // console.log(embeddings);

    try {
        

        const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
            url: process.env.QDRANT_URL,
            collectionName: "langchainjs-testing",
        });

        await vectorStore.addDocuments(textSplitDocs);

        // console.log("Documents added to vector store");
    } catch (error) {
        console.error("Error creating vector store:", error);
    }


}, {
    concurrency: 100,
    connection: {
        host: 'localhost',
        port: 6379,
    }
});

worker.on('completed', job => {
    console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
    console.log(`Job ${job.id} failed`);
});

