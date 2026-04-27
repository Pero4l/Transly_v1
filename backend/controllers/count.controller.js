const {Users, Shipment} = require("../models")

const countAll = async (req, res) => {
    
    try {
        const allUsers = await Users.count()
        const allShipment = await Shipment.count();
        
        res.status(200).json({ 
            success: true, 
            allUsers, 
            allShipment,
            message: "Gotten all Count successfully"
         });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = {countAll};