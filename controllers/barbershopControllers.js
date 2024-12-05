



const setup = (req, res) => {
    // const { name, description } = req.body;

    console.log("body: ", req.body);
    console.log("files: ", req.files);
    res.json({message: "SET UP"});
}



const profile = (req, res) => {
    
    res.json({message: "PROFILE"});
}



module.exports = { setup, profile }