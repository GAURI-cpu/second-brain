const express = require("express");
const cors= require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/",(req,res)=>{
    res.send("Backend is running");
});

app.listen(5000,()=>{
    console.log("server is running on 5000")
});

// adding the text from fontend to backend
let notes=[];
app.post("/add-note",(req,res)=>{
    const {text} = req.body;
    const tags= text.match(/#\w+/g)||[];
    const cleanText=text.replace(/#\w+/g, "").trim();

    const note={
        id: Date.now(),
        text:cleanText,
        tags:tags.map(tag=>tag.slice(1))||[],
        createdAt:new Date()
    }
     console.log(note);
    notes.push(note);
   

    res.json({message : "note-added",note});
});

app.get("/notes",(req,res)=>{
    res.json(notes);
})

app.delete("/delete-note/:id",(req,res)=>{
    const id= Number(req.params.id);
    notes= notes.filter((note)=>note.id!=id);
    console.log("delete:",id);
    res.json({message:"Note Deleted"});
})