const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
const corsConfig = {
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS", "PUT"],
};
app.use(cors(corsConfig));
app.use(cors());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vhaictv.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const toyCollection = client.db("khelaGhor").collection("toys");

        // add a toy
        app.post("/addtoy", async (req, res) => {
            const toy = req.body;
            console.log(toy);
            const result = await toyCollection.insertOne(toy);
            res.send(result);
        });

        // get toys
        app.get("/toys", async (req, res) => {
            let query = {};
            if (req.query.name) {
                query = { ToyName: req.query.name };
            }
            const cursor = toyCollection.find(query).limit(20);
            const toys = await cursor.toArray();
            res.send(toys);
        });
        // get toys on tab (categorical data load)
        app.get("/toys/:category", async(req,res) =>{
            const category = req.params.category;
            console.log(category);
            query = { Category: category };
            const cursor = toyCollection.find(query).limit(6);
            const toys = await cursor.toArray();
            res.send(toys);
        })

        // mytoys
        app.get("/mytoys", async (req, res) => {
            const query = { SellerEmail: req.query.email };
            const sortType = req.query.sort;
            console.log(sortType);
            if (sortType == "asc") {
                const cursor = await toyCollection
                    .find(query)
                    .sort({ Price: 1 })
                    .toArray();
                return res.send(cursor);
            } else if (sortType == "desc") {
                const cursor = await toyCollection
                    .find(query)
                    .sort({ Price: -1 })
                    .toArray();
                return res.send(cursor);
            } else {
                const cursor = await toyCollection.find(query).toArray();
                return res.send(cursor);
            }
        });
        // delete my toy
        app.delete("/mytoys/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toyCollection.deleteOne(query);
            res.send(result);
        });
        // edit a toy
        app.put("/edittoy/:id", async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const filter = { _id: new ObjectId(id) };
            const {
                PictureUrl,
                ToyName,
                SellerName,
                SellerEmail,
                Price,
                Quantity,
                Rating,
                Description,
                Category,
            } = req.body;
            const updateDoc = {
                $set: {
                    PictureUrl,
                    ToyName,
                    SellerName,
                    SellerEmail,
                    Price,
                    Quantity,
                    Rating,
                    Description,
                    Category,
                },
            };
            console.log("hitted ", id);
            const result = await toyCollection.updateOne(filter, updateDoc);
            res.send(result);
        });
        // get a toy
        app.get("/toy/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toyCollection.findOne(query);
            res.send(result);
        });

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log(
            "Pinged your deployment. You successfully connected to MongoDB!"
        );
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("Khela ghor Server is Running...");
});

app.listen(port, () => {
    console.log(`Khela ghor Server Running on PORT:  ${port}`);
});
