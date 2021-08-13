const mongoose = require('mongoose')

async function initiateDB(){
    try{
        let connection = await mongoose.connect(
            `${process.env.DB_ADDRESS}/${process.env.DB_COLLECTION}?${process.env.DB_SETTINGS}`, 
            { 
                useNewUrlParser: true, 
                useUnifiedTopology: true,
                useCreateIndex: true,
                //retryWrites: false,
            }
        )

        console.log(` ✓ Connected Database through local port address(es) [${process.env.DB_ADDRESS}]`)
        return connection
    }
    catch(err){
        console.log(err)
        return false
    }
}

let connection = initiateDB()

exports.connection = connection
